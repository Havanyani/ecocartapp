/**
 * PerformanceMonitoring.ts
 * Consolidated performance monitoring utilities for the EcoCart app.
 * This file combines functionality from:
 * - Performance.ts
 * - PerformanceBenchmark.ts
 * - PerformanceMetrics.ts
 * - WebSocketPerformance.ts (relevant parts)
 */

import { InteractionManager } from 'react-native';

type MetricType = 'render' | 'api' | 'interaction';

interface Metric {
  name: string;
  duration: number;
  type: MetricType;
  component?: string;
  timestamp: number;
}

interface PerformanceMetric {
  id: string;
  type: MetricType;
  startTime: number;
  endTime?: number;
  duration?: number;
  component?: string;
  tags?: Record<string, string>;
}

interface BenchmarkOptions {
  name: string;
  component?: string;
  type?: MetricType;
  tags?: Record<string, string>;
}

export interface PerformanceMemory {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface BenchmarkResult {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  memory?: {
    before: number;
    after: number;
    difference: number;
  };
  tags?: Record<string, string>;
}

export interface PerformanceSummary {
  averageRenderTime: number;
  averageNetworkTime: number;
  averageMemoryUsage: number;
  totalErrors: number;
  metrics: PerformanceMetric[];
}

/**
 * A utility for monitoring and logging performance metrics in the app.
 * This helps identify bottlenecks and optimize render performance.
 */
class PerformanceMonitor {
  private static metrics: Metric[] = [];
  private static enabled = __DEV__; // Only enabled in development by default
  private static thresholds = {
    render: 16, // 60fps = ~16ms per frame
    api: 300,
    interaction: 100,
  };

  /**
   * Enable or disable performance monitoring
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Track component render time
   */
  static trackRender(component: string, callback: () => void): void {
    if (!this.enabled) {
      callback();
      return;
    }

    const startTime = Date.now();
    callback();
    
    InteractionManager.runAfterInteractions(() => {
      const duration = Date.now() - startTime;
      this.recordMetric({
        name: `render_${component}`,
      duration,
        type: 'render',
        component,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Track API call performance
   */
  static async trackApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return apiCall();
    }

    const startTime = Date.now();
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      this.recordMetric({
        name: `api_${name}`,
        duration,
        type: 'api',
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordMetric({
        name: `api_${name}_error`,
        duration,
        type: 'api',
        timestamp: Date.now()
      });
      
      throw error;
    }
  }

  /**
   * Record a performance metric directly
   */
  static recordMetric(metric: Metric): void {
    if (!this.enabled) return;

    this.metrics.push(metric);

    // Log warning if duration exceeds threshold
    const threshold = this.thresholds[metric.type];
    if (metric.duration > threshold) {
      console.warn(
        `[Performance] ${metric.component ? `${metric.component} - ` : ''}${metric.name} took ${metric.duration}ms (threshold: ${threshold}ms)`
      );
    }
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): Metric[] {
    return [...this.metrics];
  }

  /**
   * Clear all recorded metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get performance report with statistics
   */
  static getReport(): {
    metrics: Metric[];
    slowComponents: string[];
  } {
    // Identify slow components
    const componentDurations: Record<string, number[]> = {};
    
    this.metrics
      .filter(m => m.type === 'render' && m.component)
      .forEach(metric => {
        if (metric.component) {
          if (!componentDurations[metric.component]) {
            componentDurations[metric.component] = [];
          }
          componentDurations[metric.component].push(metric.duration);
        }
      });

    // Calculate average durations and find slow components
    const avgDurations = Object.entries(componentDurations).map(([component, durations]) => {
      const sum = durations.reduce((a, b) => a + b, 0);
      return { component, avgDuration: sum / durations.length };
    });

    // Sort by average duration (descending)
    avgDurations.sort((a, b) => b.avgDuration - a.avgDuration);

    // Get slow components (top 5)
    const slowComponents = avgDurations
      .filter(item => item.avgDuration > this.thresholds.render)
      .slice(0, 5)
      .map(item => item.component);

    return {
      metrics: this.metrics,
      slowComponents
    };
  }
}

export { PerformanceMonitor };
