import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface WSClient {
  ws: WebSocket;
  userId: string;
  role: string;
  rooms: Set<string>;
}

interface WSMessage {
  type: 'auth' | 'subscribe' | 'unsubscribe' | 'message' | 'broadcast';
  payload: any;
  room?: string;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      
      ws.on('message', async (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          await this.handleMessage(clientId, ws, message);
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            payload: { message: 'Invalid message format' } 
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(clientId);
      });

      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'welcome', 
        payload: { clientId, message: 'Connected to TotHub real-time service' } 
      }));
    });
  }

  private async handleMessage(clientId: string, ws: WebSocket, message: WSMessage) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(clientId, ws, message.payload);
        break;
        
      case 'subscribe':
        this.handleSubscribe(clientId, message.room || '');
        break;
        
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.room || '');
        break;
        
      case 'message':
        this.handleRoomMessage(clientId, message.room || '', message.payload);
        break;
        
      case 'broadcast':
        this.handleBroadcast(clientId, message.payload);
        break;
        
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          payload: { message: 'Unknown message type' } 
        }));
    }
  }

  private async handleAuth(clientId: string, ws: WebSocket, payload: { token: string }) {
    try {
      const decoded = jwt.verify(payload.token, process.env.JWT_SECRET || 'secret') as any;
      
      // Verify user exists
      const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      
      if (user.length === 0) {
        ws.send(JSON.stringify({ 
          type: 'auth_error', 
          payload: { message: 'Invalid user' } 
        }));
        return;
      }

      // Store authenticated client
      this.clients.set(clientId, {
        ws,
        userId: decoded.userId,
        role: decoded.role,
        rooms: new Set()
      });

      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        payload: { userId: decoded.userId, role: decoded.role } 
      }));

      // Auto-subscribe to relevant rooms
      this.autoSubscribeToRooms(clientId, decoded.role);
      
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        payload: { message: 'Authentication failed' } 
      }));
    }
  }

  private autoSubscribeToRooms(clientId: string, role: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Subscribe to role-based rooms
    const autoRooms = ['all', `role:${role}`];
    
    if (role === 'director' || role === 'admin') {
      autoRooms.push('staff', 'alerts', 'compliance');
    } else if (role === 'staff' || role === 'teacher') {
      autoRooms.push('staff', 'schedules');
    } else if (role === 'parent') {
      autoRooms.push('parents', 'announcements');
    }

    autoRooms.forEach(room => this.handleSubscribe(clientId, room));
  }

  private handleSubscribe(clientId: string, room: string) {
    const client = this.clients.get(clientId);
    if (!client || !room) return;

    // Add client to room
    client.rooms.add(room);
    
    // Add room to rooms map
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)?.add(clientId);

    client.ws.send(JSON.stringify({ 
      type: 'subscribed', 
      payload: { room } 
    }));
  }

  private handleUnsubscribe(clientId: string, room: string) {
    const client = this.clients.get(clientId);
    if (!client || !room) return;

    // Remove client from room
    client.rooms.delete(room);
    this.rooms.get(room)?.delete(clientId);

    // Clean up empty rooms
    if (this.rooms.get(room)?.size === 0) {
      this.rooms.delete(room);
    }

    client.ws.send(JSON.stringify({ 
      type: 'unsubscribed', 
      payload: { room } 
    }));
  }

  private handleRoomMessage(clientId: string, room: string, payload: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.rooms.has(room)) {
      client?.ws.send(JSON.stringify({ 
        type: 'error', 
        payload: { message: 'Not subscribed to room' } 
      }));
      return;
    }

    this.broadcastToRoom(room, {
      type: 'room_message',
      room,
      payload,
      sender: client.userId,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  private handleBroadcast(clientId: string, payload: any) {
    const client = this.clients.get(clientId);
    if (!client || (client.role !== 'director' && client.role !== 'admin')) {
      client?.ws.send(JSON.stringify({ 
        type: 'error', 
        payload: { message: 'Unauthorized to broadcast' } 
      }));
      return;
    }

    this.broadcastToAll({
      type: 'broadcast',
      payload,
      sender: client.userId,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all rooms
    client.rooms.forEach(room => {
      this.rooms.get(room)?.delete(clientId);
      if (this.rooms.get(room)?.size === 0) {
        this.rooms.delete(room);
      }
    });

    // Remove client
    this.clients.delete(clientId);
  }

  // Public methods for server-side broadcasting
  public broadcastToRoom(room: string, message: any, excludeClientId?: string) {
    const roomClients = this.rooms.get(room);
    if (!roomClients) return;

    const messageStr = JSON.stringify(message);
    
    roomClients.forEach(clientId => {
      if (clientId === excludeClientId) return;
      
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  public broadcastToAll(message: any, excludeClientId?: string) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client, clientId) => {
      if (clientId === excludeClientId) return;
      
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  public broadcastCheckIn(childName: string, time: string) {
    this.broadcastToRoom('all', {
      type: 'check_in',
      payload: {
        childName,
        time,
        message: `${childName} has been checked in at ${time}`
      }
    });
  }

  public broadcastAlert(alert: { type: string; message: string; severity: string }) {
    this.broadcastToRoom('alerts', {
      type: 'alert',
      payload: alert
    });
  }

  public broadcastRatioUpdate(room: string, ratio: number, compliant: boolean) {
    this.broadcastToRoom('compliance', {
      type: 'ratio_update',
      payload: {
        room,
        ratio,
        compliant,
        message: compliant ? 
          `${room} is within ratio compliance (${ratio.toFixed(1)}:1)` : 
          `⚠️ ${room} is out of ratio compliance (${ratio.toFixed(1)}:1)`
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectionCount(): number {
    return this.clients.size;
  }

  public getRoomCount(room: string): number {
    return this.rooms.get(room)?.size || 0;
  }
}