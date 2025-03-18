import { PerformanceInsight, TrendPrediction } from '@/types/AdvancedAnalytics';
import { ExtendedProfileResult, Metrics } from '@/types/Performance';
import { linearRegression, movingAverage } from '@/utils/math';
import { useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { memoryManager } from './MemoryManager';
import { networkOptimizer } from './NetworkOptimizer';

interface PerformanceMetrics {
  timestamp: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  frameRate: number;
  interactionDelay: number;
}

interface HistoricalData {
  timestamps: number[];
  memoryUsage: number[];
  networkLatency: number[];
  renderTime: number[];
  frameRate: number[];
  interactionDelay: number[];
}

interface MetricStats {
  min: number;
  max: number;
  average: number;
  median: number;
  p95: number;
  p99: number;
  standardDeviation: number;
  mode: number;
}

interface PerformanceStats {
  memoryUsage: MetricStats;
  networkLatency: MetricStats;
  renderTime: MetricStats;
  frameRate: MetricStats;
  interactionDelay: MetricStats;
}

interface PerformanceThresholds {
  memoryWarning: number; // MB
  memoryCritical: number; // MB
  networkLatencyWarning: number; // ms
  networkLatencyCritical: number; // ms
  renderTimeWarning: number; // ms
  renderTimeCritical: number; // ms
  frameRateWarning: number; // fps
  frameRateCritical: number; // fps
}

interface Anomaly {
  metric: keyof Metrics;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  description: string;
}

export class PerformanceAnalytics {
  private static readonly TREND_WINDOW = 10; // Number of data points for trend analysis
  private static readonly ANOMALY_THRESHOLD = 2; // Standard deviations for anomaly detection
  private static readonly CORRELATION_THRESHOLD = 0.7; // Minimum correlation coefficient

  private static instance: PerformanceAnalytics;
  private metrics: PerformanceMetrics[] = [];
  private historicalData: HistoricalData = {
    timestamps: [],
    memoryUsage: [],
    networkLatency: [],
    renderTime: [],
    frameRate: [],
    interactionDelay: [],
  };
  private thresholds: PerformanceThresholds;
  private static readonly DEFAULT_THRESHOLDS: PerformanceThresholds = {
    memoryWarning: 100, // 100MB
    memoryCritical: 200, // 200MB
    networkLatencyWarning: 1000, // 1s
    networkLatencyCritical: 3000, // 3s
    renderTimeWarning: 16, // 16ms (60fps)
    renderTimeCritical: 32, // 32ms (30fps)
    frameRateWarning: 45, // 45fps
    frameRateCritical: 30, // 30fps
  };

  private constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      ...PerformanceAnalytics.DEFAULT_THRESHOLDS,
      ...thresholds,
    };
    this.initialize();
  }

  static getInstance(): PerformanceAnalytics {
    if (!PerformanceAnalytics.instance) {
      PerformanceAnalytics.instance = new PerformanceAnalytics();
    }
    return PerformanceAnalytics.instance;
  }

  private initialize(): void {
    // Start collecting metrics
    this.startMetricsCollection();
    
    // Monitor for performance issues
    this.startPerformanceMonitoring();
  }

  private startMetricsCollection(): void {
    // Collect metrics every 5 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 5000);
  }

  private startPerformanceMonitoring(): void {
    // Monitor for performance issues
    setInterval(() => {
      this.checkPerformanceIssues();
    }, 10000);
  }

  private async collectMetrics(): Promise<void> {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memoryUsage: await this.getMemoryUsage(),
      networkLatency: await this.getNetworkLatency(),
      renderTime: await this.getRenderTime(),
      frameRate: await this.getFrameRate(),
      interactionDelay: await this.getInteractionDelay(),
    };

    this.metrics.push(metrics);
    
    // Update historical data
    this.updateHistoricalData(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
      this.trimHistoricalData();
    }
  }

  private updateHistoricalData(metrics: PerformanceMetrics): void {
    this.historicalData.timestamps.push(metrics.timestamp);
    this.historicalData.memoryUsage.push(metrics.memoryUsage);
    this.historicalData.networkLatency.push(metrics.networkLatency);
    this.historicalData.renderTime.push(metrics.renderTime);
    this.historicalData.frameRate.push(metrics.frameRate);
    this.historicalData.interactionDelay.push(metrics.interactionDelay);
  }

  private trimHistoricalData(): void {
    const keepLast = 1000;
    this.historicalData.timestamps = this.historicalData.timestamps.slice(-keepLast);
    this.historicalData.memoryUsage = this.historicalData.memoryUsage.slice(-keepLast);
    this.historicalData.networkLatency = this.historicalData.networkLatency.slice(-keepLast);
    this.historicalData.renderTime = this.historicalData.renderTime.slice(-keepLast);
    this.historicalData.frameRate = this.historicalData.frameRate.slice(-keepLast);
    this.historicalData.interactionDelay = this.historicalData.interactionDelay.slice(-keepLast);
  }

  private async getMemoryUsage(): Promise<number> {
    if (Platform.OS === 'android') {
      // @ts-ignore - Android-specific API
      return global.getMemoryUsage?.() || 0;
    }
    return 0; // iOS doesn't provide direct memory usage
  }

  private async getNetworkLatency(): Promise<number> {
    const start = Date.now();
    try {
      await fetch('https://api.example.com/ping');
      return Date.now() - start;
    } catch {
      return -1;
    }
  }

  private async getRenderTime(): Promise<number> {
    return new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        const start = Date.now();
        requestAnimationFrame(() => {
          resolve(Date.now() - start);
        });
      });
    });
  }

  private async getFrameRate(): Promise<number> {
    return new Promise(resolve => {
      let frames = 0;
      let lastTime = Date.now();
      
      const countFrame = () => {
        frames++;
        const currentTime = Date.now();
        if (currentTime - lastTime >= 1000) {
          resolve(frames);
        } else {
          requestAnimationFrame(countFrame);
        }
      };
      
      requestAnimationFrame(countFrame);
    });
  }

  private async getInteractionDelay(): Promise<number> {
    return new Promise(resolve => {
      const start = Date.now();
      InteractionManager.runAfterInteractions(() => {
        resolve(Date.now() - start);
      });
    });
  }

  private checkPerformanceIssues(): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return;

    // Check memory usage
    if (latestMetrics.memoryUsage > this.thresholds.memoryCritical) {
      this.handleCriticalMemoryUsage(latestMetrics.memoryUsage);
    } else if (latestMetrics.memoryUsage > this.thresholds.memoryWarning) {
      this.handleWarningMemoryUsage(latestMetrics.memoryUsage);
    }

    // Check network latency
    if (latestMetrics.networkLatency > this.thresholds.networkLatencyCritical) {
      this.handleCriticalNetworkLatency(latestMetrics.networkLatency);
    } else if (latestMetrics.networkLatency > this.thresholds.networkLatencyWarning) {
      this.handleWarningNetworkLatency(latestMetrics.networkLatency);
    }

    // Check render time
    if (latestMetrics.renderTime > this.thresholds.renderTimeCritical) {
      this.handleCriticalRenderTime(latestMetrics.renderTime);
    } else if (latestMetrics.renderTime > this.thresholds.renderTimeWarning) {
      this.handleWarningRenderTime(latestMetrics.renderTime);
    }

    // Check frame rate
    if (latestMetrics.frameRate < this.thresholds.frameRateCritical) {
      this.handleCriticalFrameRate(latestMetrics.frameRate);
    } else if (latestMetrics.frameRate < this.thresholds.frameRateWarning) {
      this.handleWarningFrameRate(latestMetrics.frameRate);
    }
  }

  private handleCriticalMemoryUsage(usage: number): void {
    console.warn(`Critical memory usage: ${usage}MB`);
    memoryManager.performCleanup();
  }

  private handleWarningMemoryUsage(usage: number): void {
    console.warn(`High memory usage: ${usage}MB`);
  }

  private handleCriticalNetworkLatency(latency: number): void {
    console.warn(`Critical network latency: ${latency}ms`);
    networkOptimizer.clearCache();
  }

  private handleWarningNetworkLatency(latency: number): void {
    console.warn(`High network latency: ${latency}ms`);
  }

  private handleCriticalRenderTime(time: number): void {
    console.warn(`Critical render time: ${time}ms`);
  }

  private handleWarningRenderTime(time: number): void {
    console.warn(`High render time: ${time}ms`);
  }

  private handleCriticalFrameRate(fps: number): void {
    console.warn(`Critical frame rate: ${fps}fps`);
  }

  private handleWarningFrameRate(fps: number): void {
    console.warn(`Low frame rate: ${fps}fps`);
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): PerformanceMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  dispose(): void {
    this.clearMetrics();
  }

  getHistoricalData(timeRange: 'hour' | 'day' | 'week' = 'hour'): HistoricalData {
    const now = Date.now();
    let cutoffTime: number;

    switch (timeRange) {
      case 'hour':
        cutoffTime = now - 3600000; // 1 hour
        break;
      case 'day':
        cutoffTime = now - 86400000; // 24 hours
        break;
      case 'week':
        cutoffTime = now - 604800000; // 7 days
        break;
      default:
        cutoffTime = now - 3600000;
    }

    const indices = this.historicalData.timestamps
      .map((timestamp, index) => ({ timestamp, index }))
      .filter(({ timestamp }) => timestamp >= cutoffTime)
      .map(({ index }) => index);

    return {
      timestamps: indices.map(i => this.historicalData.timestamps[i]),
      memoryUsage: indices.map(i => this.historicalData.memoryUsage[i]),
      networkLatency: indices.map(i => this.historicalData.networkLatency[i]),
      renderTime: indices.map(i => this.historicalData.renderTime[i]),
      frameRate: indices.map(i => this.historicalData.frameRate[i]),
      interactionDelay: indices.map(i => this.historicalData.interactionDelay[i]),
    };
  }

  private calculateStats(data: number[]): MetricStats {
    if (data.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        p95: 0,
        p99: 0,
        standardDeviation: 0,
        mode: 0,
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const average = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    // Calculate standard deviation
    const squaredDiffs = sorted.map(value => Math.pow(value - average, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / sorted.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate mode
    const frequencyMap = new Map<number, number>();
    sorted.forEach(value => {
      frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
    });
    let maxFrequency = 0;
    let mode = sorted[0];
    frequencyMap.forEach((frequency, value) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mode = value;
      }
    });

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average,
      median,
      p95: sorted[p95Index],
      p99: sorted[p99Index],
      standardDeviation,
      mode,
    };
  }

  getPerformanceStats(timeRange: 'hour' | 'day' | 'week' = 'hour'): PerformanceStats {
    const data = this.getHistoricalData(timeRange);
    
    return {
      memoryUsage: this.calculateStats(data.memoryUsage),
      networkLatency: this.calculateStats(data.networkLatency),
      renderTime: this.calculateStats(data.renderTime),
      frameRate: this.calculateStats(data.frameRate),
      interactionDelay: this.calculateStats(data.interactionDelay),
    };
  }

  exportData(timeRange: 'hour' | 'day' | 'week' = 'hour'): string {
    const data = this.getHistoricalData(timeRange);
    const stats = this.getPerformanceStats(timeRange);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: data,
      statistics: stats,
      thresholds: this.thresholds,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Analyzes trends in performance data
   * @param results Array of performance profile results
   * @returns Array of trend predictions
   */
  static async analyzeTrends(results: ExtendedProfileResult[]): Promise<TrendPrediction[]> {
    const predictions: TrendPrediction[] = [];
    const metrics = Object.keys(results[0].metrics) as (keyof Metrics)[];

    for (const metric of metrics) {
      const values = results.map(r => r.metrics[metric]);
      const timestamps = results.map(r => r.timestamp);

      // Calculate trend using linear regression
      const regression = linearRegression(
        timestamps.map((t, i) => i),
        values
      );

      // Calculate confidence using R-squared
      const confidence = regression.r2;

      // Predict next value
      const nextValue = regression.predict(values.length);

      // Calculate rate of change
      const rateOfChange = (nextValue - values[values.length - 1]) / values[values.length - 1] * 100;

      // Determine trend direction
      let trend: 'increasing' | 'decreasing' | 'stable';
      if (Math.abs(rateOfChange) < 1) {
        trend = 'stable';
      } else {
        trend = rateOfChange > 0 ? 'increasing' : 'decreasing';
      }

      predictions.push({
        metric,
        currentValue: values[values.length - 1],
        predictedValue: nextValue,
        confidence,
        trend,
        rateOfChange,
      });
    }

    return predictions;
  }

  static detectAnomalies(results: ExtendedProfileResult[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const metrics = Object.keys(results[0].metrics) as (keyof Metrics)[];

    for (const metric of metrics) {
      const values = results.map(r => r.metrics[metric]);

      // Calculate moving average and standard deviation
      const ma = movingAverage(values, this.TREND_WINDOW);
      const stdDev = this.calculateStdDev(values);

      // Check each value for anomalies
      values.forEach((value, index) => {
        const expectedValue = ma[index];
        const deviation = Math.abs(value - expectedValue);
        const deviationScore = deviation / stdDev;

        if (deviationScore > this.ANOMALY_THRESHOLD) {
          const severity = this.getAnomalySeverity(deviationScore);
          anomalies.push({
            metric,
            value,
            expectedRange: {
              min: expectedValue - stdDev * this.ANOMALY_THRESHOLD,
              max: expectedValue + stdDev * this.ANOMALY_THRESHOLD,
            },
            severity,
            timestamp: results[index].timestamp,
            description: this.generateAnomalyDescription(metric, value, expectedValue, severity),
          });
        }
      });
    }

    return anomalies;
  }

  /**
   * Generates insights from performance results
   * @param results Array of performance profile results
   * @returns Array of performance insights
   */
  static async generateInsights(results: ExtendedProfileResult[]): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];
    const metrics = Object.keys(results[0].metrics) as (keyof Metrics)[];

    // Analyze trends
    const trends = await this.analyzeTrends(results);
    trends.forEach(trend => {
      if (trend.confidence > 0.8) {
        insights.push({
          type: 'trend',
          metric: trend.metric,
          description: this.generateTrendDescription(trend),
          importance: this.getTrendImportance(trend),
          recommendation: this.generateTrendRecommendation(trend),
        });
      }
    });

    // Detect anomalies
    const anomalies = this.detectAnomalies(results);
    anomalies.forEach(anomaly => {
      insights.push({
        type: 'anomaly',
        metric: anomaly.metric,
        description: anomaly.description,
        importance: this.mapSeverityToImportance(anomaly.severity),
        recommendation: this.generateAnomalyRecommendation(anomaly),
      });
    });

    // Find correlations
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        const values1 = results.map(r => r.metrics[metric1]);
        const values2 = results.map(r => r.metrics[metric2]);
        const correlation = this.calculateCorrelation(values1, values2);

        if (Math.abs(correlation) > this.CORRELATION_THRESHOLD) {
          insights.push({
            type: 'correlation',
            metric: metric1,
            description: this.generateCorrelationDescription(metric1, metric2, correlation),
            importance: 'medium',
            relatedMetrics: [{ metric: metric2, correlation }],
          });
        }
      }
    }

    return insights;
  }

  private static calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return numerator / denominator;
  }

  private static getAnomalySeverity(deviationScore: number): 'low' | 'medium' | 'high' {
    if (deviationScore > this.ANOMALY_THRESHOLD * 2) return 'high';
    if (deviationScore > this.ANOMALY_THRESHOLD * 1.5) return 'medium';
    return 'low';
  }

  private static mapSeverityToImportance(severity: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    return severity;
  }

  private static getTrendImportance(trend: TrendPrediction): 'low' | 'medium' | 'high' {
    if (trend.confidence > 0.9 && Math.abs(trend.rateOfChange) > 10) return 'high';
    if (trend.confidence > 0.8 && Math.abs(trend.rateOfChange) > 5) return 'medium';
    return 'low';
  }

  private static generateTrendDescription(trend: TrendPrediction): string {
    const direction = trend.trend === 'increasing' ? 'increasing' : trend.trend === 'decreasing' ? 'decreasing' : 'stable';
    const rate = Math.abs(trend.rateOfChange).toFixed(1);
    return `${trend.metric} is ${direction} at a rate of ${rate}% with ${(trend.confidence * 100).toFixed(1)}% confidence`;
  }

  private static generateAnomalyDescription(
    metric: keyof Metrics,
    value: number,
    expectedValue: number,
    severity: 'low' | 'medium' | 'high'
  ): string {
    const difference = ((value - expectedValue) / expectedValue * 100).toFixed(1);
    return `${severity} severity anomaly detected in ${metric}: ${difference}% deviation from expected value`;
  }

  private static generateCorrelationDescription(
    metric1: keyof Metrics,
    metric2: keyof Metrics,
    correlation: number
  ): string {
    const strength = Math.abs(correlation) > 0.9 ? 'strong' : 'moderate';
    const direction = correlation > 0 ? 'positive' : 'negative';
    return `${strength} ${direction} correlation detected between ${metric1} and ${metric2}`;
  }

  private static generateTrendRecommendation(trend: TrendPrediction): string {
    if (trend.trend === 'increasing' && trend.rateOfChange > 10) {
      return `Consider investigating the cause of rapid increase in ${trend.metric} and implement optimizations`;
    }
    if (trend.trend === 'decreasing' && trend.rateOfChange < -10) {
      return `Monitor ${trend.metric} closely as it shows significant improvement`;
    }
    return `Continue monitoring ${trend.metric} for any significant changes`;
  }

  private static generateAnomalyRecommendation(anomaly: Anomaly): string {
    switch (anomaly.severity) {
      case 'high':
        return `Urgent: Investigate ${anomaly.metric} as it shows significant deviation from normal behavior`;
      case 'medium':
        return `Review recent changes that might have affected ${anomaly.metric}`;
      case 'low':
        return `Monitor ${anomaly.metric} for continued anomalies`;
    }
  }
}

// Export singleton instance
export const performanceAnalytics = PerformanceAnalytics.getInstance();

// Custom hook for performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    const metrics = performanceAnalytics.getLatestMetrics();
    if (metrics) {
      // Log performance metrics
      console.log('Performance Metrics:', metrics);
    }
  }, []);
} 