import { SafeStorage } from '@/utils/storage';
import { ErrorHandler } from './ErrorHandler';

/**
 * Priority levels for messages
 */
export enum MessagePriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Interface for queued messages
 */
export interface QueuedMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
  id: string;
  priority: MessagePriority;
  expiresAt?: number;
}

/**
 * Interface for queue configuration
 */
interface QueueConfig {
  maxSize: number;
  maxRetries: number;
  retryDelay: number;
  processingInterval: number;
  priorityConfig: {
    [MessagePriority.HIGH]: { weight: number; maxAge?: number };
    [MessagePriority.MEDIUM]: { weight: number; maxAge?: number };
    [MessagePriority.LOW]: { weight: number; maxAge?: number };
  };
}

/**
 * Custom error class for queue operations
 */
class QueueError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'QueueError';
  }
}

/**
 * Utility class for managing message queues with persistence and retry logic
 */
export class MessageQueue {
  private static readonly QUEUE_KEY = '@message_queue';
  private static readonly DEFAULT_CONFIG: QueueConfig = {
    maxSize: 1000,
    maxRetries: 3,
    retryDelay: 5000,
    processingInterval: 1000,
    priorityConfig: {
      [MessagePriority.HIGH]: { weight: 3, maxAge: 300000 }, // 5 minutes
      [MessagePriority.MEDIUM]: { weight: 2, maxAge: 900000 }, // 15 minutes
      [MessagePriority.LOW]: { weight: 1, maxAge: 3600000 }, // 1 hour
    }
  };

  private static queue: QueuedMessage[] = [];
  private static isProcessing = false;
  private static config: QueueConfig = MessageQueue.DEFAULT_CONFIG;
  private static processingInterval: NodeJS.Timeout | null = null;

  /**
   * Configure the message queue
   * @param config - Partial configuration to update
   */
  public static configure(config: Partial<QueueConfig>): void {
    MessageQueue.config = {
      ...MessageQueue.config,
      ...config,
      priorityConfig: {
        ...MessageQueue.config.priorityConfig,
        ...(config.priorityConfig || {})
      }
    };
  }

  /**
   * Add a message to the queue
   * @param message - The message to enqueue
   * @param priority - Priority level for the message
   * @throws {QueueError} If the queue is full or storage fails
   */
  public static async enqueue(
    message: Omit<QueuedMessage, 'retries' | 'id' | 'priority'>,
    priority: MessagePriority = MessagePriority.MEDIUM
  ): Promise<void> {
    try {
      if (MessageQueue.queue.length >= MessageQueue.config.maxSize) {
        // Try to remove expired messages first
        await MessageQueue.removeExpiredMessages();
        
        if (MessageQueue.queue.length >= MessageQueue.config.maxSize) {
          // If still full, try to replace a lower priority message
          if (!await MessageQueue.replaceLowerPriorityMessage(priority)) {
            throw new QueueError('Queue is full', 'QUEUE_FULL');
          }
        }
      }

      const maxAge = MessageQueue.config.priorityConfig[priority].maxAge;
      const queuedMessage: QueuedMessage = {
        ...message,
        retries: 0,
        id: Math.random().toString(36).substring(2),
        priority,
        expiresAt: maxAge ? Date.now() + maxAge : undefined
      };

      MessageQueue.queue.push(queuedMessage);
      MessageQueue.sortQueue();
      await MessageQueue.persistQueue();

      if (!MessageQueue.isProcessing) {
        await MessageQueue.startProcessing();
      }
    } catch (error) {
      const queueError = error instanceof QueueError ? error : new QueueError(
        'Failed to enqueue message',
        'ENQUEUE_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
      ErrorHandler.handleError(queueError);
      throw queueError;
    }
  }

  /**
   * Get messages of a specific priority
   * @param priority - Priority level to filter by
   * @returns Array of messages with the specified priority
   */
  public static async getQueueByPriority(priority: MessagePriority): Promise<QueuedMessage[]> {
    try {
      await MessageQueue.loadQueue();
      return MessageQueue.queue.filter(msg => msg.priority === priority);
    } catch (error) {
      const queueError = new QueueError(
        'Failed to get queue by priority',
        'GET_QUEUE_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
      ErrorHandler.handleError(queueError);
      throw queueError;
    }
  }

  /**
   * Get the current queue contents
   * @returns The current queue
   */
  public static async getQueue(): Promise<QueuedMessage[]> {
    try {
      await MessageQueue.loadQueue();
      return [...MessageQueue.queue];
    } catch (error) {
      const queueError = new QueueError(
        'Failed to get queue',
        'GET_QUEUE_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
      ErrorHandler.handleError(queueError);
      throw queueError;
    }
  }

  /**
   * Get queue statistics
   * @returns Queue statistics including counts by priority
   */
  public static getStats(): {
    total: number;
    byPriority: Record<MessagePriority, number>;
    processing: boolean;
  } {
    const stats = {
      total: MessageQueue.queue.length,
      byPriority: {
        [MessagePriority.HIGH]: 0,
        [MessagePriority.MEDIUM]: 0,
        [MessagePriority.LOW]: 0
      },
      processing: MessageQueue.isProcessing
    };

    MessageQueue.queue.forEach(message => {
      stats.byPriority[message.priority]++;
    });

    return stats;
  }

  /**
   * Clear the message queue
   */
  public static async clearQueue(): Promise<void> {
    try {
      MessageQueue.queue = [];
      await SafeStorage.removeItem(MessageQueue.QUEUE_KEY);
    } catch (error) {
      const queueError = new QueueError(
        'Failed to clear queue',
        'CLEAR_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
      ErrorHandler.handleError(queueError);
      throw queueError;
    }
  }

  /**
   * Start processing the queue
   */
  private static async startProcessing(): Promise<void> {
    if (MessageQueue.isProcessing) {
      return;
    }

    MessageQueue.isProcessing = true;
    MessageQueue.processingInterval = setInterval(
      () => MessageQueue.processQueue(),
      MessageQueue.config.processingInterval
    );
  }

  /**
   * Stop processing the queue
   */
  private static stopProcessing(): void {
    if (MessageQueue.processingInterval) {
      clearInterval(MessageQueue.processingInterval);
      MessageQueue.processingInterval = null;
    }
    MessageQueue.isProcessing = false;
  }

  /**
   * Process messages in the queue
   */
  private static async processQueue(): Promise<void> {
    if (MessageQueue.queue.length === 0) {
      MessageQueue.stopProcessing();
      return;
    }

    const message = MessageQueue.queue[0];

    try {
      await MessageQueue.processMessage(message);
      MessageQueue.queue.shift();
      await MessageQueue.persistQueue();
    } catch (error) {
      message.retries++;

      if (message.retries >= MessageQueue.config.maxRetries) {
        MessageQueue.queue.shift();
        await MessageQueue.persistQueue();
        ErrorHandler.handleError(new QueueError(
          `Message processing failed after ${MessageQueue.config.maxRetries} retries`,
          'MAX_RETRIES_EXCEEDED',
          error instanceof Error ? error : new Error(String(error))
        ));
      } else {
        // Move to end of queue for retry
        MessageQueue.queue.shift();
        MessageQueue.queue.push(message);
        await MessageQueue.persistQueue();
        await new Promise(resolve => setTimeout(resolve, MessageQueue.config.retryDelay));
      }
    }
  }

  /**
   * Process a single message
   * @param message - The message to process
   */
  private static async processMessage(message: QueuedMessage): Promise<void> {
    // This is a placeholder for actual message processing
    // In a real implementation, this would handle the message based on its type
    console.log('Processing message:', message);
  }

  /**
   * Save the queue to persistent storage
   */
  private static async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        MessageQueue.QUEUE_KEY,
        JSON.stringify(MessageQueue.queue)
      );
    } catch (error) {
      throw new QueueError(
        'Failed to persist queue',
        'PERSIST_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Load the queue from persistent storage
   */
  private static async loadQueue(): Promise<void> {
    try {
      const queueData = await SafeStorage.getItem(MessageQueue.QUEUE_KEY);
      if (queueData) {
        MessageQueue.queue = JSON.parse(queueData);
      }
    } catch (error) {
      throw new QueueError(
        'Failed to load queue',
        'LOAD_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Remove expired messages from the queue
   */
  private static async removeExpiredMessages(): Promise<void> {
    const now = Date.now();
    const initialLength = MessageQueue.queue.length;
    
    MessageQueue.queue = MessageQueue.queue.filter(message => 
      !message.expiresAt || message.expiresAt > now
    );

    if (MessageQueue.queue.length < initialLength) {
      await MessageQueue.persistQueue();
    }
  }

  /**
   * Try to replace a lower priority message in the queue
   * @param priority - Priority level of the new message
   * @returns Whether a message was replaced
   */
  private static async replaceLowerPriorityMessage(priority: MessagePriority): Promise<boolean> {
    const priorityWeight = MessageQueue.config.priorityConfig[priority].weight;
    
    // Find the lowest priority message
    const lowestPriorityIndex = MessageQueue.queue.findIndex(message => 
      MessageQueue.config.priorityConfig[message.priority].weight < priorityWeight
    );

    if (lowestPriorityIndex >= 0) {
      MessageQueue.queue.splice(lowestPriorityIndex, 1);
      await MessageQueue.persistQueue();
      return true;
    }

    return false;
  }

  /**
   * Sort the queue based on priority weights and timestamps
   */
  private static sortQueue(): void {
    MessageQueue.queue.sort((a, b) => {
      const weightA = MessageQueue.config.priorityConfig[a.priority].weight;
      const weightB = MessageQueue.config.priorityConfig[b.priority].weight;
      
      if (weightA !== weightB) {
        return weightB - weightA; // Higher weight first
      }
      
      return a.timestamp - b.timestamp; // Older messages first within same priority
    });
  }

  /**
   * Find the correct insert position for a message based on priority
   */
  private static findPriorityInsertIndex(message: QueuedMessage): number {
    const priorityOrder = {
      [MessagePriority.HIGH]: 0,
      [MessagePriority.MEDIUM]: 1,
      [MessagePriority.LOW]: 2
    };

    return MessageQueue.queue.findIndex(queuedMsg => 
      priorityOrder[queuedMsg.priority] > priorityOrder[message.priority]
    );
  }

  // For testing purposes only
  static reset(): void {
    this.queue = [];
    this.isProcessing = false;
  }
} 