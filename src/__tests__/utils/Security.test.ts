import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Security } from '../../utils/Security';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn().mockImplementation((size) => 
    Promise.resolve(Buffer.from('a'.repeat(size))),
  ),
  digestStringAsync: jest.fn().mockImplementation((_, data) => 
    Promise.resolve(`hash_of_${data}`),
  ),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA-256'
  }
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

describe('Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Security.configure({
      enableEncryption: true,
      enableSecureStorage: true,
      maxLoginAttempts: 3,
      lockoutDuration: 1000, // 1 second for testing
      passwordPolicy: {
        minLength: 8,
        requireUpperCase: true,
        requireLowerCase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommonPasswords: true,
        maxAge: 90,
        preventReuse: 3
      }
    });
  });

  describe('Password Validation', () => {
    it('validates strong passwords correctly', () => {
      const strongPassword = 'StrongP@ss123';
      expect(Security.isStrongPassword(strongPassword)).toBe(true);
    });

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'short1',           // Too short
        'nouppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoSpecialChars1', // No special chars
        'NoNumbers@Pass',  // No numbers
        'password123',     // Common password
      ];

      weakPasswords.forEach(password => {
        expect(Security.isStrongPassword(password)).toBe(false);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('allows initial attempts', async () => {
      const result = await Security.checkRateLimit('user1');
      expect(result.allowed).toBe(true);
    });

    it('blocks after max attempts', async () => {
      const identifier = 'user2';
      
      // Make max attempts
      for (let i = 0; i < 3; i++) {
        await Security.checkRateLimit(identifier);
      }

      // Next attempt should be blocked
      const result = await Security.checkRateLimit(identifier);
      expect(result.allowed).toBe(false);
      expect(result.waitTime).toBeDefined();
    });

    it('resets after lockout period', async () => {
      const identifier = 'user3';
      
      // Max out attempts
      for (let i = 0; i < 3; i++) {
        await Security.checkRateLimit(identifier);
      }

      // Wait for lockout to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const result = await Security.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
    });

    it('allows reset of rate limit', async () => {
      const identifier = 'user4';
      
      // Max out attempts
      for (let i = 0; i < 3; i++) {
        await Security.checkRateLimit(identifier);
      }

      Security.resetRateLimit(identifier);

      // Should be allowed after reset
      const result = await Security.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Encryption and Hashing', () => {
    it('generates and verifies hashes', async () => {
      const data = 'test-data';
      const hash = await Security.generateHash(data);
      const isValid = await Security.verifyHash(data, hash);
      expect(isValid).toBe(true);
    });

    it('encrypts and decrypts data', async () => {
      const data = 'sensitive-data';
      const key = 'encryption-key';
      
      const encrypted = await Security.encrypt(data, key);
      expect(encrypted).toBeDefined();
      expect(encrypted.includes('.')).toBe(true);

      const decrypted = await Security.decrypt(encrypted, key);
      expect(decrypted).toBeDefined();
    });

    it('fails encryption when disabled', async () => {
      Security.configure({ enableEncryption: false });
      
      await expect(Security.encrypt('data', 'key'))
        .rejects
        .toThrow('Encryption is disabled');
    });
  });

  describe('Secure Storage', () => {
    it('stores and retrieves secure items', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await Security.storeSecureItem(key, value);
      expect(SecureStore.setItemAsync).toHaveBeenCalled();

      await Security.getSecureItem(key);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key);
    });

    it('fails when secure storage is disabled', async () => {
      Security.configure({ enableSecureStorage: false });
      
      await expect(Security.storeSecureItem('key', 'value'))
        .rejects
        .toThrow('Secure storage is disabled');
    });

    it('removes secure items', async () => {
      const key = 'test-key';
      await Security.removeSecureItem(key);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
    });
  });

  describe('Token Management', () => {
    it('generates valid tokens', async () => {
      const userId = 'test-user';
      const tokenData = await Security.generateToken(userId);

      expect(tokenData.token).toBeDefined();
      expect(tokenData.expiresAt).toBeGreaterThan(Date.now());
      expect(tokenData.refreshToken).toBeDefined();
    });

    it('validates tokens correctly', async () => {
      const futureDate = Date.now() + 1000;
      const pastDate = Date.now() - 1000;

      const validResult = await Security.validateToken('token', futureDate);
      expect(validResult).toBe(true);

      const invalidResult = await Security.validateToken('token', pastDate);
      expect(invalidResult).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('removes dangerous characters', async () => {
      const inputs = [
        '<script>alert("xss")</script>',
        'quote"test\'test',
        'semicolon;test',
        '  trimmed  '
      ];

      const sanitized = await Promise.all(
        inputs.map(input => Security.sanitizeInput(input))
      );

      expect(sanitized[0]).not.toContain('<script>');
      expect(sanitized[1]).not.toContain('"');
      expect(sanitized[1]).not.toContain("'");
      expect(sanitized[2]).not.toContain(';');
      expect(sanitized[3]).toBe('trimmed');
    });
  });

  describe('Random String Generation', () => {
    it('generates strings of correct length', async () => {
      const length = 16;
      const randomString = await Security.generateSecureRandomString(length);
      expect(randomString).toHaveLength(length);
    });

    it('generates different strings each time', async () => {
      // Mock random bytes to return different values
      (Crypto.getRandomBytesAsync as jest.Mock).mockImplementation(() =>
        Promise.resolve(Buffer.from(Math.random().toString()))
      );

      const string1 = await Security.generateSecureRandomString(16);
      const string2 = await Security.generateSecureRandomString(16);
      expect(string1).not.toBe(string2);
    });
  });

  describe('Configuration', () => {
    it('merges configurations correctly', () => {
      const newConfig = {
        maxLoginAttempts: 5,
        passwordPolicy: {
          minLength: 10,
          requireUpperCase: true,
          requireLowerCase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          preventCommonPasswords: true,
          maxAge: 90,
          preventReuse: 3
        }
      };

      Security.configure(newConfig);

      // Test a protected method by accessing it through a public method
      const result = Security.isStrongPassword('Short1@');
      expect(result).toBe(false); // Should fail due to new minLength
    });

    it('maintains default values when not overridden', () => {
      const partialConfig = {
        maxLoginAttempts: 5
      };

      Security.configure(partialConfig);

      // Password policy should retain default values
      const strongPassword = 'StrongP@ss123';
      expect(Security.isStrongPassword(strongPassword)).toBe(true);
    });
  });
}); 