import * as Sentry from '@sentry/react-native';

interface WebSocketMetric {
  timestamp: number;
  value: number;
}

interface WebSocketMetricsSummary {
  averageLatency: number;
  averageCompressionRatio: number;
  averageProcessingTime: number;
  averageBatchSize: number;
  totalMetrics: number;
}

export class WebSocketPerformance {
  private static metrics: {
    messageLatency: WebSocketMetric[];
    connectionLatency: WebSocketMetric[];
    processingTime: WebSocketMetric[];
    compressionRatio: WebSocketMetric[];
    batchSize: WebSocketMetric[];
  } = {
    messageLatency: [],
    connectionLatency: [],
    processingTime: [],
    compressionRatio: [],
    batchSize: []
  };

  private static readonly MAX_METRICS = 1000;

  public static resetMetrics(): void {
    this.metrics = {
      messageLatency: [],
      connectionLatency: [],
      processingTime: [],
      compressionRatio: [],
      batchSize: []
    };
  }

  public static trackMessageLatency(messageId: string, latency: number): void {
    this.addMetric('messageLatency', latency);
  }

  public static trackCompression(originalSize: number, compressedSize: number): void {
    const ratio = compressedSize / originalSize;
    this.addMetric('compressionRatio', ratio);
  }

  public static trackProcessingTime(operation: string, time: number): void {
    this.addMetric('processingTime', time);
  }

  public static trackBatch(size: number): void {
    this.addMetric('batchSize', size);
  }

  private static addMetric(type: keyof typeof this.metrics, value: number): void {
    const metric: WebSocketMetric = {
      timestamp: Date.now(),
      value
    };
    
    this.metrics[type].push(metric);
    if (this.metrics[type].length > this.MAX_METRICS) {
      this.metrics[type].shift();
    }
  }

  public static getMetricsSummary(): WebSocketMetricsSummary {
    return {
      averageLatency: this.calculateAverage('messageLatency'),
      averageCompressionRatio: this.calculateAverage('compressionRatio'),
      averageProcessingTime: this.calculateAverage('processingTime'),
      averageBatchSize: this.calculateAverage('batchSize'),
      totalMetrics: this.metrics.messageLatency.length
    };
  }

  private static calculateAverage(type: keyof typeof this.metrics): number {
    const metrics = this.metrics[type];
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  static trackMessage(type: 'send' | 'receive', latency: number, messageSize: number): void {
    const metric: WebSocketMetric = {
      timestamp: Date.now(),
      value: latency
    };

    this.metrics.messageLatency.push(metric);

    // Keep only the last MAX_METRICS entries
    if (this.metrics.messageLatency.length > this.MAX_METRICS) {
      this.metrics.messageLatency = this.metrics.messageLatency.slice(-this.MAX_METRICS);
    }
  }

  static trackProcessingTime(operation: string, duration: number): void {
    const metric: WebSocketMetric = {
      timestamp: Date.now(),
      value: duration
    };

    this.metrics.processingTime.push(metric);

    // Keep only the last MAX_METRICS entries
    if (this.metrics.processingTime.length > this.MAX_METRICS) {
      this.metrics.processingTime = this.metrics.processingTime.slice(-this.MAX_METRICS);
    }
  }

  static connectionEstablished(): void {
    // This method is not used in the new implementation
  }

  static connectionClosed(): void {
    // This method is not used in the new implementation
  }

  static getMetricsSummary(timeWindow: number = 60000): WebSocketMetricsSummary {
    const now = Date.now();
    const recentMetrics = this.metrics.messageLatency.filter(m => now - m.timestamp <= timeWindow);
    
    const totalLatency = recentMetrics.reduce((acc, m) => acc + m.value, 0);

    return {
      averageLatency: recentMetrics.length ? totalLatency / recentMetrics.length : 0,
      averageCompressionRatio: this.calculateAverage('compressionRatio'),
      averageProcessingTime: this.calculateAverage('processingTime'),
      averageBatchSize: this.calculateAverage('batchSize'),
      totalMetrics: recentMetrics.length
    };
  }

  static clearMetrics(): void {
    this.metrics = {
      messageLatency: [],
      connectionLatency: [],
      processingTime: [],
      compressionRatio: [],
      batchSize: []
    };
  }

  static captureError(error: Error): void {
    Sentry.captureException(error);
  }

  static getConnectionStatus(): 'connected' | 'disconnected' {
    // This method is not used in the new implementation
    return 'disconnected';
  }
}

export default WebSocketPerformance;