/**
 * NetworkPerformanceBenchmark.ts
 * 
 * Utility for benchmarking and measuring network performance metrics
 * including request times, compression ratios, and connection efficiency.
 */

import { NetworkOptimizer } from '@/services/network/NetworkOptimizer';
import { RequestPriority, RequestQueue } from '@/services/network/RequestQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Network performance test types
 */
export enum NetworkTestType {
  BASIC_REQUEST = 'basic_request',
  BATCH_REQUEST = 'batch_request',
  COMPRESSED_REQUEST = 'compressed_request',
  PREFETCH = 'prefetch',
  CONNECTION_REUSE = 'connection_reuse',
  RETRY_LOGIC = 'retry_logic'
}

/**
 * Network test results
 */
export interface NetworkTestResult {
  testType: NetworkTestType;
  timestamp: number;
  duration: number;
  requestSize: number;
  responseSize: number;
  compressionRatio?: number;
  networkType: string;
  successful: boolean;
  errorMessage?: string;
  requestCount?: number;
  metadata?: Record<string, any>;
}

/**
 * Test configurations
 */
export interface NetworkTestConfig {
  endpoint: string;
  payload?: any;
  repeatCount?: number;
  concurrentCount?: number;
  timeoutMs?: number;
  priority?: RequestPriority;
  forceCompression?: boolean;
}

/**
 * Network performance benchmark utility
 */
export class NetworkPerformanceBenchmark {
  private static instance: NetworkPerformanceBenchmark;
  private networkOptimizer: NetworkOptimizer;
  private requestQueue: RequestQueue;
  private testResults: NetworkTestResult[] = [];
  private readonly maxStoredResults = 100;
  private readonly storageKey = 'network_benchmark_results';
  
  /**
   * Create a new NetworkPerformanceBenchmark
   */
  private constructor() {
    this.networkOptimizer = NetworkOptimizer.getInstance();
    this.requestQueue = RequestQueue.getInstance();
    this.loadResults();
  }
  
  /**
   * Get the NetworkPerformanceBenchmark instance (singleton)
   */
  public static getInstance(): NetworkPerformanceBenchmark {
    if (!NetworkPerformanceBenchmark.instance) {
      NetworkPerformanceBenchmark.instance = new NetworkPerformanceBenchmark();
    }
    return NetworkPerformanceBenchmark.instance;
  }
  
  /**
   * Load previously saved test results
   */
  private async loadResults(): Promise<void> {
    try {
      const savedResults = await AsyncStorage.getItem(this.storageKey);
      if (savedResults) {
        this.testResults = JSON.parse(savedResults);
      }
    } catch (error) {
      console.error('Error loading benchmark results:', error);
    }
  }
  
  /**
   * Save test results to storage
   */
  private async saveResults(): Promise<void> {
    try {
      // Limit the number of stored results
      if (this.testResults.length > this.maxStoredResults) {
        this.testResults = this.testResults.slice(-this.maxStoredResults);
      }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.testResults));
    } catch (error) {
      console.error('Error saving benchmark results:', error);
    }
  }
  
  /**
   * Run a basic request test
   */
  public async runBasicRequestTest(config: NetworkTestConfig): Promise<NetworkTestResult> {
    const testStartTime = Date.now();
    let networkType = 'unknown';
    
    try {
      // Get current network state
      const networkState = await NetInfo.fetch();
      networkType = networkState.type;
      
      // Create the request payload
      const payload = config.payload || { test: 'basic_request' };
      const payloadString = JSON.stringify(payload);
      const requestSize = payloadString.length;
      
      // Make the request and measure time
      const startTime = Date.now();
      const response = await this.requestQueue.post(
        config.endpoint,
        payload,
        { timeout: config.timeoutMs || 10000 },
        config.priority || RequestPriority.NORMAL
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Get the response data and size
      const responseData = await response.json();
      const responseSize = JSON.stringify(responseData).length;
      
      // Create the test result
      const result: NetworkTestResult = {
        testType: NetworkTestType.BASIC_REQUEST,
        timestamp: testStartTime,
        duration,
        requestSize,
        responseSize,
        networkType,
        successful: true,
        metadata: {
          endpoint: config.endpoint,
          statusCode: response.status
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    } catch (error) {
      // Create an error result
      const result: NetworkTestResult = {
        testType: NetworkTestType.BASIC_REQUEST,
        timestamp: testStartTime,
        duration: Date.now() - testStartTime,
        requestSize: config.payload ? JSON.stringify(config.payload).length : 0,
        responseSize: 0,
        networkType,
        successful: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        metadata: {
          endpoint: config.endpoint
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    }
  }
  
  /**
   * Run a batch request test
   */
  public async runBatchRequestTest(config: NetworkTestConfig): Promise<NetworkTestResult> {
    const testStartTime = Date.now();
    let networkType = 'unknown';
    const requestCount = config.repeatCount || 5;
    
    try {
      // Get current network state
      const networkState = await NetInfo.fetch();
      networkType = networkState.type;
      
      // Create the request payload
      const payload = config.payload || { test: 'batch_request' };
      const payloadString = JSON.stringify(payload);
      const requestSize = payloadString.length * requestCount;
      
      // Create an array of requests
      const requests = Array(requestCount).fill(0).map(() => 
        this.requestQueue.post(
          config.endpoint,
          payload,
          { timeout: config.timeoutMs || 10000 },
          config.priority || RequestPriority.NORMAL
        )
      );
      
      // Execute all requests and measure time
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Calculate total response size
      let totalResponseSize = 0;
      for (const response of responses) {
        const responseData = await response.json();
        totalResponseSize += JSON.stringify(responseData).length;
      }
      
      // Create the test result
      const result: NetworkTestResult = {
        testType: NetworkTestType.BATCH_REQUEST,
        timestamp: testStartTime,
        duration,
        requestSize,
        responseSize: totalResponseSize,
        networkType,
        successful: true,
        requestCount,
        metadata: {
          endpoint: config.endpoint,
          batchSize: requestCount,
          averageRequestTime: duration / requestCount
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    } catch (error) {
      // Create an error result
      const result: NetworkTestResult = {
        testType: NetworkTestType.BATCH_REQUEST,
        timestamp: testStartTime,
        duration: Date.now() - testStartTime,
        requestSize: config.payload ? JSON.stringify(config.payload).length * requestCount : 0,
        responseSize: 0,
        networkType,
        successful: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        requestCount,
        metadata: {
          endpoint: config.endpoint,
          batchSize: requestCount
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    }
  }
  
  /**
   * Run a test with compressed requests
   */
  public async runCompressedRequestTest(config: NetworkTestConfig): Promise<NetworkTestResult> {
    const testStartTime = Date.now();
    let networkType = 'unknown';
    
    try {
      // Get current network state
      const networkState = await NetInfo.fetch();
      networkType = networkState.type;
      
      // Create a large payload to test compression
      const payload = config.payload || this.generateLargePayload();
      const payloadString = JSON.stringify(payload);
      const originalSize = payloadString.length;
      
      // Import pako for compression
      const pako = await import('pako');
      
      // Compress the payload
      const compressed = pako.deflate(payloadString);
      const compressedSize = compressed.length;
      const compressionRatio = originalSize / compressedSize;
      
      // Make the request with compressed data
      const startTime = Date.now();
      const response = await this.requestQueue.post(
        config.endpoint,
        compressed,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip'
          },
          timeout: config.timeoutMs || 10000 
        },
        config.priority || RequestPriority.NORMAL
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Get the response data and size
      const responseData = await response.json();
      const responseSize = JSON.stringify(responseData).length;
      
      // Create the test result
      const result: NetworkTestResult = {
        testType: NetworkTestType.COMPRESSED_REQUEST,
        timestamp: testStartTime,
        duration,
        requestSize: originalSize,
        responseSize,
        compressionRatio,
        networkType,
        successful: true,
        metadata: {
          endpoint: config.endpoint,
          statusCode: response.status,
          originalSize,
          compressedSize,
          compressionRatio
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    } catch (error) {
      // Create an error result
      const result: NetworkTestResult = {
        testType: NetworkTestType.COMPRESSED_REQUEST,
        timestamp: testStartTime,
        duration: Date.now() - testStartTime,
        requestSize: config.payload ? JSON.stringify(config.payload).length : 0,
        responseSize: 0,
        networkType,
        successful: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        metadata: {
          endpoint: config.endpoint
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    }
  }
  
  /**
   * Run a prefetch test
   */
  public async runPrefetchTest(config: NetworkTestConfig): Promise<NetworkTestResult> {
    const testStartTime = Date.now();
    let networkType = 'unknown';
    
    try {
      // Get current network state
      const networkState = await NetInfo.fetch();
      networkType = networkState.type;
      
      // First access (prefetch)
      const prefetchStartTime = Date.now();
      await this.requestQueue.get(
        config.endpoint,
        { headers: { 'X-Prefetch': 'true' } },
        RequestPriority.BACKGROUND
      );
      const prefetchDuration = Date.now() - prefetchStartTime;
      
      // Wait a bit to simulate later access
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Second access (should be faster due to prefetch)
      const accessStartTime = Date.now();
      const response = await this.requestQueue.get(
        config.endpoint,
        {},
        RequestPriority.NORMAL
      );
      const accessDuration = Date.now() - accessStartTime;
      
      // Get the response data and size
      const responseData = await response.json();
      const responseSize = JSON.stringify(responseData).length;
      
      // Create the test result
      const result: NetworkTestResult = {
        testType: NetworkTestType.PREFETCH,
        timestamp: testStartTime,
        duration: accessDuration, // We care about the access time, not prefetch time
        requestSize: 0, // No request payload for GET
        responseSize,
        networkType,
        successful: true,
        metadata: {
          endpoint: config.endpoint,
          prefetchDuration,
          accessDuration,
          improvementPercent: prefetchDuration > 0 
            ? ((prefetchDuration - accessDuration) / prefetchDuration * 100).toFixed(2) + '%'
            : 'N/A'
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    } catch (error) {
      // Create an error result
      const result: NetworkTestResult = {
        testType: NetworkTestType.PREFETCH,
        timestamp: testStartTime,
        duration: Date.now() - testStartTime,
        requestSize: 0,
        responseSize: 0,
        networkType,
        successful: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        metadata: {
          endpoint: config.endpoint
        }
      };
      
      // Save the result
      this.testResults.push(result);
      this.saveResults();
      
      return result;
    }
  }
  
  /**
   * Run all benchmark tests
   */
  public async runAllTests(endpoint: string): Promise<NetworkTestResult[]> {
    const results: NetworkTestResult[] = [];
    
    // Run basic request test
    results.push(await this.runBasicRequestTest({ endpoint }));
    
    // Run batch request test
    results.push(await this.runBatchRequestTest({ endpoint, repeatCount: 5 }));
    
    // Run compressed request test
    results.push(await this.runCompressedRequestTest({ endpoint }));
    
    // Run prefetch test
    results.push(await this.runPrefetchTest({ endpoint }));
    
    return results;
  }
  
  /**
   * Get all test results
   */
  public getResults(): NetworkTestResult[] {
    return [...this.testResults];
  }
  
  /**
   * Get results for a specific test type
   */
  public getResultsByType(testType: NetworkTestType): NetworkTestResult[] {
    return this.testResults.filter(result => result.testType === testType);
  }
  
  /**
   * Clear all test results
   */
  public async clearResults(): Promise<void> {
    this.testResults = [];
    await AsyncStorage.removeItem(this.storageKey);
  }
  
  /**
   * Generate a large payload for testing compression
   */
  private generateLargePayload(): any {
    // Create a payload with repeating data to test compression efficiency
    const baseItem = {
      id: 'test-item',
      name: 'Test Item with a Somewhat Long Name to Test Compression',
      description: 'This is a test item with a long description that contains repeating text. ' +
        'Repeating text is more compressible and helps demonstrate the benefits of compression. ' +
        'This text will repeat multiple times to create a larger payload.',
      tags: ['test', 'compression', 'network', 'optimization', 'performance', 'benchmark'],
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        author: 'NetworkPerformanceBenchmark',
        type: 'test-data',
        purpose: 'compression-testing'
      }
    };
    
    // Create an array with many copies of the base item
    return {
      items: Array(100).fill(0).map((_, index) => ({
        ...baseItem,
        id: `test-item-${index}`,
        index
      })),
      metadata: {
        count: 100,
        timestamp: Date.now(),
        test: 'compression-test'
      }
    };
  }
  
  /**
   * Generate performance report
   */
  public generateReport(): Record<string, any> {
    // Calculate averages by test type
    const reportByType: Record<string, any> = {};
    
    // Process each test type
    for (const type of Object.values(NetworkTestType)) {
      const results = this.getResultsByType(type as NetworkTestType);
      
      if (results.length === 0) {
        continue;
      }
      
      // Calculate success rate
      const successCount = results.filter(r => r.successful).length;
      const successRate = results.length > 0 ? successCount / results.length : 0;
      
      // Calculate average duration for successful tests
      const successfulResults = results.filter(r => r.successful);
      const avgDuration = successfulResults.length > 0
        ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length
        : 0;
      
      // Calculate compression ratio for compressed requests
      let avgCompressionRatio = 0;
      if (type === NetworkTestType.COMPRESSED_REQUEST) {
        const withRatio = successfulResults.filter(r => r.compressionRatio !== undefined);
        avgCompressionRatio = withRatio.length > 0
          ? withRatio.reduce((sum, r) => sum + (r.compressionRatio || 0), 0) / withRatio.length
          : 0;
      }
      
      // Add to report
      reportByType[type] = {
        testCount: results.length,
        successCount,
        successRate,
        avgDuration,
        avgCompressionRatio: type === NetworkTestType.COMPRESSED_REQUEST ? avgCompressionRatio : undefined,
        lastTest: results[results.length - 1]
      };
    }
    
    // Generate overall report
    return {
      totalTests: this.testResults.length,
      byTestType: reportByType,
      overallSuccessRate: this.testResults.length > 0
        ? this.testResults.filter(r => r.successful).length / this.testResults.length
        : 0,
      timestamp: Date.now()
    };
  }
} 