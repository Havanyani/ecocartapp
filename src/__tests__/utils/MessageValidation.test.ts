import { ErrorHandler } from '../../utils/ErrorHandler';
import {  MessageValidation  } from '../../utils/MessageHandling';

// Mock ErrorHandler
jest.mock('../../utils/ErrorHandler', () => ({
  ErrorHandler: {
    handleError: jest.fn()
  }
}));

describe('MessageValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date.now to return a fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
  });

  describe('validateOutgoing', () => {
    it('validates a valid outgoing message', async () => {
      const validMessage = {
        type: 'test',
        payload: { data: 'test' },
        timestamp: Date.now(),
        userId: 'user123'
      };

      await expect(MessageValidation.validateOutgoing(validMessage)).resolves.toBe(true);
      expect(ErrorHandler.handleError).not.toHaveBeenCalled();
    });

    it('rejects invalid message type', async () => {
      const invalidMessage = {
        type: null,
        payload: {},
        timestamp: Date.now()
      };

      await expect(MessageValidation.validateOutgoing(invalidMessage)).rejects.toThrow('Invalid message type');
      expect(ErrorHandler.handleError).toHaveBeenCalled();
    });

    it('rejects invalid timestamp', async () => {
      const invalidMessage = {
        type: 'test',
        payload: {},
        timestamp: 'invalid'
      };

      await expect(MessageValidation.validateOutgoing(invalidMessage)).rejects.toThrow('Invalid timestamp');
    });

    it('rejects non-object message', async () => {
      await expect(MessageValidation.validateOutgoing('not an object')).rejects.toThrow('Invalid message structure');
    });
  });

  describe('validateIncoming', () => {
    it('validates a valid incoming message', async () => {
      const validMessage = {
        type: 'test',
        payload: {},
        timestamp: Date.now() - 1000
      };

      await expect(MessageValidation.validateIncoming(validMessage)).resolves.toBe(true);
    });

    it('rejects old messages', async () => {
      const oldMessage = {
        type: 'test',
        payload: {},
        timestamp: Date.now() - 400000 // > 5 minutes old
      };

      await expect(MessageValidation.validateIncoming(oldMessage)).rejects.toThrow('Message timestamp too old');
    });

    it('rejects missing timestamp', async () => {
      const invalidMessage = {
        type: 'test',
        payload: {}
      };

      await expect(MessageValidation.validateIncoming(invalidMessage)).rejects.toThrow('Message timestamp too old');
    });
  });

  describe('validateUser', () => {
    it('validates a valid user object', async () => {
      const validUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        preferences: { theme: 'dark' }
      };

      await expect(MessageValidation.validateUser(validUser)).resolves.toBe(true);
    });

    it('rejects invalid email format', async () => {
      const invalidUser = {
        id: 'user123',
        username: 'testuser',
        email: 'invalid-email'
      };

      await expect(MessageValidation.validateUser(invalidUser)).rejects.toThrow('Invalid email address');
    });

    it('rejects missing required fields', async () => {
      const invalidUser = {
        id: 'user123',
        email: 'test@example.com'
      };

      await expect(MessageValidation.validateUser(invalidUser)).rejects.toThrow('Invalid username');
    });

    it('rejects non-object user data', async () => {
      await expect(MessageValidation.validateUser(null)).rejects.toThrow('Invalid user data structure');
    });
  });

  describe('validateStats', () => {
    it('validates valid stats object', async () => {
      const validStats = {
        messageCount: 100,
        bytesTransferred: 1024,
        lastActivity: Date.now() - 1000,
        errors: 0
      };

      await expect(MessageValidation.validateStats(validStats)).resolves.toBe(true);
    });

    it('rejects negative values', async () => {
      const invalidStats = {
        messageCount: -1,
        bytesTransferred: 1024,
        lastActivity: Date.now(),
        errors: 0
      };

      await expect(MessageValidation.validateStats(invalidStats)).rejects.toThrow('Invalid message count');
    });

    it('rejects future lastActivity', async () => {
      const invalidStats = {
        messageCount: 100,
        bytesTransferred: 1024,
        lastActivity: Date.now() + 10000,
        errors: 0
      };

      await expect(MessageValidation.validateStats(invalidStats)).rejects.toThrow('Invalid last activity timestamp');
    });

    it('rejects non-numeric values', async () => {
      const invalidStats = {
        messageCount: '100',
        bytesTransferred: 1024,
        lastActivity: Date.now(),
        errors: 0
      };

      await expect(MessageValidation.validateStats(invalidStats)).rejects.toThrow('Invalid message count');
    });
  });

  describe('error handling', () => {
    it('converts non-Error objects to Error instances', async () => {
      const nonErrorThrowingFn = () => {
        throw 'string error';
      };

      jest.spyOn(MessageValidation as any, 'validateMessageStructure')
        .mockImplementationOnce(nonErrorThrowingFn);

      await expect(MessageValidation.validateOutgoing({})).rejects.toThrow('string error');
      expect(ErrorHandler.handleError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('preserves ValidationError fields', async () => {
      const invalidMessage = {
        type: null,
        payload: {},
        timestamp: Date.now()
      };

      try {
        await MessageValidation.validateOutgoing(invalidMessage);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('ValidationError');
        expect(error.field).toBe('type');
        expect(error.value).toBe(null);
      }
    });
  });
}); 