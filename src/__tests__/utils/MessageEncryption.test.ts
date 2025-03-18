import { Buffer } from 'buffer';
import { ErrorHandler } from '../../utils/ErrorHandler';
import {  MessageEncryption  } from '../../utils/MessageHandling';

// Mock crypto functions
jest.mock('crypto', () => ({
  createCipheriv: jest.fn(() => ({
    update: jest.fn().mockReturnValue('encrypted-data'),
    final: jest.fn().mockReturnValue(''),
    getAuthTag: jest.fn().mockReturnValue(Buffer.from('auth-tag'))
  })),
  createDecipheriv: jest.fn(() => ({
    update: jest.fn().mockReturnValue('decrypted-data'),
    final: jest.fn().mockReturnValue(''),
    setAuthTag: jest.fn()
  })),
  randomBytes: jest.fn((size: number) => Buffer.from('a'.repeat(size))),
  scrypt: jest.fn((
    password: string | Buffer,
    salt: Buffer,
    keylen: number,
    callback: (err: Error | null, derivedKey?: Buffer) => void
  ) => {
    callback(null, Buffer.from('derived-key'.padEnd(keylen, '-')));
  })
}));

// Mock ErrorHandler
jest.mock('../../utils/ErrorHandler', () => ({
  ErrorHandler: {
    handleError: jest.fn()
  }
}));

describe('MessageEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default configuration
    MessageEncryption.configure({
      algorithm: 'aes-256-gcm',
      keySize: 32,
      ivSize: 16,
      enabled: true
    });
  });

  describe('configure', () => {
    it('updates configuration correctly', () => {
      MessageEncryption.configure({
        algorithm: 'aes-256-cbc',
        enabled: false
      });

      // Test by attempting to encrypt (should pass through)
      return expect(MessageEncryption.encrypt('test')).resolves.toBe('test');
    });

    it('maintains default values when not overridden', () => {
      const originalConfig = {
        algorithm: 'aes-256-gcm',
        keySize: 32,
        ivSize: 16,
        enabled: true
      };

      MessageEncryption.configure({
        enabled: false
      });

      // Only enabled should change
      return expect(MessageEncryption.encrypt('test')).resolves.toBe('test');
    });
  });

  describe('initialization', () => {
    it('initializes with password correctly', async () => {
      await MessageEncryption.initialize('test-password');
      expect(MessageEncryption.encrypt('test')).resolves.toBeDefined();
    });

    it('handles initialization errors', async () => {
      const mockError = new Error('Scrypt failed');
      jest.requireMock('crypto').scrypt.mockImplementationOnce(
        (
          _password: string | Buffer,
          _salt: Buffer,
          _keylen: number,
          callback: (err: Error | null, derivedKey?: Buffer) => void
        ) => callback(mockError)
      );

      await expect(MessageEncryption.initialize('test')).rejects.toThrow('Failed to initialize encryption');
      expect(ErrorHandler.handleError).toHaveBeenCalled();
    });

    it('generates new salt when not provided', async () => {
      await MessageEncryption.initialize('test-password');
      const randomBytes = jest.requireMock('crypto').randomBytes;
      expect(randomBytes).toHaveBeenCalledWith(16);
    });
  });

  describe('encrypt', () => {
    beforeEach(async () => {
      await MessageEncryption.initialize('test-password');
    });

    it('returns original message when encryption is disabled', async () => {
      MessageEncryption.configure({ enabled: false });
      const message = 'test-message';
      const result = await MessageEncryption.encrypt(message);
      expect(result).toBe(message);
    });

    it('encrypts messages with GCM mode', async () => {
      const message = 'test-message';
      const result = await MessageEncryption.encrypt(message);
      
      // Format should be iv:authTag:encrypted
      expect(result.split(':').length).toBe(3);
    });

    it('encrypts messages with CBC mode', async () => {
      MessageEncryption.configure({ algorithm: 'aes-256-cbc' });
      const message = 'test-message';
      const result = await MessageEncryption.encrypt(message);
      
      // Format should be iv:encrypted
      expect(result.split(':').length).toBe(2);
    });

    it('throws when not initialized', async () => {
      MessageEncryption.configure({}); // Reset derived key
      await expect(MessageEncryption.encrypt('test')).rejects.toThrow('Encryption not initialized');
    });

    it('handles encryption errors', async () => {
      const mockCipher = {
        update: jest.fn().mockImplementation(() => {
          throw new Error('Cipher update failed');
        }),
        final: jest.fn(),
        getAuthTag: jest.fn()
      };
      jest.requireMock('crypto').createCipheriv.mockReturnValueOnce(mockCipher);

      await expect(MessageEncryption.encrypt('test')).rejects.toThrow('Message encryption failed');
      expect(ErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('decrypt', () => {
    beforeEach(async () => {
      await MessageEncryption.initialize('test-password');
    });

    it('returns original message when encryption is disabled', async () => {
      MessageEncryption.configure({ enabled: false });
      const message = 'test-message';
      const result = await MessageEncryption.decrypt(message);
      expect(result).toBe(message);
    });

    it('decrypts GCM encrypted messages', async () => {
      const encrypted = 'iv:auth:data';
      const result = await MessageEncryption.decrypt(encrypted);
      expect(result).toBe('decrypted-data');
    });

    it('decrypts CBC encrypted messages', async () => {
      MessageEncryption.configure({ algorithm: 'aes-256-cbc' });
      const encrypted = 'iv:data';
      const result = await MessageEncryption.decrypt(encrypted);
      expect(result).toBe('decrypted-data');
    });

    it('throws on invalid message format', async () => {
      const invalidMessage = 'invalid-format';
      await expect(MessageEncryption.decrypt(invalidMessage)).rejects.toThrow('Invalid encrypted message format');
    });

    it('handles decryption errors', async () => {
      const mockDecipher = {
        update: jest.fn().mockImplementation(() => {
          throw new Error('Decipher update failed');
        }),
        final: jest.fn(),
        setAuthTag: jest.fn()
      };
      jest.requireMock('crypto').createDecipheriv.mockReturnValueOnce(mockDecipher);

      await expect(MessageEncryption.decrypt('iv:auth:data')).rejects.toThrow('Message decryption failed');
      expect(ErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('reinitializes encryption with new password', async () => {
      await MessageEncryption.initialize('old-password');
      await MessageEncryption.changePassword('new-password');
      
      // Should be able to encrypt with new password
      const result = await MessageEncryption.encrypt('test');
      expect(result).toBeDefined();
      expect(result.split(':').length).toBe(3); // iv:authTag:encrypted
    });

    it('handles password change errors', async () => {
      const mockError = new Error('Password change failed');
      jest.requireMock('crypto').scrypt.mockImplementationOnce(
        (
          _password: string | Buffer,
          _salt: Buffer,
          _keylen: number,
          callback: (err: Error | null, derivedKey?: Buffer) => void
        ) => callback(mockError)
      );

      await expect(MessageEncryption.changePassword('new-password')).rejects.toThrow('Failed to initialize encryption');
    });
  });

  describe('generateKey', () => {
    it('generates keys of specified length', () => {
      const length = 24;
      const key = MessageEncryption.generateKey(length);
      expect(Buffer.from(key, 'base64').length).toBe(length);
    });

    it('uses default length when not specified', () => {
      const key = MessageEncryption.generateKey();
      expect(Buffer.from(key, 'base64').length).toBe(32);
    });
  });

  describe('Error handling', () => {
    it('creates EncryptionError with original error', async () => {
      const originalError = new Error('Original error');
      jest.requireMock('crypto').createCipheriv.mockImplementationOnce(() => {
        throw originalError;
      });

      try {
        await MessageEncryption.encrypt('test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('EncryptionError');
        expect(error.message).toBe('Message encryption failed');
        expect(error.originalError).toBe(originalError);
      }
    });

    it('handles non-Error objects in catch blocks', async () => {
      jest.requireMock('crypto').createCipheriv.mockImplementationOnce(() => {
        throw 'String error'; // Non-Error object
      });

      try {
        await MessageEncryption.encrypt('test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('EncryptionError');
        expect(error.originalError).toBeInstanceOf(Error);
        expect(error.originalError.message).toBe('String error');
      }
    });
  });
}); 