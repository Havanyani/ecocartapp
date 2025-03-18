/**
 * MessageHandling.ts
 * Consolidated message handling utilities for the EcoCart app.
 * This file combines functionality from:
 * - MessageQueue.ts
 * - MessageValidation.ts
 * - MessageCompression.ts
 * - MessageEncryption.ts
 */

import { z } from 'zod';

// Message Types and Interfaces
export interface WebSocketMessage {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export enum MessagePriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface QueuedMessage {
  id: string;
  message: WebSocketMessage;
  priority: MessagePriority;
  attempts: number;
  maxAttempts: number;
  timestamp: number;
}

export interface MessageQueueConfig {
  maxQueueSize: number;
  maxRetries: number;
  retryDelay: number;
  messageTimeout: number;
}

export interface MessageValidationConfig {
  maxMessageAge: number;
  messageCount: number;
}

export interface CompressionOptions {
  level?: number; // 1-9, where 9 is maximum compression
  threshold?: number; // Only compress messages larger than this size (in bytes)
}

export interface EncryptionOptions {
  algorithm?: string;
  keySize?: number;
}

// Validation schemas
const messageSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  payload: z.unknown(),
  timestamp: z.number().int().positive(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

// Error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class QueueFullError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueueFullError';
  }
}

// Message Queue Implementation
export class MessageQueue {
  private queue: QueuedMessage[] = [];
  private config: MessageQueueConfig = {
    maxQueueSize: 1000,
    maxRetries: 3,
    retryDelay: 1000,
    messageTimeout: 30000
  };

  constructor(config?: Partial<MessageQueueConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Add a message to the queue
   */
  public enqueue(
    message: WebSocketMessage,
    priority: MessagePriority = MessagePriority.MEDIUM,
    maxAttempts: number = this.config.maxRetries
  ): string {
    if (this.queue.length >= this.config.maxQueueSize) {
      // If queue is full, try to remove expired or low priority messages
      this.cleanQueue();
      
      if (this.queue.length >= this.config.maxQueueSize) {
        throw new QueueFullError('Message queue is full');
      }
    }

    const queuedMessage: QueuedMessage = {
      id: message.id,
      message,
      priority,
      attempts: 0,
      maxAttempts,
      timestamp: Date.now()
    };

    this.queue.push(queuedMessage);
    this.sortQueue();

    return message.id;
  }

  /**
   * Get the next message from the queue
   */
  public dequeue(): QueuedMessage | undefined {
    if (this.queue.length === 0) return undefined;
    
    // Sort to ensure we get highest priority first
    this.sortQueue();
    
    return this.queue.shift();
  }

  /**
   * Mark a message as processed (remove from queue)
   */
  public markProcessed(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== id);
    return this.queue.length < initialLength;
  }

  /**
   * Mark a message for retry
   */
  public markForRetry(id: string): boolean {
    const message = this.queue.find(item => item.id === id);
    
    if (!message) return false;
    
    message.attempts += 1;
    
    if (message.attempts >= message.maxAttempts) {
      // Remove if max attempts reached
      this.markProcessed(id);
      return false;
    }
    
    // Move to the end of the queue
    this.queue = this.queue.filter(item => item.id !== id);
    this.queue.push(message);
    
    return true;
  }

  /**
   * Get the current queue length
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  public clearQueue(): void {
    this.queue = [];
  }

  /**
   * Clean the queue by removing expired messages
   */
  private cleanQueue(): void {
    const now = Date.now();
    
    // Remove expired messages
    this.queue = this.queue.filter(
      item => now - item.timestamp < this.config.messageTimeout
    );
    
    // If still too many, remove low priority messages
    if (this.queue.length >= this.config.maxQueueSize) {
      // Sort by priority and timestamp
      this.sortQueue();
      
      // Trim the queue to max size
      this.queue = this.queue.slice(0, this.config.maxQueueSize);
    }
  }

  /**
   * Sort the queue by priority and timestamp
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First by priority
      const priorityOrder = this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
      if (priorityOrder !== 0) return priorityOrder;
      
      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Get numeric value for priority for sorting
   */
  private getPriorityValue(priority: MessagePriority): number {
    switch (priority) {
      case MessagePriority.HIGH:
        return 3;
      case MessagePriority.MEDIUM:
        return 2;
      case MessagePriority.LOW:
        return 1;
      default:
        return 0;
    }
  }
}

// Message Validation Implementation
export class MessageValidation {
  private static config: MessageValidationConfig = {
    maxMessageAge: 5 * 60 * 1000, // 5 minutes
    messageCount: 0
  };

  /**
   * Configure the validation settings
   */
  public static configure(config: Partial<MessageValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Validate an outgoing message
   */
  public static async validateOutgoing(message: unknown): Promise<boolean> {
    try {
      // Validate structure
      const result = messageSchema.safeParse(message);
      if (!result.success) {
        throw new ValidationError('Invalid message structure');
      }

      const typedMessage = result.data as WebSocketMessage;
      
      // Validate message type
      if (!typedMessage.type || typedMessage.type.trim() === '') {
        throw new ValidationError('Invalid message type');
      }
      
      // Validate timestamp
      const timestamp = typedMessage.timestamp;
      if (timestamp > Date.now() || timestamp < Date.now() - this.config.maxMessageAge) {
        throw new ValidationError('Invalid message timestamp');
      }
      
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Message validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate an incoming message
   */
  public static async validateIncoming(message: unknown): Promise<boolean> {
    try {
      // Validate structure
      const result = messageSchema.safeParse(message);
      if (!result.success) {
        throw new ValidationError('Invalid message structure');
      }

      const typedMessage = result.data as WebSocketMessage;
      
      // Validate message type
      if (!typedMessage.type || typedMessage.type.trim() === '') {
        throw new ValidationError('Invalid message type');
      }
      
      // Validate timestamp
      const timestamp = typedMessage.timestamp;
      if (timestamp < Date.now() - this.config.maxMessageAge) {
        throw new ValidationError('Message timestamp too old');
      }
      
      // Increment message count
      this.config.messageCount++;
      
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Message validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the current message count
   */
  public static getMessageCount(): number {
    return this.config.messageCount;
  }

  /**
   * Reset the message count
   */
  public static resetMessageCount(): void {
    this.config.messageCount = 0;
  }
}

// Message Compression Implementation
export class MessageCompression {
  private static defaultOptions: CompressionOptions = {
    level: 6,
    threshold: 1024 // 1KB
  };

  /**
   * Compress a message if it exceeds the threshold size
   */
  public static async compressMessage(
    message: WebSocketMessage,
    options: CompressionOptions = {}
  ): Promise<WebSocketMessage> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Convert message to string
    const messageString = JSON.stringify(message);
    
    // Check if message exceeds threshold
    if (messageString.length < mergedOptions.threshold!) {
      return message;
    }
    
    try {
      // In a real implementation, we would use a compression library
      // For this example, we'll just add a flag to indicate compression
      return {
        ...message,
        metadata: {
          ...message.metadata,
          compressed: true,
          originalSize: messageString.length,
          compressionLevel: mergedOptions.level
        }
      };
    } catch (error) {
      console.error('Compression failed:', error);
      return message;
    }
  }

  /**
   * Decompress a message if it was compressed
   */
  public static async decompressMessage(message: WebSocketMessage): Promise<WebSocketMessage> {
    // Check if message is compressed
    if (!message.metadata?.compressed) {
      return message;
    }
    
    try {
      // In a real implementation, we would use a decompression library
      // For this example, we'll just remove the compression flag
      const { compressed, originalSize, compressionLevel, ...restMetadata } = 
        message.metadata as { compressed: boolean; originalSize: number; compressionLevel: number; [key: string]: unknown };
      
      return {
        ...message,
        metadata: Object.keys(restMetadata).length > 0 ? restMetadata : undefined
      };
    } catch (error) {
      console.error('Decompression failed:', error);
      return message;
    }
  }
}

// Message Encryption Implementation
export class MessageEncryption {
  private static defaultOptions: EncryptionOptions = {
    algorithm: 'AES-GCM',
    keySize: 256
  };

  /**
   * Encrypt a message
   */
  public static async encryptMessage(
    message: WebSocketMessage,
    options: EncryptionOptions = {}
  ): Promise<WebSocketMessage> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // In a real implementation, we would use a crypto library
      // For this example, we'll just add a flag to indicate encryption
      return {
        ...message,
        metadata: {
          ...message.metadata,
          encrypted: true,
          algorithm: mergedOptions.algorithm
        }
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return message;
    }
  }

  /**
   * Decrypt a message
   */
  public static async decryptMessage(message: WebSocketMessage): Promise<WebSocketMessage> {
    // Check if message is encrypted
    if (!message.metadata?.encrypted) {
      return message;
    }
    
    try {
      // In a real implementation, we would use a crypto library
      // For this example, we'll just remove the encryption flag
      const { encrypted, algorithm, ...restMetadata } = 
        message.metadata as { encrypted: boolean; algorithm: string; [key: string]: unknown };
      
      return {
        ...message,
        metadata: Object.keys(restMetadata).length > 0 ? restMetadata : undefined
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      return message;
    }
  }
}

// Export a singleton instance of MessageQueue for easy access
export const messageQueue = new MessageQueue();

// Export default for convenience
export default {
  MessageQueue,
  MessageValidation,
  MessageCompression,
  MessageEncryption,
  messageQueue
}; 