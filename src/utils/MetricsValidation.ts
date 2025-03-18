import { MetricItem, TimeSeriesMetrics } from '@/types/PerformanceMonitoring';

export class MetricsValidation {
  static validateMetricItem(metric: MetricItem): boolean {
    return (
      typeof metric.latency === 'number' ||
      typeof metric.throughput === 'number' ||
      typeof metric.compressionRatio === 'number'
    );
  }

  static validateTimeSeriesMetrics(metrics: TimeSeriesMetrics): boolean {
    if (typeof metrics !== 'object') return false;

    return Object.entries(metrics).every(([timestamp, metric]) => {
      const time = Number(timestamp);
      return (
        !isNaN(time) &&
        time > 0 &&
        this.validateMetricItem(metric)
      );
    });
  }

  static sanitizeMetrics(metrics: TimeSeriesMetrics): TimeSeriesMetrics {
    return Object.entries(metrics).reduce((acc, [timestamp, metric]) => {
      const time = Number(timestamp);
      if (!isNaN(time) && time > 0 && this.validateMetricItem(metric)) {
        acc[timestamp] = {
          latency: typeof metric.latency === 'number' ? metric.latency : undefined,
          throughput: typeof metric.throughput === 'number' ? metric.throughput : undefined,
          compressionRatio: typeof metric.compressionRatio === 'number' ? metric.compressionRatio : undefined,
          timestamp: time
        };
      }
      return acc;
    }, {} as TimeSeriesMetrics);
  }
} 