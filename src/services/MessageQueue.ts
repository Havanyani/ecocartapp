import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { WebSocketMessage } from './WebSocketService';

export class MessageQueue {
  private static queue: WebSocketMessage[] = [];
  private static readonly MAX_QUEUE_SIZE = 1000;
  private static isProcessing = false;

  static async enqueue(message: WebSocketMessage): Promise<void> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      PerformanceMonitor.addBreadcrumb('message_queue', 'Queue size limit reached, dropping oldest message');
      this.queue.shift();
    }

    this.queue.push(message);
    PerformanceMonitor.addBreadcrumb('message_queue', `Message queued: ${message.type}`);
  }

  static async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const processingStart = Date.now();

    try {
      while (this.queue.length > 0) {
        const message = this.queue[0];
        await this.processMessage(message);
        this.queue.shift();
      }

      PerformanceMonitor.trackResponseTime('queue_processing', processingStart);
    } catch (error) {
      if (error instanceof Error) {
        PerformanceMonitor.captureError(error);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private static async processMessage(message: WebSocketMessage): Promise<void> {
    try {
      const processStart = Date.now();
      // Here you would typically send the message through your WebSocket
      // await WebSocketService.send(message);
      PerformanceMonitor.trackResponseTime('message_processing', processStart);
    } catch (error) {
      if (error instanceof Error) {
        PerformanceMonitor.captureError(error);
        throw error; // Re-throw to handle in processQueue
      }
    }
  }

  static getQueueSize(): number {
    return this.queue.length;
  }

  static clearQueue(): void {
    this.queue = [];
    PerformanceMonitor.addBreadcrumb('message_queue', 'Queue cleared');
  }
} 