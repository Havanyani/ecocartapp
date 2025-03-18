import { ErrorHandler } from '@/utils/ErrorHandler';
import {  MessagePriority, MessageQueue, QueuedMessage  } from '@/utils/MessageHandling';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { WebSocketAnalytics } from './WebSocketAnalytics';
import { WebSocketService } from './WebSocketService';

interface BatchConfig {
  maxSize: number;
  flushInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

interface BatchStats {
  totalMessages: number;
  avgBatchSize: number;
  successRate: number;
  lastFlushTime: number;
}

interface BatchedMessage {
  timestamp: number;
  [key: string]: any;
}

interface BatchPayload {
  type: 'BATCH';
  messages: BatchedMessage[];
  timestamp: number;
}

export class MessageBatchService {
  private static instance: MessageBatchService | null = null;
  private static readonly DEFAULT_CONFIG: BatchConfig = {
    maxSize: 100,
    flushInterval: 5000,
    retryAttempts: 3,
    retryDelay: 1000
  };

  private config: BatchConfig;
  private batch: QueuedMessage[];
  private flushTimer: NodeJS.Timeout | null;
  private stats: BatchStats;

  private static batchQueue: BatchedMessage[] = [];
  private static batchSize: number = 10;
  private static batchTimeout: number = 1000; // 1 second
  private static timeoutId: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = { ...MessageBatchService.DEFAULT_CONFIG };
    this.batch = [];
    this.flushTimer = null;
    this.stats = {
      totalMessages: 0,
      avgBatchSize: 0,
      successRate: 1,
      lastFlushTime: 0
    };
    this.startFlushTimer();
  }

  static getInstance(): MessageBatchService {
    if (!MessageBatchService.instance) {
      MessageBatchService.instance = new MessageBatchService();
    }
    return MessageBatchService.instance;
  }

  configure(config: Partial<BatchConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    // Restart timer with new interval if changed
    if (config.flushInterval && this.flushTimer) {
      this.stopFlushTimer();
      this.startFlushTimer();
    }
  }

  async addMessage(message: Omit<QueuedMessage, 'retries' | 'id'>): Promise<void> {
    try {
      if (this.batch.length >= this.config.maxSize) {
        await this.flush();
      }

      const queuedMessage: QueuedMessage = {
        ...message,
        retries: 0,
        id: Math.random().toString(36).substring(2)
      };

      this.batch.push(queuedMessage);
      this.updateStats('add');

      WebSocketAnalytics.trackMessageSent({
        type: message.type,
        size: JSON.stringify(message).length
      });

    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Failed to add message to batch'));
      throw error;
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    try {
      const messages = [...this.batch];
      this.batch = [];

      await Promise.all(
        messages.map(msg =>
          MessageQueue.enqueue(msg, MessagePriority.MEDIUM)
        )
      );

      this.updateStats('flush');
      this.stats.lastFlushTime = Date.now();

    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Failed to flush message batch'));
      throw error;
    }
  }

  getStats(): BatchStats {
    return { ...this.stats };
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(
      () => this.flush(),
      this.config.flushInterval
    );
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private updateStats(operation: 'add' | 'flush'): void {
    if (operation === 'add') {
      this.stats.totalMessages++;
      this.stats.avgBatchSize = this.stats.totalMessages / (this.stats.totalMessages + 1);
    } else {
      this.stats.successRate = (this.stats.successRate * this.stats.totalMessages + 1) / (this.stats.totalMessages + 1);
    }
  }

  async destroy(): Promise<void> {
    this.stopFlushTimer();
    await this.flush();
    MessageBatchService.instance = null;
  }

  static async addToBatch(message: Record<string, any>): Promise<void> {
    try {
      this.batchQueue.push({
        ...message,
        timestamp: Date.now()
      });

      if (this.batchQueue.length >= this.batchSize) {
        await this.sendBatch();
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.sendBatch(), this.batchTimeout);
      }
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to add message to batch'));
    }
  }

  static async sendBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    try {
      const batch: BatchPayload = {
        type: 'BATCH',
        messages: this.batchQueue,
        timestamp: Date.now()
      };

      await WebSocketService.sendMessage('BATCH', batch);
      this.batchQueue = [];
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to send batch'));
    }
  }

  static setBatchSize(size: number): void {
    this.batchSize = size;
  }

  static setTimeout(timeout: number): void {
    this.batchTimeout = timeout;
  }

  static clearBatch(): void {
    this.batchQueue = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
} 