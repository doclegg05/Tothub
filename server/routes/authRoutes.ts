import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sessionService } from '../services/sessionService';

const router = Router();

// Mock user database - in production, this would be a real database
// Passwords are properly hashed with bcrypt (salt rounds: 10)
const users = [
  {
    id: '1',
    username: 'director',
    password: process.env.DIRECTOR_PASSWORD_HASH || '$2b$10$EPwXHpTpP.c2FZ0ax2NoIusr6K33F5tkyH0RcuLO.KMhXDHTwc2f6', // admin123
    name: 'Sarah Johnson',
    role: 'director',
    email: 'director@daycare.com',
  },
  {
    id: '2',
    username: 'teacher',
    password: process.env.TEACHER_PASSWORD_HASH || '$2b$10$efyee677K/Pwkc5fNzIGCe9ub2HvShQoVQ7TrlP86O4Q.1dxLWtne', // teacher123
    name: 'Maria Garcia',
    role: 'teacher',
    email: 'teacher@daycare.com',
  },
  {
    id: '3',
    username: 'staff',
    password: process.env.STAFF_PASSWORD_HASH || '$2b$10$2ZfAf8/YZV56dWd8hQBtEuz/vY/Ot/PGUxSQ2IRBXaOuzYG7uSDLW', // staff123
    name: 'John Smith',
    role: 'staff',
    email: 'staff@daycare.com',
  },
];

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const JWT_SECRET = process.env.JWT_SECRET || 'daycare-jwt-secret-2024';

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Create session tracking
    const sessionId = await sessionService.createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Store session ID in express-session
    req.session!.sessionId = sessionId;
    req.session!.userId = user.id;
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword,
      sessionId,
      message: 'Login successful',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: error.errors 
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).session?.sessionId;
    
    if (sessionId) {
      // End the session tracking
      await sessionService.endSession(sessionId, 'logout');
      
      // Destroy express-session
      req.session?.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' }); // Still return success
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get current user profile
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;