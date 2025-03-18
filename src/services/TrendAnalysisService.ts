import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

// Define interfaces for metrics data
interface PerformanceMetric {
  duration: number;
  timestamp?: number;
}

interface Metrics {
  messageLatency: number[];
  processingTime: PerformanceMetric[];
  compressionRatio: number[];
  [key: string]: any; // Allow for additional metric types
}

interface TrendAnalysisResult {
  latency: number;
  throughput: number;
  compression: number;
  anomalies: string[];
}

export class TrendAnalysisService {
  static TREND_WINDOW = 20;
  static ALERT_THRESHOLD = 0.2; // 20% change

  static analyzeTrends(metrics: Metrics): TrendAnalysisResult {
    try {
      const trends: TrendAnalysisResult = {
        latency: this._calculateTrend(metrics.messageLatency),
        throughput: this._calculateTrend(metrics.processingTime.map(p => p.duration)),
        compression: this._calculateTrend(metrics.compressionRatio),
        anomalies: []
      };

      // Check for anomalies
      Object.entries(metrics).forEach(([key, data]) => {
        if (Array.isArray(data) && this._detectAnomaly(data)) {
          trends.anomalies.push(key);
        }
      });

      return trends;
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw error;
    }
  }

  static _calculateTrend(data: number[]): number {
    if (!Array.isArray(data) || data.length < 2) return 0;

    const recentData = data.slice(-this.TREND_WINDOW);
    const x = Array.from({ length: recentData.length }, (_, i) => i);
    const y = recentData;

    // Simple linear regression
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

    const denominator = (n * sumXX - sumX * sumX);
    // Avoid division by zero
    if (denominator === 0) return 0;
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    return slope;
  }

  static _detectAnomaly(data: number[]): boolean {
    if (!Array.isArray(data)) return false;
    
    const recentData = data.slice(-this.TREND_WINDOW);
    if (recentData.length < this.TREND_WINDOW) return false;

    const mean = recentData.reduce((a, b) => a + b, 0) / recentData.length;
    const stdDev = Math.sqrt(
      recentData.map(x => Math.pow(x - mean, 2))
        .reduce((a, b) => a + b, 0) / recentData.length
    );

    const latestValue = recentData[recentData.length - 1];
    return Math.abs(latestValue - mean) > 2 * stdDev;
  }
} 