import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { AnalyticsService } from './AnalyticsService';

interface MessageMetrics {
  sent: number;
  received: number;
  failed: number;
  compressed: number;
  avgMessageSize: number;
  totalSize: number;
}

interface ConnectionMetrics {
  connects: number;
  disconnects: number;
  reconnectAttempts: number;
  avgConnectTime: number;
  totalConnectTime: number;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface ErrorContext {
  category: string;
  [key: string]: any;
}

export class WebSocketAnalytics {
  private static messageMetrics: MessageMetrics = {
    sent: 0,
    received: 0,
    failed: 0,
    compressed: 0,
    avgMessageSize: 0,
    totalSize: 0
  };

  private static connectionMetrics: ConnectionMetrics = {
    connects: 0,
    disconnects: 0,
    reconnectAttempts: 0,
    avgConnectTime: 0,
    totalConnectTime: 0
  };

  static trackMessageSent(message: WebSocketMessage, size: number): void {
    try {
      this.messageMetrics.sent++;
      this.messageMetrics.totalSize += size;
      this.messageMetrics.avgMessageSize = 
        this.messageMetrics.totalSize / (this.messageMetrics.sent + this.messageMetrics.received);

      AnalyticsService.trackEvent('websocket_message', 'sent', message.type, size);
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  static trackMessageReceived(message: WebSocketMessage, size: number): void {
    try {
      this.messageMetrics.received++;
      this.messageMetrics.totalSize += size;
      this.messageMetrics.avgMessageSize = 
        this.messageMetrics.totalSize / (this.messageMetrics.sent + this.messageMetrics.received);

      AnalyticsService.trackEvent('websocket_message', 'received', message.type, size);
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  static trackMessageFailed(error: Error, context: ErrorContext): void {
    try {
      this.messageMetrics.failed++;
      AnalyticsService.trackError(error, context);
    } catch (err) {
      PerformanceMonitor.captureError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  static trackConnection(duration: number): void {
    try {
      this.connectionMetrics.connects++;
      this.connectionMetrics.totalConnectTime += duration;
      this.connectionMetrics.avgConnectTime = 
        this.connectionMetrics.totalConnectTime / this.connectionMetrics.connects;

      AnalyticsService.trackEvent('websocket_connection', 'connected', null, duration);
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  static trackDisconnection(reason: string): void {
    try {
      this.connectionMetrics.disconnects++;
      AnalyticsService.trackEvent('websocket_connection', 'disconnected', reason);
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  static getMetrics(): { messages: MessageMetrics; connection: ConnectionMetrics } {
    return {
      messages: { ...this.messageMetrics },
      connection: { ...this.connectionMetrics }
    };
  }

  static resetMetrics(): void {
    this.messageMetrics = {
      sent: 0,
      received: 0,
      failed: 0,
      compressed: 0,
      avgMessageSize: 0,
      totalSize: 0
    };

    this.connectionMetrics = {
      connects: 0,
      disconnects: 0,
      reconnectAttempts: 0,
      avgConnectTime: 0,
      totalConnectTime: 0
    };
  }
} 