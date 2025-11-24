import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits - standard for GCM
  
  // Get encryption key from environment
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }
    return Buffer.from(key, 'hex');
  }

  // Encrypt sensitive data (PII, medical info, etc.)
  static encryptSensitiveData(data: string): { encrypted: string; iv: string; tag: string } {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  // Decrypt sensitive data
  static decryptSensitiveData(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv, { authTagLength: this.AUTH_TAG_LENGTH });
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash passwords with salt
  static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  // Verify password
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToVerify, 'hex'));
  }

  // Generate secure tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash biometric templates for storage
  static hashBiometricTemplate(template: Float32Array): string {
    const buffer = Buffer.from(template.buffer);
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(buffer, salt, 100000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  // Verify biometric template
  static verifyBiometricTemplate(template: Float32Array, stored: string): boolean {
    const [saltHex, hashHex] = stored.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const hash = Buffer.from(hashHex, 'hex');
    
    const buffer = Buffer.from(template.buffer);
    const hashToVerify = crypto.pbkdf2Sync(buffer, salt, 100000, 64, 'sha512');
    
    return crypto.timingSafeEqual(hash, hashToVerify);
  }
}