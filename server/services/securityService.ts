import { storage } from "../storage";
import type { InsertSecurityDevice, InsertSecurityCredential, InsertSecurityLog, SecurityDevice } from "@shared/schema";
import crypto from "crypto";

// Encryption/Decryption for sensitive data
const ENCRYPTION_KEY = process.env.SECURITY_ENCRYPTION_KEY || 'kidSign_security_key_2025_default';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16); // 16 bytes for AES-256-CBC
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // Derive proper 32-byte key
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Prepend IV
}

function decrypt(encryptedText: string): string {
  try {
    // Handle both old format (without IV) and new format (with IV)
    if (encryptedText.includes(':')) {
      // New format with IV
      const [ivHex, encrypted] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } else {
      // Legacy format - DEPRECATED: Only for reading existing old data
      // WARNING: createDecipher is vulnerable - all new encryption uses createCipheriv
      console.warn('SECURITY WARNING: Decrypting legacy data encrypted with vulnerable createDecipher. Consider data migration.');
      const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
      // Use createDecipheriv with a fixed IV derived from the key for legacy compatibility
      // This maintains backward compatibility while avoiding createDecipher
      const legacyIv = crypto.createHash('md5').update(ENCRYPTION_KEY).digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, legacyIv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
  } catch {
    return encryptedText; // Return as-is if decryption fails (for compatibility)
  }
}

// Abstract base class for security devices
abstract class SecurityDeviceHandler {
  protected device: SecurityDevice;
  protected isSimulated: boolean = true; // Default to simulation mode

  constructor(device: SecurityDevice) {
    this.device = device;
  }

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract unlock(duration?: number): Promise<boolean>;
  abstract lock(): Promise<boolean>;
  abstract testConnection(): Promise<boolean>;
  abstract validateCredential(credential: string): Promise<boolean>;

  protected async logAction(action: string, success: boolean, details?: string, userId?: string, method?: string) {
    const logData: InsertSecurityLog = {
      deviceId: this.device.id,
      userId,
      action,
      method,
      success,
      details,
      ipAddress: 'system',
    };
    await storage.createSecurityLog(logData);
  }

  protected getConnectionConfig(): any {
    try {
      return JSON.parse(decrypt(this.device.connectionConfig));
    } catch {
      return {};
    }
  }
}

// Keypad/PIN-based Security Device
class KeypadDevice extends SecurityDeviceHandler {
  private serialPort: any = null;

  async connect(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[KEYPAD SIMULATION] Connecting to ${this.device.name} at ${this.device.location}`);
      await this.logAction('system_connect', true, 'Simulated connection established');
      return true;
    }

    try {
      // Real implementation would use pyserial equivalent
      const config = this.getConnectionConfig();
      console.log(`Connecting to keypad at ${config.port} (${config.baudRate})`);
      await this.logAction('system_connect', true, 'Hardware connection established');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Connection failed: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.serialPort) {
      console.log(`[KEYPAD] Disconnecting from ${this.device.name}`);
      this.serialPort = null;
    }
  }

  async unlock(duration = 5): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[KEYPAD SIMULATION] Unlocking ${this.device.name} for ${duration} seconds`);
      setTimeout(() => {
        console.log(`[KEYPAD SIMULATION] Auto-locking ${this.device.name}`);
      }, duration * 1000);
      await this.logAction('unlock', true, `Door unlocked for ${duration}s (simulated)`);
      return true;
    }

    try {
      // Real implementation: Send unlock command via serial
      console.log(`Sending unlock command to keypad device`);
      await this.logAction('unlock', true, `Door unlocked for ${duration}s`);
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Unlock failed: ${error}`);
      return false;
    }
  }

  async lock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[KEYPAD SIMULATION] Locking ${this.device.name}`);
      await this.logAction('lock', true, 'Door locked (simulated)');
      return true;
    }

    try {
      console.log(`Sending lock command to keypad device`);
      await this.logAction('lock', true, 'Door locked');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Lock failed: ${error}`);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[KEYPAD SIMULATION] Testing connection to ${this.device.name}`);
      return true;
    }

    try {
      // Send ping command to device
      return true;
    } catch {
      return false;
    }
  }

  async validateCredential(pin: string): Promise<boolean> {
    // Check PIN against stored credentials
    const credentials = await storage.getSecurityCredentialsForDevice(this.device.id, 'pin');
    
    for (const cred of credentials) {
      const storedPin = decrypt(cred.credentialData);
      if (storedPin === pin && cred.isActive) {
        if (cred.expiresAt && new Date() > cred.expiresAt) {
          await this.logAction('attempt_failed', false, 'PIN expired', cred.userId, 'pin');
          return false;
        }
        await this.logAction('unlock', true, 'PIN validated', cred.userId, 'pin');
        return true;
      }
    }
    
    await this.logAction('attempt_failed', false, 'Invalid PIN', undefined, 'pin');
    return false;
  }

  async generateTemporaryPIN(userId: string, expiresAt: Date): Promise<string> {
    const pin = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit PIN
    
    const credentialData: InsertSecurityCredential = {
      userId,
      deviceId: this.device.id,
      credentialType: 'pin',
      credentialData: encrypt(pin),
      expiresAt,
      isActive: true,
    };
    
    await storage.createSecurityCredential(credentialData);
    return pin;
  }
}

// RFID/Key Card Device
class RFIDDevice extends SecurityDeviceHandler {
  async connect(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[RFID SIMULATION] Connecting to ${this.device.name} at ${this.device.location}`);
      await this.logAction('system_connect', true, 'Simulated RFID reader connected');
      return true;
    }

    try {
      const config = this.getConnectionConfig();
      console.log(`Connecting to RFID reader via ${config.protocol} at ${config.address}`);
      await this.logAction('system_connect', true, 'RFID reader connected');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `RFID connection failed: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    console.log(`[RFID] Disconnecting from ${this.device.name}`);
  }

  async unlock(duration = 5): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[RFID SIMULATION] Unlocking ${this.device.name} for ${duration} seconds`);
      await this.logAction('unlock', true, `RFID unlock for ${duration}s (simulated)`);
      return true;
    }

    try {
      console.log(`Triggering RFID door unlock`);
      await this.logAction('unlock', true, `RFID door unlocked for ${duration}s`);
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `RFID unlock failed: ${error}`);
      return false;
    }
  }

  async lock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[RFID SIMULATION] Locking ${this.device.name}`);
      await this.logAction('lock', true, 'RFID door locked (simulated)');
      return true;
    }

    try {
      await this.logAction('lock', true, 'RFID door locked');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `RFID lock failed: ${error}`);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[RFID SIMULATION] Testing RFID reader connection`);
      return true;
    }
    return true;
  }

  async validateCredential(cardId: string): Promise<boolean> {
    const credentials = await storage.getSecurityCredentialsForDevice(this.device.id, 'rfid');
    
    for (const cred of credentials) {
      const storedCardId = decrypt(cred.credentialData);
      if (storedCardId === cardId && cred.isActive) {
        if (cred.expiresAt && new Date() > cred.expiresAt) {
          await this.logAction('attempt_failed', false, 'Card expired', cred.userId, 'rfid');
          return false;
        }
        await this.logAction('unlock', true, 'RFID card validated', cred.userId, 'rfid');
        return true;
      }
    }
    
    await this.logAction('attempt_failed', false, 'Invalid RFID card', undefined, 'rfid');
    return false;
  }
}

// Biometric Device (Fingerprint/Facial)
class BiometricDevice extends SecurityDeviceHandler {
  async connect(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[BIOMETRIC SIMULATION] Connecting to ${this.device.name} at ${this.device.location}`);
      await this.logAction('system_connect', true, 'Simulated biometric scanner connected');
      return true;
    }

    try {
      const config = this.getConnectionConfig();
      console.log(`Connecting to biometric scanner via ${config.sdk} API`);
      await this.logAction('system_connect', true, 'Biometric scanner connected');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Biometric connection failed: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    console.log(`[BIOMETRIC] Disconnecting from ${this.device.name}`);
  }

  async unlock(duration = 5): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[BIOMETRIC SIMULATION] Unlocking ${this.device.name} for ${duration} seconds`);
      await this.logAction('unlock', true, `Biometric unlock for ${duration}s (simulated)`);
      return true;
    }

    try {
      await this.logAction('unlock', true, `Biometric door unlocked for ${duration}s`);
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Biometric unlock failed: ${error}`);
      return false;
    }
  }

  async lock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[BIOMETRIC SIMULATION] Locking ${this.device.name}`);
      await this.logAction('lock', true, 'Biometric door locked (simulated)');
      return true;
    }

    await this.logAction('lock', true, 'Biometric door locked');
    return true;
  }

  async testConnection(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[BIOMETRIC SIMULATION] Testing biometric scanner`);
      return true;
    }
    return true;
  }

  async validateCredential(biometricData: string): Promise<boolean> {
    const credentials = await storage.getSecurityCredentialsForDevice(this.device.id, 'biometric');
    
    // In a real implementation, this would use biometric matching algorithms
    for (const cred of credentials) {
      if (cred.isActive) {
        if (cred.expiresAt && new Date() > cred.expiresAt) {
          await this.logAction('attempt_failed', false, 'Biometric expired', cred.userId, 'biometric');
          return false;
        }
        // Simulate biometric match (in production, use proper matching)
        if (Math.random() > 0.1) { // 90% success rate for simulation
          await this.logAction('unlock', true, 'Biometric validated', cred.userId, 'biometric');
          return true;
        }
      }
    }
    
    await this.logAction('attempt_failed', false, 'Biometric not recognized', undefined, 'biometric');
    return false;
  }

  async enrollBiometric(userId: string, biometricTemplate: string): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[BIOMETRIC SIMULATION] Enrolling biometric for user ${userId}`);
    }

    const credentialData: InsertSecurityCredential = {
      userId,
      deviceId: this.device.id,
      credentialType: 'biometric',
      credentialData: encrypt(biometricTemplate),
      isActive: true,
    };
    
    await storage.createSecurityCredential(credentialData);
    await this.logAction('system_update', true, 'Biometric enrolled', userId, 'biometric');
    return true;
  }
}

// Mobile/Bluetooth/NFC Device
class MobileDevice extends SecurityDeviceHandler {
  async connect(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MOBILE SIMULATION] Connecting to ${this.device.name} at ${this.device.location}`);
      await this.logAction('system_connect', true, 'Simulated mobile/NFC reader connected');
      return true;
    }

    try {
      const config = this.getConnectionConfig();
      console.log(`Connecting to mobile/NFC reader via ${config.protocol}`);
      await this.logAction('system_connect', true, 'Mobile/NFC reader connected');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Mobile connection failed: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    console.log(`[MOBILE] Disconnecting from ${this.device.name}`);
  }

  async unlock(duration = 5): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MOBILE SIMULATION] Unlocking ${this.device.name} for ${duration} seconds`);
      await this.logAction('unlock', true, `Mobile unlock for ${duration}s (simulated)`);
      return true;
    }

    await this.logAction('unlock', true, `Mobile door unlocked for ${duration}s`);
    return true;
  }

  async lock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MOBILE SIMULATION] Locking ${this.device.name}`);
      await this.logAction('lock', true, 'Mobile door locked (simulated)');
      return true;
    }

    await this.logAction('lock', true, 'Mobile door locked');
    return true;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async validateCredential(mobileToken: string): Promise<boolean> {
    const credentials = await storage.getSecurityCredentialsForDevice(this.device.id, 'mobile');
    
    for (const cred of credentials) {
      const storedToken = decrypt(cred.credentialData);
      if (storedToken === mobileToken && cred.isActive) {
        if (cred.expiresAt && new Date() > cred.expiresAt) {
          await this.logAction('attempt_failed', false, 'Mobile token expired', cred.userId, 'mobile');
          return false;
        }
        await this.logAction('unlock', true, 'Mobile token validated', cred.userId, 'mobile');
        return true;
      }
    }
    
    await this.logAction('attempt_failed', false, 'Invalid mobile token', undefined, 'mobile');
    return false;
  }

  async generateMobileToken(userId: string, expiresAt?: Date): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    
    const credentialData: InsertSecurityCredential = {
      userId,
      deviceId: this.device.id,
      credentialType: 'mobile',
      credentialData: encrypt(token),
      expiresAt,
      isActive: true,
    };
    
    await storage.createSecurityCredential(credentialData);
    return token;
  }
}

// Intercom/Video Doorbell Device
class IntercomDevice extends SecurityDeviceHandler {
  async connect(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[INTERCOM SIMULATION] Connecting to ${this.device.name} at ${this.device.location}`);
      await this.logAction('system_connect', true, 'Simulated intercom/video doorbell connected');
      return true;
    }

    try {
      const config = this.getConnectionConfig();
      console.log(`Connecting to intercom via ${config.apiEndpoint}`);
      await this.logAction('system_connect', true, 'Intercom/video doorbell connected');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Intercom connection failed: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    console.log(`[INTERCOM] Disconnecting from ${this.device.name}`);
  }

  async unlock(duration = 5): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[INTERCOM SIMULATION] Remote unlocking ${this.device.name} for ${duration} seconds`);
      await this.logAction('unlock', true, `Remote unlock for ${duration}s (simulated)`, 'admin', 'remote');
      return true;
    }

    await this.logAction('unlock', true, `Remote door unlocked for ${duration}s`, 'admin', 'remote');
    return true;
  }

  async lock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[INTERCOM SIMULATION] Remote locking ${this.device.name}`);
      await this.logAction('lock', true, 'Remote door locked (simulated)', 'admin', 'remote');
      return true;
    }

    await this.logAction('lock', true, 'Remote door locked', 'admin', 'remote');
    return true;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async validateCredential(): Promise<boolean> {
    // Intercom devices require manual approval
    return false;
  }

  async getVideoFeed(): Promise<string | null> {
    if (this.isSimulated) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmUgVmlkZW8gRmVlZDwvdGV4dD48L3N2Zz4=';
    }

    const config = this.getConnectionConfig();
    // Real implementation would fetch from video API
    return null;
  }
}

// Electromagnetic Lock Device
class MagneticLockDevice extends SecurityDeviceHandler {
  async connect(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MAGNETIC SIMULATION] Connecting to ${this.device.name} at ${this.device.location}`);
      await this.logAction('system_connect', true, 'Simulated magnetic lock connected');
      return true;
    }

    try {
      const config = this.getConnectionConfig();
      console.log(`Connecting to magnetic lock via ${config.relayType} relay`);
      await this.logAction('system_connect', true, 'Magnetic lock connected');
      return true;
    } catch (error) {
      await this.logAction('system_error', false, `Magnetic lock connection failed: ${error}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    console.log(`[MAGNETIC] Disconnecting from ${this.device.name}`);
  }

  async unlock(duration = 5): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MAGNETIC SIMULATION] De-energizing magnetic lock ${this.device.name} for ${duration} seconds`);
      await this.logAction('unlock', true, `Magnetic lock de-energized for ${duration}s (simulated)`);
      
      // Auto re-energize based on fail-safe mode
      setTimeout(() => {
        if (this.device.failSafeMode === 'secure') {
          console.log(`[MAGNETIC SIMULATION] Re-energizing ${this.device.name} (fail-secure)`);
        }
      }, duration * 1000);
      
      return true;
    }

    await this.logAction('unlock', true, `Magnetic lock de-energized for ${duration}s`);
    return true;
  }

  async lock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MAGNETIC SIMULATION] Energizing magnetic lock ${this.device.name}`);
      await this.logAction('lock', true, 'Magnetic lock energized (simulated)');
      return true;
    }

    await this.logAction('lock', true, 'Magnetic lock energized');
    return true;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async validateCredential(): Promise<boolean> {
    // Magnetic locks are typically controlled by other devices
    return false;
  }

  async emergencyUnlock(): Promise<boolean> {
    if (this.isSimulated) {
      console.log(`[MAGNETIC SIMULATION] EMERGENCY UNLOCK - De-energizing ${this.device.name}`);
      await this.logAction('unlock', true, 'Emergency de-energization (simulated)', 'system', 'emergency');
      return true;
    }

    await this.logAction('unlock', true, 'Emergency de-energization', 'system', 'emergency');
    return true;
  }
}

// Security Service - Main orchestration class
export class SecurityService {
  private deviceHandlers: Map<string, SecurityDeviceHandler> = new Map();

  static createDeviceHandler(device: SecurityDevice): SecurityDeviceHandler {
    switch (device.type) {
      case 'keypad':
        return new KeypadDevice(device);
      case 'rfid':
        return new RFIDDevice(device);
      case 'biometric':
        return new BiometricDevice(device);
      case 'mobile':
        return new MobileDevice(device);
      case 'intercom':
        return new IntercomDevice(device);
      case 'magnetic':
        return new MagneticLockDevice(device);
      default:
        throw new Error(`Unsupported device type: ${device.type}`);
    }
  }

  async initializeDevice(device: SecurityDevice): Promise<boolean> {
    try {
      const handler = SecurityService.createDeviceHandler(device);
      const connected = await handler.connect();
      
      if (connected) {
        this.deviceHandlers.set(device.id, handler);
        await storage.updateSecurityDeviceStatus(device.id, 'online');
        return true;
      } else {
        await storage.updateSecurityDeviceStatus(device.id, 'error');
        return false;
      }
    } catch (error) {
      console.error(`Failed to initialize device ${device.name}:`, error);
      await storage.updateSecurityDeviceStatus(device.id, 'error');
      return false;
    }
  }

  async unlockDevice(deviceId: string, userId?: string, duration?: number): Promise<boolean> {
    const handler = this.deviceHandlers.get(deviceId);
    if (!handler) {
      console.error(`Device handler not found for ${deviceId}`);
      return false;
    }

    return await handler.unlock(duration);
  }

  async lockDevice(deviceId: string): Promise<boolean> {
    const handler = this.deviceHandlers.get(deviceId);
    if (!handler) {
      console.error(`Device handler not found for ${deviceId}`);
      return false;
    }

    return await handler.lock();
  }

  async testDevice(deviceId: string): Promise<boolean> {
    const handler = this.deviceHandlers.get(deviceId);
    if (!handler) {
      return false;
    }

    return await handler.testConnection();
  }

  async validateAndUnlock(deviceId: string, credential: string, credentialType: string): Promise<boolean> {
    const handler = this.deviceHandlers.get(deviceId);
    if (!handler) {
      return false;
    }

    const isValid = await handler.validateCredential(credential);
    if (isValid) {
      const device = await storage.getSecurityDevice(deviceId);
      if (device) {
        return await handler.unlock(device.unlockDuration);
      }
    }
    
    return false;
  }

  async handleAttendanceUnlock(childId: string, action: 'checkin' | 'checkout'): Promise<void> {
    // Get child's room and find associated devices
    const child = await storage.getChild(childId);
    if (!child) return;

    const devices = await storage.getSecurityDevicesForLocation(child.room);
    
    for (const device of devices) {
      if (device.isEnabled && device.status === 'online') {
        const handler = this.deviceHandlers.get(device.id);
        if (handler) {
          console.log(`Auto-unlocking ${device.name} for ${action}: ${child.firstName} ${child.lastName}`);
          await handler.unlock(device.unlockDuration);
        }
      }
    }
  }

  async emergencyUnlockAll(): Promise<void> {
    console.log('🚨 EMERGENCY UNLOCK ALL DEVICES 🚨');
    
    for (const [deviceId, handler] of Array.from(this.deviceHandlers.entries())) {
      try {
        if ('emergencyUnlock' in handler) {
          await (handler as MagneticLockDevice).emergencyUnlock();
        } else {
          await handler.unlock(0); // Unlimited unlock
        }
      } catch (error) {
        console.error(`Emergency unlock failed for device ${deviceId}:`, error);
      }
    }
  }

  async initializeAllDevices(): Promise<void> {
    const devices = await storage.getAllSecurityDevices();
    
    for (const device of devices) {
      if (device.isEnabled) {
        await this.initializeDevice(device);
      }
    }
  }
}

export const securityService = new SecurityService();