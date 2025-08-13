import crypto from 'crypto';
import { EncryptionService } from './encryptionService';

export interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'backup_codes';
  enabled: boolean;
  verified: boolean;
  metadata?: any;
}

export interface TOTPSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class MFAService {
  private static readonly TOTP_WINDOW = 1; // Allow 1 step before/after current
  private static readonly BACKUP_CODE_COUNT = 10;

  // Generate TOTP secret and QR code
  static generateTOTPSetup(userId: string, issuer: string = 'TotHub'): TOTPSetup {
    const secret = this.generateTOTPSecret();
    const qrCode = this.generateQRCode(userId, secret, issuer);
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  // Verify TOTP code
  static verifyTOTP(secret: string, token: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000 / 30);
    
    // Check current time and window around it
    for (let i = -this.TOTP_WINDOW; i <= this.TOTP_WINDOW; i++) {
      const timeStep = currentTime + i;
      const expectedToken = this.generateTOTPToken(secret, timeStep);
      
      if (crypto.timingSafeEqual(
        Buffer.from(token.padStart(6, '0')), 
        Buffer.from(expectedToken)
      )) {
        return true;
      }
    }
    
    return false;
  }

  // Generate TOTP token for given time
  private static generateTOTPToken(secret: string, timeStep: number): string {
    const key = Buffer.from(secret, 'base32' as BufferEncoding);
    const time = Buffer.alloc(8);
    time.writeUInt32BE(timeStep, 4);
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(time);
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0x0f;
    const code = (hash.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    
    return code.toString().padStart(6, '0');
  }

  // Generate TOTP secret
  private static generateTOTPSecret(): string {
    const buffer = crypto.randomBytes(20);
    return buffer.toString('base32' as BufferEncoding).replace(/=/g, '');
  }

  // Generate QR code URL for TOTP
  private static generateQRCode(userId: string, secret: string, issuer: string): string {
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30',
    });
    
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userId)}?${params}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  }

  // Generate backup codes
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  // Verify backup code
  static verifyBackupCode(storedCodes: string[], providedCode: string, usedCodes: string[]): boolean {
    const normalizedCode = providedCode.replace(/[-\s]/g, '').toUpperCase();
    
    // Check if code exists and hasn't been used
    const codeExists = storedCodes.some(code => 
      code.replace(/[-\s]/g, '').toUpperCase() === normalizedCode
    );
    
    const codeNotUsed = !usedCodes.some(code => 
      code.replace(/[-\s]/g, '').toUpperCase() === normalizedCode
    );
    
    return codeExists && codeNotUsed;
  }

  // Send SMS verification code
  static async sendSMSCode(phoneNumber: string): Promise<{ success: boolean; code?: string }> {
    const code = crypto.randomInt(100000, 999999).toString();
    
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`SMS Code for ${phoneNumber}: ${code}`);
    
    // For demo purposes, return the code
    return { success: true, code };
  }

  // Send email verification code
  static async sendEmailCode(email: string): Promise<{ success: boolean; code?: string }> {
    const code = crypto.randomInt(100000, 999999).toString();
    
    // In production, integrate with email service
    console.log(`Email Code for ${email}: ${code}`);
    
    return { success: true, code };
  }

  // Verify SMS/Email code
  static verifySMSEmailCode(storedCode: string, providedCode: string, timestamp: number): boolean {
    const now = Date.now();
    const codeAge = now - timestamp;
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    if (codeAge > maxAge) {
      return false; // Code expired
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(storedCode),
      Buffer.from(providedCode)
    );
  }

  // Check if user needs MFA
  static requiresMFA(userRole: string, action: string): boolean {
    const highPrivilegeActions = [
      'delete_child',
      'export_data',
      'modify_payroll',
      'access_biometric_data',
      'modify_security_settings',
      'bulk_delete',
    ];
    
    const adminOnlyActions = [
      'manage_users',
      'system_settings',
      'security_audit',
      'compliance_export',
    ];

    if (adminOnlyActions.includes(action)) {
      return userRole === 'admin';
    }

    if (highPrivilegeActions.includes(action)) {
      return ['admin', 'manager'].includes(userRole);
    }

    // Biometric actions always require MFA
    if (action.includes('biometric')) {
      return true;
    }

    return false;
  }

  // Generate session token after successful MFA
  static generateMFASessionToken(userId: string, methods: string[]): string {
    const payload = {
      userId,
      mfaMethods: methods,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    const token = EncryptionService.generateSecureToken(32);
    // In production, store this mapping in Redis or database
    console.log(`MFA Session token generated for ${userId}:`, token);
    
    return token;
  }

  // Validate MFA session token
  static validateMFASessionToken(token: string): { valid: boolean; userId?: string; methods?: string[] } {
    // In production, validate against stored mapping
    // For now, return valid for demo
    return { 
      valid: true, 
      userId: 'demo-user', 
      methods: ['totp', 'backup_codes'] 
    };
  }

  // Get MFA requirements for user role
  static getMFARequirements(userRole: string): {
    required: boolean;
    recommendedMethods: string[];
    minimumMethods: number;
  } {
    switch (userRole) {
      case 'admin':
        return {
          required: true,
          recommendedMethods: ['totp', 'backup_codes', 'sms'],
          minimumMethods: 2,
        };
      case 'manager':
        return {
          required: true,
          recommendedMethods: ['totp', 'backup_codes'],
          minimumMethods: 1,
        };
      case 'staff':
        return {
          required: false,
          recommendedMethods: ['totp', 'sms'],
          minimumMethods: 1,
        };
      case 'parent':
        return {
          required: false,
          recommendedMethods: ['sms', 'email'],
          minimumMethods: 1,
        };
      default:
        return {
          required: false,
          recommendedMethods: ['email'],
          minimumMethods: 1,
        };
    }
  }
}