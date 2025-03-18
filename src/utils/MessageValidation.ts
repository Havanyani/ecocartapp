import { z } from 'zod';
import { ErrorHandler } from './ErrorHandler';

/**
 * Interface for WebSocket message structure
 */
interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  userId?: string;
}

/**
 * Interface for user data structure
 */
interface UserData {
  id: string;
  username: string;
  email: string;
  preferences?: Record<string, unknown>;
}

/**
 * Interface for statistics data
 */
interface StatsData {
  messageCount: number;
  bytesTransferred: number;
  lastActivity: number;
  errors: number;
}

interface ValidationConfig {
  maxMessageAge: number;
  maxPayloadSize: number;
  allowedTypes: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

const messageSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
  timestamp: z.number(),
  userId: z.string().optional(),
  id: z.string().optional()
});

/**
 * Custom error class for validation failures
 */
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Utility class for validating WebSocket messages and related data
 */
export class MessageValidation {
  private static config: ValidationConfig = {
    maxMessageAge: 5 * 60 * 1000, // 5 minutes
    maxPayloadSize: 1024 * 1024, // 1MB
    allowedTypes: [
      'COLLECTION_STATUS_UPDATE',
      'CREDITS_UPDATE',
      'NEW_ACHIEVEMENT',
      'USER_CONNECTED',
      'USER_DISCONNECTED'
    ]
  };

  static configure(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Validate an outgoing message
   * @param message - The message to validate
   * @throws {ValidationError} If the message is invalid
   */
  public static async validateOutgoing(message: unknown): Promise<boolean> {
    try {
      const result = messageSchema.safeParse(message);
      
      if (!result.success) {
        throw new Error('Invalid message structure');
      }

      const { type, timestamp, payload } = result.data;

      if (!this.config.allowedTypes.includes(type)) {
        throw new Error('Invalid message type');
      }

      if (typeof payload === 'string' && payload.length > this.config.maxPayloadSize) {
        throw new Error('Payload size exceeds limit');
      }

      if (timestamp > Date.now() || timestamp < Date.now() - this.config.maxMessageAge) {
        throw new Error('Invalid timestamp');
      }

      return true;
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Validation failed'));
      throw error;
    }
  }

  /**
   * Validate an incoming message
   * @param message - The message to validate
   * @throws {ValidationError} If the message is invalid
   */
  public static async validateIncoming(message: unknown): Promise<boolean> {
    try {
      const result = messageSchema.safeParse(message);
      
      if (!result.success) {
        throw new Error('Invalid message structure');
      }

      const { type, timestamp, payload } = result.data;

      if (!this.config.allowedTypes.includes(type)) {
        throw new Error('Invalid message type');
      }

      if (typeof payload === 'string' && payload.length > this.config.maxPayloadSize) {
        throw new Error('Payload size exceeds limit');
      }

      if (timestamp < Date.now() - this.config.maxMessageAge) {
        throw new Error('Message timestamp too old');
      }

      return true;
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Validation failed'));
      throw error;
    }
  }

  /**
   * Validate user data
   * @param user - The user data to validate
   * @throws {ValidationError} If the user data is invalid
   */
  public static async validateUser(user: unknown): Promise<boolean> {
    const userSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      username: z.string().min(3).max(50)
    });

    try {
      const result = userSchema.safeParse(user);
      
      if (!result.success) {
        throw new Error('Invalid user data structure');
      }

      return true;
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('User validation failed'));
      throw error;
    }
  }

  /**
   * Validate statistics data
   * @param stats - The statistics data to validate
   * @throws {ValidationError} If the statistics data is invalid
   */
  public static async validateStats(stats: unknown): Promise<boolean> {
    const statsSchema = z.object({
      messageCount: z.number().min(0),
      errorCount: z.number().min(0),
      lastActivity: z.number().max(Date.now())
    });

    try {
      const result = statsSchema.safeParse(stats);
      
      if (!result.success) {
        throw new Error('Invalid stats structure');
      }

      return true;
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Stats validation failed'));
      throw error;
    }
  }

  /**
   * Validate the basic message structure
   * @param message - The message to validate
   * @returns The validated message
   * @throws {ValidationError} If the message structure is invalid
   */
  private static validateMessageStructure(message: unknown): WebSocketMessage {
    if (!message || typeof message !== 'object') {
      throw new ValidationError('Invalid message structure');
    }

    return message as WebSocketMessage;
  }
} 