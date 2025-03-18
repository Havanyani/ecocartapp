/**
 * BenchmarkScenarios.ts
 * Provides various benchmark scenarios for testing application performance
 */

// Performance metric types
export interface BenchmarkMetrics {
  scenarioName: string;
  operationCount: number;
  totalDuration: number; // milliseconds
  averageLatency: number; // milliseconds per operation
  operationsPerSecond: number;
  memoryUsageMB?: number;
  timestamp: Date;
  error?: Error;
}

export interface ScenarioConfig {
  iterations: number;
  concurrency: number;
  payloadSize: number; // in bytes
  delay: number; // milliseconds between operations
}

// Default configuration
const DEFAULT_CONFIG: ScenarioConfig = {
  iterations: 100,
  concurrency: 5,
  payloadSize: 1024,
  delay: 0
};

/**
 * Provides standard benchmark scenarios for performance testing
 */
export default class BenchmarkScenarios {
  /**
   * Run a specific benchmark scenario
   * @param scenarioName Name of the scenario to run
   * @param config Configuration for the benchmark
   * @returns Metrics from the benchmark
   */
  static async runScenario(
    scenarioName: string, 
    config: Partial<ScenarioConfig> = {}
  ): Promise<BenchmarkMetrics> {
    const mergedConfig: ScenarioConfig = { ...DEFAULT_CONFIG, ...config };
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      // Select the appropriate scenario function
      let operationCount = 0;
      
      switch (scenarioName) {
        case 'dataTransformation':
          operationCount = await this.runDataTransformation(mergedConfig);
          break;
        case 'messageProcessing':
          operationCount = await this.runMessageProcessing(mergedConfig);
          break;
        case 'storageOperations':
          operationCount = await this.runStorageOperations(mergedConfig);
          break;
        case 'calculateStatistics':
          operationCount = await this.runStatisticsCalculation(mergedConfig);
          break;
        case 'renderComponents':
          operationCount = await this.runComponentRendering(mergedConfig);
          break;
        default:
          throw new Error(`Unknown benchmark scenario: ${scenarioName}`);
      }
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const totalDuration = endTime - startTime;
      
      return {
        scenarioName,
        operationCount,
        totalDuration,
        averageLatency: totalDuration / operationCount,
        operationsPerSecond: (operationCount / totalDuration) * 1000,
        memoryUsageMB: endMemory !== null ? (endMemory - (startMemory || 0)) / 1024 / 1024 : undefined,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        scenarioName,
        operationCount: 0,
        totalDuration: performance.now() - startTime,
        averageLatency: 0,
        operationsPerSecond: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  
  /**
   * Run all available benchmark scenarios
   * @param config Configuration for the benchmarks
   * @returns Array of metrics from each benchmark
   */
  static async runAll(config: Partial<ScenarioConfig> = {}): Promise<BenchmarkMetrics[]> {
    const scenarios = [
      'dataTransformation',
      'messageProcessing',
      'storageOperations',
      'calculateStatistics',
      'renderComponents'
    ];
    
    const results: BenchmarkMetrics[] = [];
    
    for (const scenario of scenarios) {
      results.push(await this.runScenario(scenario, config));
    }
    
    return results;
  }
  
  /**
   * Benchmark scenario for data transformation operations
   * @param config Benchmark configuration
   */
  private static async runDataTransformation(config: ScenarioConfig): Promise<number> {
    let operations = 0;
    const payloads = this.generateTestPayloads(config.iterations, config.payloadSize);
    
    // Process data in sequential or concurrent mode based on configuration
    if (config.concurrency <= 1) {
      // Sequential processing
      for (const payload of payloads) {
        await this.transformData(payload);
        operations++;
        
        if (config.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
    } else {
      // Concurrent processing
      const chunks = this.chunkArray(payloads, config.concurrency);
      
      for (const chunk of chunks) {
        await Promise.all(chunk.map(async payload => {
          await this.transformData(payload);
          operations++;
        }));
        
        if (config.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
    }
    
    return operations;
  }
  
  /**
   * Benchmark scenario for message processing operations
   * @param config Benchmark configuration
   */
  private static async runMessageProcessing(config: ScenarioConfig): Promise<number> {
    let operations = 0;
    const messages = this.generateTestMessages(config.iterations);
    
    // Process messages in sequential or concurrent mode based on configuration
    if (config.concurrency <= 1) {
      // Sequential processing
      for (const message of messages) {
        await this.processMessage(message);
        operations++;
        
        if (config.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
    } else {
      // Concurrent processing
      const chunks = this.chunkArray(messages, config.concurrency);
      
      for (const chunk of chunks) {
        await Promise.all(chunk.map(async message => {
          await this.processMessage(message);
          operations++;
        }));
        
        if (config.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
    }
    
    return operations;
  }
  
  /**
   * Benchmark scenario for storage operations
   * @param config Benchmark configuration
   */
  private static async runStorageOperations(config: ScenarioConfig): Promise<number> {
    // Simulate storage operations
    let operations = 0;
    const items = this.generateStorageItems(config.iterations);
    
    // Test read, write, and delete operations
    for (let i = 0; i < Math.floor(config.iterations / 3); i++) {
      await this.simulateStorageWrite(items[i % items.length]);
      operations++;
      
      await this.simulateStorageRead(items[i % items.length].id);
      operations++;
      
      await this.simulateStorageDelete(items[i % items.length].id);
      operations++;
      
      if (config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
    }
    
    return operations;
  }
  
  /**
   * Benchmark scenario for statistical calculations
   * @param config Benchmark configuration
   */
  private static async runStatisticsCalculation(config: ScenarioConfig): Promise<number> {
    let operations = 0;
    const datasets = this.generateStatisticalDatasets(config.iterations);
    
    // Calculate statistics for each dataset
    if (config.concurrency <= 1) {
      // Sequential processing
      for (const dataset of datasets) {
        this.calculateStatistics(dataset);
        operations++;
        
        if (config.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
    } else {
      // Concurrent processing
      const chunks = this.chunkArray(datasets, config.concurrency);
      
      for (const chunk of chunks) {
        await Promise.all(chunk.map(dataset => {
          this.calculateStatistics(dataset);
          operations++;
          return Promise.resolve();
        }));
        
        if (config.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
    }
    
    return operations;
  }
  
  /**
   * Benchmark scenario for component rendering
   * @param config Benchmark configuration
   */
  private static async runComponentRendering(config: ScenarioConfig): Promise<number> {
    // Simulate rendering React components
    let operations = 0;
    
    for (let i = 0; i < config.iterations; i++) {
      this.simulateComponentRendering(i % 5); // Different component types
      operations++;
      
      if (config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
    }
    
    return operations;
  }
  
  /**
   * Transform a data object (simulated)
   * @param data Data to transform
   */
  private static async transformData(data: any): Promise<any> {
    // Simulate CPU-intensive data transformation
    return new Promise<any>(resolve => {
      // Create a deep copy with some transformations
      const transformed = JSON.parse(JSON.stringify(data));
      
      // Apply some transformations
      if (Array.isArray(transformed)) {
        for (let i = 0; i < transformed.length; i++) {
          if (typeof transformed[i] === 'number') {
            transformed[i] = transformed[i] * 2;
          } else if (typeof transformed[i] === 'string') {
            transformed[i] = transformed[i].toUpperCase();
          }
        }
      } else if (typeof transformed === 'object' && transformed !== null) {
        for (const key in transformed) {
          if (typeof transformed[key] === 'number') {
            transformed[key] = transformed[key] * 2;
          } else if (typeof transformed[key] === 'string') {
            transformed[key] = transformed[key].toUpperCase();
          }
        }
      }
      
      setTimeout(() => resolve(transformed), 1);
    });
  }
  
  /**
   * Process a message (simulated)
   * @param message Message to process
   */
  private static async processMessage(message: any): Promise<void> {
    // Simulate message processing
    return new Promise<void>(resolve => {
      // Add some CPU work
      const result: { 
        processed: boolean; 
        timestamp: Date; 
        original: any;
        hash?: number;
      } = { 
        processed: true, 
        timestamp: new Date(), 
        original: message 
      };
      
      // SHA-256 calculation simulation
      let hash = 0;
      const str = JSON.stringify(message);
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      
      result.hash = hash;
      setTimeout(() => resolve(), 2);
    });
  }
  
  /**
   * Simulate a storage write operation
   * @param item Item to write
   */
  private static async simulateStorageWrite(item: any): Promise<void> {
    // Simulate storage write operation
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 5);
    });
  }
  
  /**
   * Simulate a storage read operation
   * @param id ID of item to read
   */
  private static async simulateStorageRead(id: string): Promise<any> {
    // Simulate storage read operation
    return new Promise<any>(resolve => {
      setTimeout(() => resolve({ id, value: 'test', timestamp: Date.now() }), 2);
    });
  }
  
  /**
   * Simulate a storage delete operation
   * @param id ID of item to delete
   */
  private static async simulateStorageDelete(id: string): Promise<void> {
    // Simulate storage delete operation
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 3);
    });
  }
  
  /**
   * Calculate statistics for a dataset
   * @param data Array of numbers to analyze
   */
  private static calculateStatistics(data: number[]): { 
    mean: number; 
    median: number; 
    min: number; 
    max: number; 
    stdDev: number 
  } {
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    
    // Sort data for median and min/max
    const sorted = [...data].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    // Calculate median
    let median: number;
    if (sorted.length % 2 === 0) {
      median = (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    } else {
      median = sorted[Math.floor(sorted.length / 2)];
    }
    
    // Calculate standard deviation
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, median, min, max, stdDev };
  }
  
  /**
   * Simulate rendering a component
   * @param componentType Type of component to render
   */
  private static simulateComponentRendering(componentType: number): void {
    // Simulate rendering different component types
    switch(componentType) {
      case 0: // Simple component
        // Just do some basic work
        break;
      case 1: // List component
        // Simulate rendering a list
        for (let i = 0; i < 50; i++) {
          // Each list item
        }
        break;
      case 2: // Form component
        // Simulate rendering a complex form
        for (let i = 0; i < 10; i++) {
          // Each form field
        }
        break;
      case 3: // Chart component
        // Simulate rendering a data visualization
        for (let i = 0; i < 100; i++) {
          // Each data point
          const x = Math.sin(i / 10);
          const y = Math.cos(i / 10);
          // Draw point at (x, y)
        }
        break;
      case 4: // Table component
        // Simulate rendering a complex table
        for (let row = 0; row < 20; row++) {
          for (let col = 0; col < 10; col++) {
            // Each cell
          }
        }
        break;
    }
  }
  
  /**
   * Generate test payloads for benchmarking
   * @param count Number of payloads to generate
   * @param size Approximate size of each payload in bytes
   */
  private static generateTestPayloads(count: number, size: number): any[] {
    const payloads = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a payload of approximately the requested size
      const payload: any = {
        id: `item-${i}`,
        timestamp: Date.now(),
        data: {}
      };
      
      // Add properties to reach approximate size
      const itemsNeeded = Math.max(1, Math.floor(size / 20));
      
      for (let j = 0; j < itemsNeeded; j++) {
        payload.data[`field${j}`] = `value-${i}-${j}-${Math.random().toString(36).substring(2, 7)}`;
      }
      
      payloads.push(payload);
    }
    
    return payloads;
  }
  
  /**
   * Generate test messages for benchmarking
   * @param count Number of messages to generate
   */
  private static generateTestMessages(count: number): any[] {
    const messages = [];
    const types = ['info', 'warning', 'error', 'debug', 'critical'];
    
    for (let i = 0; i < count; i++) {
      messages.push({
        id: `msg-${i}`,
        type: types[i % types.length],
        content: `Test message ${i}`,
        timestamp: Date.now(),
        metadata: {
          source: 'benchmark',
          priority: (i % 5) + 1
        }
      });
    }
    
    return messages;
  }
  
  /**
   * Generate storage items for benchmarking
   * @param count Number of items to generate
   */
  private static generateStorageItems(count: number): Array<{ id: string; value: any }> {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      items.push({
        id: `storage-item-${i}`,
        value: {
          name: `Item ${i}`,
          created: new Date(),
          tags: [`tag-${i % 5}`, `priority-${i % 3}`],
          counter: i
        }
      });
    }
    
    return items;
  }
  
  /**
   * Generate datasets for statistical calculations
   * @param count Number of datasets to generate
   */
  private static generateStatisticalDatasets(count: number): number[][] {
    const datasets = [];
    
    for (let i = 0; i < count; i++) {
      const datasetSize = 50 + Math.floor(Math.random() * 100);
      const dataset = [];
      
      for (let j = 0; j < datasetSize; j++) {
        dataset.push(Math.random() * 100);
      }
      
      datasets.push(dataset);
    }
    
    return datasets;
  }
  
  /**
   * Split an array into chunks of a specified size
   * @param array Array to split
   * @param chunkSize Maximum size of each chunk
   */
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  /**
   * Get current memory usage if available
   * @returns Memory usage in bytes or null if not available
   */
  private static getMemoryUsage(): number | null {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return ((performance as any).memory as any).usedJSHeapSize;
    }
    return null;
  }
} 