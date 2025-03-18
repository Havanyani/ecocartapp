import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { ErrorHandler } from './ErrorHandler';

interface SecurityConfig {
  enableEncryption: boolean;
  enableSecureStorage: boolean;
  saltRounds: number;
  tokenExpiration: number; // milliseconds
  maxLoginAttempts: number;
  lockoutDuration: number; // milliseconds
  passwordPolicy: PasswordPolicy;
}

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

interface PasswordPolicy {
  minLength: number;
  requireUpperCase: boolean;
  requireLowerCase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords to check
}

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export class Security {
  private static config: SecurityConfig = {
    enableEncryption: true,
    enableSecureStorage: true,
    saltRounds: 10,
    tokenExpiration: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordPolicy: {
      minLength: 12,
      requireUpperCase: true,
      requireLowerCase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      maxAge: 90, // days
      preventReuse: 5
    }
  };

  private static rateLimits: Map<string, RateLimitEntry> = new Map();
  private static readonly COMMON_PASSWORDS = new Set([
    'password123', 'admin123', '123456789', 'qwerty123'
    // Add more common passwords as needed
  ]);

  static configure(config: Partial<SecurityConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      passwordPolicy: {
        ...this.config.passwordPolicy,
        ...(config.passwordPolicy || {})
      }
    };
  }

  static async generateHash(data: string): Promise<string> {
    try {
      const salt = await Crypto.getRandomBytesAsync(16);
      const saltHex = Buffer.from(salt).toString('hex');
      const key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + saltHex
      );
      return `${key}.${saltHex}`;
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'generateHash' });
      throw error;
    }
  }

  static async verifyHash(data: string, hash: string): Promise<boolean> {
    try {
      const [key, salt] = hash.split('.');
      const verifyKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + salt
      );
      return key === verifyKey;
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'verifyHash' });
      return false;
    }
  }

  static async encrypt(data: string, key: string): Promise<string> {
    try {
      if (!this.config.enableEncryption) {
        throw new Error('Encryption is disabled');
      }
      const iv = await Crypto.getRandomBytesAsync(16);
      const ivHex = Buffer.from(iv).toString('hex');
      const encryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        key
      );
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + encryptionKey + ivHex
      );
      return `${encrypted}.${ivHex}`;
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'encrypt' });
      throw error;
    }
  }

  static async decrypt(encryptedData: string, key: string): Promise<string | null> {
    try {
      if (!this.config.enableEncryption) {
        throw new Error('Encryption is disabled');
      }
      const [encrypted, ivHex] = encryptedData.split('.');
      const encryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        key
      );
      // In a real implementation, you would use a proper encryption algorithm
      // This is a simplified version for demonstration
      return encrypted;
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'decrypt' });
      return null;
    }
  }

  static async storeSecureItem(key: string, value: string): Promise<void> {
    try {
      if (!this.config.enableSecureStorage) {
        throw new Error('Secure storage is disabled');
      }
      const encryptedValue = this.config.enableEncryption
        ? await this.encrypt(value, key)
        : value;
      await SecureStore.setItemAsync(key, encryptedValue);
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'storeSecureItem' });
      throw error;
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      if (!this.config.enableSecureStorage) {
        throw new Error('Secure storage is disabled');
      }
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      
      return this.config.enableEncryption
        ? await this.decrypt(value, key)
        : value;
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'getSecureItem' });
      return null;
    }
  }

  static async removeSecureItem(key: string): Promise<void> {
    try {
      if (!this.config.enableSecureStorage) {
        throw new Error('Secure storage is disabled');
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'removeSecureItem' });
      throw error;
    }
  }

  static async generateToken(userId: string, additionalData?: Record<string, unknown>): Promise<TokenData> {
    try {
      const expiresAt = Date.now() + this.config.tokenExpiration;
      const tokenData = {
        userId,
        expiresAt,
        ...additionalData
      };

      const token = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        JSON.stringify(tokenData)
      );

      const refreshToken = await this.generateHash(token);

      return {
        token,
        expiresAt,
        refreshToken
      };
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'generateToken' });
      throw error;
    }
  }

  static async validateToken(token: string, expiresAt: number): Promise<boolean> {
    try {
      if (Date.now() > expiresAt) {
        return false;
      }

      // Additional validation logic can be added here
      return true;
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'validateToken' });
      return false;
    }
  }

  static async generateSecureRandomString(length: number): Promise<string> {
    try {
      const bytes = await Crypto.getRandomBytesAsync(Math.ceil(length / 2));
      return Buffer.from(bytes).toString('hex').slice(0, length);
    } catch (error) {
      ErrorHandler.handleError(error as Error, { context: 'generateSecureRandomString' });
      throw error;
    }
  }

  static isStrongPassword(password: string): boolean {
    const { passwordPolicy } = this.config;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isCommonPassword = this.COMMON_PASSWORDS.has(password.toLowerCase());

    return (
      password.length >= passwordPolicy.minLength &&
      (!passwordPolicy.requireUpperCase || hasUpperCase) &&
      (!passwordPolicy.requireLowerCase || hasLowerCase) &&
      (!passwordPolicy.requireNumbers || hasNumbers) &&
      (!passwordPolicy.requireSpecialChars || hasSpecialChar) &&
      (!passwordPolicy.preventCommonPasswords || !isCommonPassword)
    );
  }

  static async checkRateLimit(identifier: string): Promise<{ allowed: boolean; waitTime?: number }> {
    const now = Date.now();
    const entry = this.rateLimits.get(identifier) || { attempts: 0, lastAttempt: now };

    // Check if currently locked out
    if (entry.lockedUntil && now < entry.lockedUntil) {
      return {
        allowed: false,
        waitTime: entry.lockedUntil - now
      };
    }

    // Reset attempts if lockout has expired
    if (entry.lockedUntil && now >= entry.lockedUntil) {
      entry.attempts = 0;
      entry.lockedUntil = undefined;
    }

    // Check if max attempts reached
    if (entry.attempts >= this.config.maxLoginAttempts) {
      entry.lockedUntil = now + this.config.lockoutDuration;
      this.rateLimits.set(identifier, entry);
      return {
        allowed: false,
        waitTime: this.config.lockoutDuration
      };
    }

    // Update attempts
    entry.attempts += 1;
    entry.lastAttempt = now;
    this.rateLimits.set(identifier, entry);

    return { allowed: true };
  }

  static resetRateLimit(identifier: string): void {
    this.rateLimits.delete(identifier);
  }

  static async sanitizeInput(input: string): Promise<string> {
    // Remove potentially dangerous characters and normalize
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim()
      .normalize();
  }

  static get securityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}

export default Security; 