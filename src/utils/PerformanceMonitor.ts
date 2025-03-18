/**
 * Performance monitoring utility
 */

interface BenchmarkData {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
}

interface ErrorData {
  id: string;
  error: Error;
  timestamp: number;
}

class PerformanceMonitor {
  private benchmarks: Map<string, BenchmarkData> = new Map();
  private errors: ErrorData[] = [];
  private maxErrorsStored = 50;

  /**
   * Start a performance benchmark
   */
  startBenchmark(id: string): void {
    this.benchmarks.set(id, {
      id,
      startTime: Date.now(),
      success: true,
    });
  }

  /**
   * End a performance benchmark and calculate duration
   */
  endBenchmark(id: string): BenchmarkData | null {
    const benchmark = this.benchmarks.get(id);
    
    if (!benchmark) {
      console.warn(`No benchmark found with id: ${id}`);
      return null;
    }
    
    benchmark.endTime = Date.now();
    benchmark.duration = benchmark.endTime - benchmark.startTime;
    
    // Log performance data to console in development
    if (__DEV__) {
      console.log(`[Performance] ${id}: ${benchmark.duration}ms`);
    }
    
    return { ...benchmark };
  }

  /**
   * Log an error that occurred during a benchmark
   */
  logError(benchmarkId: string, error: Error): void {
    // Mark the benchmark as failed
    const benchmark = this.benchmarks.get(benchmarkId);
    if (benchmark) {
      benchmark.success = false;
    }
    
    // Add the error to the errors array
    this.errors.push({
      id: benchmarkId,
      error,
      timestamp: Date.now(),
    });
    
    // Trim the errors array if it gets too large
    if (this.errors.length > this.maxErrorsStored) {
      this.errors = this.errors.slice(-this.maxErrorsStored);
    }
    
    // Log the error to console in development
    if (__DEV__) {
      console.error(`[Performance Error] ${benchmarkId}:`, error);
    }
  }

  /**
   * Get all benchmarks
   */
  getAllBenchmarks(): BenchmarkData[] {
    return Array.from(this.benchmarks.values());
  }

  /**
   * Get a specific benchmark
   */
  getBenchmark(id: string): BenchmarkData | undefined {
    return this.benchmarks.get(id);
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorData[] {
    return [...this.errors];
  }

  /**
   * Clear all benchmarks
   */
  clearBenchmarks(): void {
    this.benchmarks.clear();
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitor(); 