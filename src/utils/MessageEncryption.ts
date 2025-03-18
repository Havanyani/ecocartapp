import { Buffer } from 'buffer';
import { CipherGCM, createCipheriv, createDecipheriv, DecipherGCM, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ErrorHandler } from './ErrorHandler';

interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  enabled: boolean;
}

export class MessageEncryption {
  private static config: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keySize: 32,
    ivSize: 16,
    enabled: true
  };

  private static derivedKey: Buffer | null = null;
  private static salt: Buffer | null = null;

  static configure(config: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static async initialize(password: string): Promise<void> {
    try {
      this.salt = randomBytes(16);
      this.derivedKey = await promisify(scrypt)(
        password,
        this.salt,
        this.config.keySize
      ) as Buffer;
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Failed to initialize encryption'));
      throw new Error('Failed to initialize encryption');
    }
  }

  static async encrypt(message: string): Promise<string> {
    if (!this.config.enabled) {
      return message;
    }

    if (!this.derivedKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const iv = randomBytes(this.config.ivSize);
      const cipher = createCipheriv(
        this.config.algorithm,
        this.derivedKey,
        iv
      ) as CipherGCM;

      const encrypted = Buffer.concat([
        cipher.update(message, 'utf8'),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      return Buffer.concat([
        iv,
        authTag,
        encrypted
      ]).toString('base64');
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Message encryption failed'));
      throw new Error('Message encryption failed');
    }
  }

  static async decrypt(encryptedMessage: string): Promise<string> {
    if (!this.config.enabled) {
      return encryptedMessage;
    }

    if (!this.derivedKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const buffer = Buffer.from(encryptedMessage, 'base64');
      
      const iv = buffer.slice(0, this.config.ivSize);
      const authTag = buffer.slice(
        this.config.ivSize,
        this.config.ivSize + 16
      );
      const encrypted = buffer.slice(this.config.ivSize + 16);

      const decipher = createDecipheriv(
        this.config.algorithm,
        this.derivedKey,
        iv
      ) as DecipherGCM;

      decipher.setAuthTag(authTag);

      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]).toString('utf8');
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Message decryption failed'));
      throw new Error('Message decryption failed');
    }
  }

  static async changePassword(newPassword: string): Promise<void> {
    try {
      const oldKey = this.derivedKey;
      await this.initialize(newPassword);
      
      if (!oldKey) {
        throw new Error('Previous encryption key not found');
      }
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Failed to change password'));
      throw new Error('Failed to change password');
    }
  }

  static generateKey(length = 32): string {
    return randomBytes(length).toString('hex');
  }
} 