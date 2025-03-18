import * as Sentry from '@sentry/react-native';
import { PerformanceMonitor } from './PerformanceMonitoring';

interface ErrorRecord {
  message: string;
  timestamp: number;
  stack?: string;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  errorCount: number;
  errorRate: number;
  totalRequests: number;
}

interface Breadcrumb {
  category: string;
  message: string;
  timestamp: number;
}

interface PerformanceMetric {
  timestamp: number;
  value: number;
  type: 'latency' | 'throughput' | 'error_rate';
}

interface PerformanceSummary {
  averageLatency: number;
  averageThroughput: number;
  errorRate: number;
  totalRequests: number;
  timeWindow: number;
}

export class Performance {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;
  private static readonly DEFAULT_WINDOW = 60000; // 1 minute

  static recordMetric(type: PerformanceMetric['type'], value: number): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      value,
      type
    };

    this.metrics.push(metric);

    // Keep only the last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  static trackResponseTime(startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    this.recordMetric('latency', duration);
  }

  static trackError(): void {
    this.recordMetric('error_rate', 1);
  }

  static trackRequest(throughput: number): void {
    this.recordMetric('throughput', throughput);
  }

  static getMetrics(timeWindow: number = this.DEFAULT_WINDOW): PerformanceMetric[] {
    const now = Date.now();
    return this.metrics.filter(m => now - m.timestamp <= timeWindow);
  }

  static getSummary(timeWindow: number = this.DEFAULT_WINDOW): PerformanceSummary {
    const recentMetrics = this.getMetrics(timeWindow);
    const latencyMetrics = recentMetrics.filter(m => m.type === 'latency');
    const throughputMetrics = recentMetrics.filter(m => m.type === 'throughput');
    const errorMetrics = recentMetrics.filter(m => m.type === 'error_rate');

    return {
      averageLatency: this.calculateAverage(latencyMetrics),
      averageThroughput: this.calculateAverage(throughputMetrics),
      errorRate: this.calculateAverage(errorMetrics),
      totalRequests: recentMetrics.length,
      timeWindow
    };
  }

  private static calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  static clearMetrics(): void {
    this.metrics = [];
  }

  static captureError(error: Error): void {
    Sentry.captureException(error);
  }

  static addBreadcrumb(category: string, message: string): void {
    Sentry.addBreadcrumb({
      category,
      message,
      level: 'info'
    });
  }

  static getMetricsSummary(): PerformanceMetrics {
    const summary = this.getSummary();
    return {
      averageResponseTime: summary.averageLatency,
      errorCount: this.metrics.filter(m => m.type === 'error_rate').length,
      errorRate: summary.errorRate,
      totalRequests: summary.totalRequests
    };
  }

  static trackMemoryUsage(bytes: number): void {
    this.recordMetric('throughput', bytes);
  }

  static calculateAverageResponseTime(): number {
    return this.calculateAverage(this.metrics.filter(m => m.type === 'latency'));
  }

  static calculateErrorRate(): number {
    return this.calculateAverage(this.metrics.filter(m => m.type === 'error_rate'));
  }

  static getWebSocketMetrics() {
    return WebSocketPerformance.getMetricsSummary();
  }
}

export class PerformanceMonitor {
  private static breadcrumbs: Breadcrumb[] = [];
  private static metrics: Array<{
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
  }> = [];
  private static readonly MAX_BREADCRUMBS = 100;
  private static readonly MAX_METRICS = 1000;

  static addBreadcrumb(category: string, message: string): void {
    this.breadcrumbs.push({
      category,
      message,
      timestamp: Date.now(),
    });

    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }
  }

  static trackResponseTime(name: string, startTime: number): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.metrics.push({
      name,
      startTime,
      endTime,
      duration,
    });

    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`);
    }
  }

  static captureError(error: Error): void {
    console.error('Error captured:', error);
    
    this.addBreadcrumb('error', error.message);
  }

  static getMetrics() {
    return [...this.metrics];
  }

  static getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  static clearMetrics(): void {
    this.metrics = [];
  }

  static clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }
}

export default Performance; 