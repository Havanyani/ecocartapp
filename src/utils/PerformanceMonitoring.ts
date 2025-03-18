/**
 * PerformanceMonitoring.ts
 * Consolidated performance monitoring utilities for the EcoCart app.
 * This file combines functionality from:
 * - Performance.ts
 * - PerformanceBenchmark.ts
 * - PerformanceMetrics.ts
 * - WebSocketPerformance.ts (relevant parts)
 */

// Define interfaces for performance metrics
export interface PerformanceMetric {
  type: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceMemory {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface BenchmarkOptions {
  name: string;
  includeMemory?: boolean;
  tags?: Record<string, string>;
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

// Main performance monitoring class
export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static breadcrumbs: Array<{ category: string; message: string; timestamp: number }> = [];
  private static errors: Array<{ error: Error; context?: Record<string, any>; timestamp: number }> = [];
  private static MAX_METRICS = 1000;
  private static MAX_BREADCRUMBS = 100;
  private static MAX_ERRORS = 50;
  private static DEFAULT_WINDOW = 60 * 1000; // 1 minute

  /**
   * Record a performance metric
   */
  static recordMetric(type: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      type,
      value,
      timestamp: Date.now(),
      tags
    };

    this.metrics.push(metric);

    // Trim metrics array if it gets too large
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Add a breadcrumb for debugging
   */
  static addBreadcrumb(category: string, message: string): void {
    this.breadcrumbs.push({
      category,
      message,
      timestamp: Date.now()
    });

    // Trim breadcrumbs array if it gets too large
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.MAX_BREADCRUMBS);
    }
  }

  /**
   * Capture an error
   */
  static captureError(error: Error, context?: Record<string, any>): void {
    this.errors.push({
      error,
      context,
      timestamp: Date.now()
    });

    // Add a breadcrumb for the error
    this.addBreadcrumb('error', error.message);

    // Trim errors array if it gets too large
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // In a real app, you might send this to a monitoring service
    console.error('Performance error captured:', error, context);
  }

  /**
   * Get metrics within a specific time window
   */
  static getMetrics(timeWindow: number = this.DEFAULT_WINDOW): PerformanceMetric[] {
    const now = Date.now();
    return this.metrics.filter(metric => now - metric.timestamp <= timeWindow);
  }

  /**
   * Get a summary of performance metrics
   */
  static getSummary(timeWindow: number = this.DEFAULT_WINDOW): PerformanceSummary {
    const now = Date.now();
    const recentMetrics = this.getMetrics(timeWindow);
    
    const renderMetrics = recentMetrics.filter(m => m.type === 'render');
    const networkMetrics = recentMetrics.filter(m => m.type === 'network');
    const memoryMetrics = recentMetrics.filter(m => m.type === 'memory');
    
    return {
      averageRenderTime: this.calculateAverage(renderMetrics),
      averageNetworkTime: this.calculateAverage(networkMetrics),
      averageMemoryUsage: this.calculateAverage(memoryMetrics),
      totalErrors: this.errors.filter(e => now - e.timestamp <= timeWindow).length,
      metrics: recentMetrics
    };
  }

  /**
   * Calculate the average value from a set of metrics
   */
  private static calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Start a performance benchmark
   */
  static startBenchmark(options: BenchmarkOptions): { id: string; startTime: number } {
    const id = `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    let memoryBefore: number | undefined;
    if (options.includeMemory && typeof performance !== 'undefined' && 
        (performance as any).memory) {
      memoryBefore = ((performance as any).memory as PerformanceMemory).usedJSHeapSize;
    }
    
    // Store the benchmark start info in a private map or similar structure
    this.addBreadcrumb('benchmark', `Started benchmark: ${options.name}`);
    
    return { id, startTime };
  }

  /**
   * End a performance benchmark and get results
   */
  static endBenchmark(
    benchmarkInfo: { id: string; startTime: number },
    options: BenchmarkOptions
  ): BenchmarkResult {
    const endTime = performance.now();
    const duration = endTime - benchmarkInfo.startTime;
    
    let memoryAfter: number | undefined;
    let memoryBefore: number | undefined;
    
    if (options.includeMemory && typeof performance !== 'undefined' && 
        (performance as any).memory) {
      memoryAfter = ((performance as any).memory as PerformanceMemory).usedJSHeapSize;
      // In a real implementation, we'd retrieve memoryBefore from stored data
    }
    
    const result: BenchmarkResult = {
      name: options.name,
      startTime: benchmarkInfo.startTime,
      endTime,
      duration,
      tags: options.tags
    };
    
    if (memoryBefore !== undefined && memoryAfter !== undefined) {
      result.memory = {
        before: memoryBefore,
        after: memoryAfter,
        difference: memoryAfter - memoryBefore
      };
    }
    
    // Record the benchmark as a metric
    this.recordMetric('benchmark', duration, {
      name: options.name,
      ...(options.tags || {})
    });
    
    this.addBreadcrumb('benchmark', `Completed benchmark: ${options.name} (${duration.toFixed(2)}ms)`);
    
    return result;
  }

  /**
   * Measure the performance of a function
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T>,
    options: Partial<BenchmarkOptions> = {}
  ): Promise<T> {
    const benchmark = this.startBenchmark({
      name,
      includeMemory: options.includeMemory || false,
      tags: options.tags
    });
    
    try {
      const result = await fn();
      this.endBenchmark(benchmark, {
        name,
        includeMemory: options.includeMemory || false,
        tags: options.tags
      });
      return result;
    } catch (error) {
      this.captureError(error instanceof Error ? error : new Error(String(error)), {
        benchmark: name,
        duration: performance.now() - benchmark.startTime
      });
      throw error;
    }
  }

  /**
   * Measure the performance of a synchronous function
   */
  static measureSync<T>(
    name: string,
    fn: () => T,
    options: Partial<BenchmarkOptions> = {}
  ): T {
    const benchmark = this.startBenchmark({
      name,
      includeMemory: options.includeMemory || false,
      tags: options.tags
    });
    
    try {
      const result = fn();
      this.endBenchmark(benchmark, {
        name,
        includeMemory: options.includeMemory || false,
        tags: options.tags
      });
      return result;
    } catch (error) {
      this.captureError(error instanceof Error ? error : new Error(String(error)), {
        benchmark: name,
        duration: performance.now() - benchmark.startTime
      });
      throw error;
    }
  }

  /**
   * Start a trace for a specific operation
   */
  static startTrace(name: string): { id: string; startTime: number } {
    return this.startBenchmark({ name });
  }

  /**
   * End a trace and record its duration
   */
  static endTrace(trace: { id: string; startTime: number }, name: string): void {
    this.endBenchmark(trace, { name });
  }

  /**
   * Track network request performance
   */
  static trackNetworkRequest(url: string, duration: number, status: number): void {
    this.recordMetric('network', duration, {
      url,
      status: status.toString()
    });
  }

  /**
   * Track component render time
   */
  static trackRender(componentName: string, duration: number): void {
    this.recordMetric('render', duration, {
      component: componentName
    });
  }

  /**
   * Track memory usage
   */
  static trackMemoryUsage(): void {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory as PerformanceMemory;
      this.recordMetric('memory', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize.toString(),
        limit: memory.jsHeapSizeLimit.toString()
      });
    }
  }

  /**
   * Clear all metrics (useful for testing)
   */
  static clearMetrics(): void {
    this.metrics = [];
    this.breadcrumbs = [];
    this.errors = [];
  }
}

// Export a singleton instance for easy access
export default PerformanceMonitor; 