import { PerformanceMonitor } from './PerformanceMonitoring';

interface DashboardMetrics {
  activeUsers: number;
  errorRate: number;
  avgResponseTime: number;
  successfulCollections: number;
  failedCollections: number;
}

interface MetricsUpdate extends Partial<DashboardMetrics> {}

export class MonitoringDashboard {
  private static metrics: DashboardMetrics = {
    activeUsers: 0,
    errorRate: 0,
    avgResponseTime: 0,
    successfulCollections: 0,
    failedCollections: 0
  };

  static updateMetrics(newMetrics: MetricsUpdate): void {
    this.metrics = { ...this.metrics, ...newMetrics };
    this.sendToAnalytics();
  }

  static trackError(error: Error): void {
    this.metrics.errorRate++;
    PerformanceMonitor.captureError(error);
  }

  static trackApiCall(endpoint: string, duration: number): void {
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime + duration) / 2;
  }

  static trackCollection(success: boolean): void {
    if (success) {
      this.metrics.successfulCollections++;
    } else {
      this.metrics.failedCollections++;
    }
  }

  static getMetrics(): DashboardMetrics {
    return { ...this.metrics };
  }

  private static sendToAnalytics(): void {
    // Implementation for sending metrics to analytics service
  }
} 