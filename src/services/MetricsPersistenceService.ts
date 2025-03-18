import { SafeStorage } from '@/utils/storage';
import { TimeSeriesMetrics } from '@/types/PerformanceMonitoring';
import { MetricsValidation } from '@/utils/MetricsValidation';

interface LoadOptions {
  start?: number;
  end?: number;
}

export class MetricsPersistenceService {
  private static readonly METRICS_KEY = '@metrics';
  private static readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async saveMetrics(metrics: TimeSeriesMetrics): Promise<void> {
    try {
      if (!MetricsValidation.validateTimeSeriesMetrics(metrics)) {
        throw new Error('Invalid metrics format');
      }
      const sanitizedMetrics = MetricsValidation.sanitizeMetrics(metrics);
      await SafeStorage.setItem(this.METRICS_KEY, JSON.stringify(sanitizedMetrics));
    } catch (error) {
      console.error('Failed to save metrics:', error);
      throw error;
    }
  }

  static async loadMetrics(options: LoadOptions = {}): Promise<TimeSeriesMetrics> {
    try {
      const data = await SafeStorage.getItem(this.METRICS_KEY);
      if (!data) return {};

      const metrics: TimeSeriesMetrics = JSON.parse(data);
      return this.filterMetrics(metrics, options);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      throw error;
    }
  }

  static async clearOldMetrics(): Promise<void> {
    try {
      const metrics = await this.loadMetrics();
      const now = Date.now();
      const filtered = Object.entries(metrics).reduce((acc, [timestamp, value]) => {
        if (now - Number(timestamp) <= this.MAX_AGE) {
          acc[Number(timestamp)] = value;
        }
        return acc;
      }, {} as TimeSeriesMetrics);

      await this.saveMetrics(filtered);
    } catch (error) {
      console.error('Failed to clear old metrics:', error);
      throw error;
    }
  }

  private static filterMetrics(metrics: TimeSeriesMetrics, { start, end }: LoadOptions): TimeSeriesMetrics {
    return Object.entries(metrics).reduce((acc, [timestamp, value]) => {
      const time = Number(timestamp);
      if ((!start || time >= start) && (!end || time <= end)) {
        acc[Number(timestamp)] = value;
      }
      return acc;
    }, {} as TimeSeriesMetrics);
  }
} 