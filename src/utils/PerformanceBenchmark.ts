/**
 * PerformanceBenchmark.ts
 * Utilities for measuring and reporting performance metrics in the EcoCart app
 */

// Define an interface for chrome performance memory API 
interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
}

// Define types for benchmarking
export interface BenchmarkResult {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: number;
  success: boolean;
  error?: Error;
  metadata?: Record<string, any>;
}

export interface BenchmarkOptions {
  includeMemory: boolean;
  logToConsole: boolean;
  saveToStorage: boolean;
  tag?: string;
}

export interface BenchmarkSuite {
  suiteName: string;
  results: BenchmarkResult[];
  startTime: number;
  endTime?: number;
  totalDuration?: number;
}

/**
 * Class for measuring performance of operations in the app
 */
export default class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private activeBenchmarks: Map<string, { startTime: number; metadata?: Record<string, any> }> = new Map();
  private suites: Map<string, BenchmarkSuite> = new Map();
  
  private defaultOptions: BenchmarkOptions = {
    includeMemory: false, // Enable only when needed as it can impact performance
    logToConsole: __DEV__, // Only log in development mode
    saveToStorage: false,
  };

  /**
   * Start measuring performance for an operation
   * @param operationName Name of the operation being measured
   * @param metadata Optional metadata about the operation
   * @returns Operation ID for stopping the benchmark
   */
  startBenchmark(operationName: string, metadata?: Record<string, any>): string {
    const id = `${operationName}_${Date.now()}`;
    this.activeBenchmarks.set(id, {
      startTime: performance.now(),
      metadata
    });
    return id;
  }

  /**
   * Stop measuring performance for an operation
   * @param id The operation ID returned from startBenchmark
   * @param options Benchmark options
   * @returns The benchmark result
   */
  stopBenchmark(id: string, options?: Partial<BenchmarkOptions>): BenchmarkResult | null {
    const benchmark = this.activeBenchmarks.get(id);
    if (!benchmark) {
      console.warn(`No active benchmark found with id: ${id}`);
      return null;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    const endTime = performance.now();
    const operationName = id.split('_')[0];
    
    let memoryUsage: number | undefined;
    // Use type assertion to access the memory property (Chrome-specific)
    if (mergedOptions.includeMemory && typeof performance !== 'undefined' && 
        (performance as any).memory) {
      memoryUsage = ((performance as any).memory as PerformanceMemory).usedJSHeapSize;
    }
    
    const result: BenchmarkResult = {
      operationName,
      startTime: benchmark.startTime,
      endTime,
      duration: endTime - benchmark.startTime,
      memoryUsage,
      success: true,
      metadata: benchmark.metadata
    };
    
    this.results.push(result);
    this.activeBenchmarks.delete(id);
    
    if (mergedOptions.logToConsole) {
      console.log(`Benchmark [${operationName}]: ${result.duration.toFixed(2)}ms`, 
        mergedOptions.tag ? `(${mergedOptions.tag})` : '',
        memoryUsage ? `Memory: ${(memoryUsage / 1048576).toFixed(2)} MB` : '');
    }
    
    if (mergedOptions.saveToStorage) {
      this.saveResultToStorage(result);
    }
    
    return result;
  }

  /**
   * Measure the performance of a function
   * @param fn Function to benchmark
   * @param operationName Name of the operation
   * @param options Benchmark options
   * @returns Result of the function and benchmark data
   */
  async measureAsync<T>(
    fn: () => Promise<T>, 
    operationName: string, 
    options?: Partial<BenchmarkOptions>
  ): Promise<{ result: T; benchmark: BenchmarkResult }> {
    const id = this.startBenchmark(operationName);
    try {
      const result = await fn();
      const benchmark = this.stopBenchmark(id, options) as BenchmarkResult;
      return { result, benchmark };
    } catch (error) {
      const benchmark = this.activeBenchmarks.get(id);
      if (benchmark) {
        const errorResult: BenchmarkResult = {
          operationName,
          startTime: benchmark.startTime,
          endTime: performance.now(),
          duration: performance.now() - benchmark.startTime,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: benchmark.metadata
        };
        this.results.push(errorResult);
        this.activeBenchmarks.delete(id);
        
        const mergedOptions = { ...this.defaultOptions, ...options };
        if (mergedOptions.logToConsole) {
          console.error(`Benchmark Error [${operationName}]:`, error);
        }
      }
      throw error;
    }
  }

  /**
   * Measure the performance of a synchronous function
   * @param fn Function to benchmark
   * @param operationName Name of the operation
   * @param options Benchmark options
   * @returns Result of the function and benchmark data
   */
  measure<T>(
    fn: () => T, 
    operationName: string, 
    options?: Partial<BenchmarkOptions>
  ): { result: T; benchmark: BenchmarkResult } {
    const id = this.startBenchmark(operationName);
    try {
      const result = fn();
      const benchmark = this.stopBenchmark(id, options) as BenchmarkResult;
      return { result, benchmark };
    } catch (error) {
      const benchmark = this.activeBenchmarks.get(id);
      if (benchmark) {
        const errorResult: BenchmarkResult = {
          operationName,
          startTime: benchmark.startTime,
          endTime: performance.now(),
          duration: performance.now() - benchmark.startTime,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: benchmark.metadata
        };
        this.results.push(errorResult);
        this.activeBenchmarks.delete(id);
        
        const mergedOptions = { ...this.defaultOptions, ...options };
        if (mergedOptions.logToConsole) {
          console.error(`Benchmark Error [${operationName}]:`, error);
        }
      }
      throw error;
    }
  }

  /**
   * Start a benchmark suite for measuring multiple related operations
   * @param suiteName Name of the benchmark suite
   * @returns Suite ID
   */
  startSuite(suiteName: string): string {
    const suiteId = `${suiteName}_${Date.now()}`;
    this.suites.set(suiteId, {
      suiteName,
      results: [],
      startTime: performance.now()
    });
    return suiteId;
  }

  /**
   * Add a benchmark to a suite
   * @param suiteId Suite ID from startSuite
   * @param result Benchmark result to add
   */
  addToSuite(suiteId: string, result: BenchmarkResult): void {
    const suite = this.suites.get(suiteId);
    if (suite) {
      suite.results.push(result);
    } else {
      console.warn(`Suite not found with id: ${suiteId}`);
    }
  }

  /**
   * End a benchmark suite and calculate aggregate metrics
   * @param suiteId Suite ID from startSuite
   * @param options Benchmark options
   * @returns The completed benchmark suite
   */
  endSuite(suiteId: string, options?: Partial<BenchmarkOptions>): BenchmarkSuite | null {
    const suite = this.suites.get(suiteId);
    if (!suite) {
      console.warn(`Suite not found with id: ${suiteId}`);
      return null;
    }
    
    const endTime = performance.now();
    suite.endTime = endTime;
    suite.totalDuration = endTime - suite.startTime;
    
    const mergedOptions = { ...this.defaultOptions, ...options };
    if (mergedOptions.logToConsole) {
      console.log(`Benchmark Suite [${suite.suiteName}] completed in ${suite.totalDuration.toFixed(2)}ms with ${suite.results.length} operations`);
      console.table(suite.results.map(r => ({
        operation: r.operationName,
        duration: r.duration.toFixed(2) + 'ms',
        success: r.success
      })));
    }
    
    if (mergedOptions.saveToStorage) {
      this.saveSuiteToStorage(suite);
    }
    
    this.suites.delete(suiteId);
    return suite;
  }

  /**
   * Get all completed benchmark results
   * @returns Array of benchmark results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  /**
   * Clear all stored benchmark results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Save a benchmark result to storage for later analysis
   * @param result The benchmark result to save
   */
  private saveResultToStorage(result: BenchmarkResult): void {
    // Implement storage logic here (AsyncStorage, etc.)
    // This would typically save to AsyncStorage or another persistence mechanism
    console.log('Saving benchmark result to storage:', result);
  }

  /**
   * Save a benchmark suite to storage for later analysis
   * @param suite The benchmark suite to save
   */
  private saveSuiteToStorage(suite: BenchmarkSuite): void {
    // Implement storage logic here (AsyncStorage, etc.)
    console.log('Saving benchmark suite to storage:', suite);
  }
} 