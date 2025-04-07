/**
 * NetworkOptimizer.ts
 * 
 * Implements network optimization strategies for the EcoCart app API calls.
 * This includes request batching, throttling, and connection management.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AxiosRequestConfig } from 'axios';

// Configuration interface for NetworkOptimizer
export interface NetworkOptimizerConfig {
  // Maximum number of requests in a batch
  maxBatchSize?: number;
  
  // Delay in ms to wait before sending a batch
  batchDelay?: number;
  
  // Maximum requests per minute for rate limiting
  requestsPerMinute?: number;
  
  // True to enable adaptive throttling based on network conditions
  adaptiveThrottling?: boolean;
  
  // True to enable request coalescing (combining duplicate requests)
  enableCoalescing?: boolean;
}

// Default configuration values
const DEFAULT_CONFIG: NetworkOptimizerConfig = {
  maxBatchSize: 5,
  batchDelay: 50,
  requestsPerMinute: 60,
  adaptiveThrottling: true,
  enableCoalescing: true,
};

// Type definitions for request handling
type RequestId = string;
type RequestHash = string;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Interface for queued requests
interface QueuedRequest {
  id: RequestId;
  url: string;
  method: HttpMethod;
  data?: any;
  config?: AxiosRequestConfig;
  priority: number;
  timestamp: number;
  hash: RequestHash;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

/**
 * NetworkOptimizer class provides optimized network request handling
 * with batching, throttling, and connection management features.
 */
export class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private config: NetworkOptimizerConfig;
  private requestQueue: QueuedRequest[] = [];
  private processingBatch = false;
  private requestCounts: { [minute: string]: number } = {};
  private networkType: string | null = 'unknown';
  private isConnected = true;
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingRequests: Map<RequestHash, QueuedRequest[]> = new Map();
  
  /**
   * Creates a new NetworkOptimizer instance
   */
  private constructor(config: NetworkOptimizerConfig = {}) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Subscribe to network info changes
    NetInfo.addEventListener(this.handleNetworkChange);
    
    // Initialize network state
    this.updateNetworkState();
  }
  
  /**
   * Get the NetworkOptimizer instance (singleton)
   */
  public static getInstance(config?: NetworkOptimizerConfig): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer(config);
    }
    return NetworkOptimizer.instance;
  }
  
  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState) => {
    this.isConnected = state.isConnected ?? false;
    this.networkType = state.type;
    
    // If we transition to connected, process any pending requests
    if (this.isConnected && this.requestQueue.length > 0) {
      this.processBatch();
    }
    
    // Save metrics about network change
    this.recordNetworkMetrics(state);
  };
  
  /**
   * Update network state information
   */
  private async updateNetworkState(): Promise<void> {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected ?? false;
      this.networkType = state.type;
    } catch (error) {
      console.error('Failed to fetch network state:', error);
    }
  }
  
  /**
   * Generate a hash for a request to identify duplicates
   */
  private hashRequest(method: HttpMethod, url: string, data?: any): RequestHash {
    // Simple hash function for request deduplication
    return `${method}:${url}:${data ? JSON.stringify(data) : ''}`;
  }
  
  /**
   * Add a request to the queue for processing
   */
  public async enqueueRequest<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    priority = 1
  ): Promise<T> {
    // Generate a unique ID and hash for the request
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const hash = this.hashRequest(method, url, data);
    
    // Create a new promise for this request
    return new Promise<T>((resolve, reject) => {
      // Create the request object
      const request: QueuedRequest = {
        id,
        url,
        method,
        data,
        config,
        priority,
        timestamp: Date.now(),
        hash,
        resolve,
        reject,
      };
      
      // If request coalescing is enabled, check for duplicate requests
      if (this.config.enableCoalescing) {
        const existingRequests = this.pendingRequests.get(hash) || [];
        existingRequests.push(request);
        this.pendingRequests.set(hash, existingRequests);
        
        // If this is not the first identical request, don't add it to the main queue
        if (existingRequests.length > 1) {
          return;
        }
      }
      
      // Add the request to the queue
      this.requestQueue.push(request);
      
      // Sort queue by priority (higher priority first)
      this.requestQueue.sort((a, b) => b.priority - a.priority);
      
      // Set up a timer to process the batch if not already processing
      if (!this.processingBatch && this.batchTimer === null) {
        this.batchTimer = setTimeout(() => {
          this.batchTimer = null;
          this.processBatch();
        }, this.config.batchDelay);
      }
    });
  }
  
  /**
   * Process a batch of requests from the queue
   */
  private async processBatch(): Promise<void> {
    // Already processing or queue is empty
    if (this.processingBatch || this.requestQueue.length === 0) {
      return;
    }
    
    this.processingBatch = true;
    
    try {
      // Check network availability first
      if (!this.isConnected) {
        // Queue will be processed when network becomes available
        this.processingBatch = false;
        return;
      }
      
      // Apply throttling if needed
      if (this.shouldThrottle()) {
        // Will retry later
        this.processingBatch = false;
        setTimeout(() => this.processBatch(), this.calculateThrottleDelay());
        return;
      }
      
      // Determine batch size based on network conditions
      const batchSize = this.calculateOptimalBatchSize();
      
      // Take a batch of requests from the queue
      const batch = this.requestQueue.splice(0, batchSize);
      
      // Process each request in the batch
      await Promise.all(batch.map(request => this.processRequest(request)));
      
      // Continue processing if there are more requests
      this.processingBatch = false;
      if (this.requestQueue.length > 0) {
        this.processBatch();
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      this.processingBatch = false;
    }
  }
  
  /**
   * Process a single request
   */
  private async processRequest(request: QueuedRequest): Promise<void> {
    try {
      // Get API service instance from ApiService.ts
      const { api } = await import('../api');
      
      // Record the request for rate limiting
      this.recordRequest();
      
      // Execute the request based on method
      let response;
      switch (request.method) {
        case 'GET':
          response = await api.get(request.url, request.config);
          break;
        case 'POST':
          response = await api.post(request.url, request.data, request.config);
          break;
        case 'PUT':
          response = await api.put(request.url, request.data, request.config);
          break;
        case 'PATCH':
          response = await api.patch(request.url, request.data, request.config);
          break;
        case 'DELETE':
          response = await api.delete(request.url, request.config);
          break;
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }
      
      // Resolve all coalesced requests with the same result
      if (this.config.enableCoalescing) {
        const requests = this.pendingRequests.get(request.hash) || [];
        requests.forEach(req => req.resolve(response));
        this.pendingRequests.delete(request.hash);
      } else {
        // Just resolve this request
        request.resolve(response);
      }
    } catch (error) {
      // Reject all coalesced requests with the same error
      if (this.config.enableCoalescing) {
        const requests = this.pendingRequests.get(request.hash) || [];
        requests.forEach(req => req.reject(error));
        this.pendingRequests.delete(request.hash);
      } else {
        // Just reject this request
        request.reject(error);
      }
    }
  }
  
  /**
   * Record a request for rate limiting purposes
   */
  private recordRequest(): void {
    const now = new Date();
    const minute = `${now.getHours()}:${now.getMinutes()}`;
    
    // Initialize or increment the count for this minute
    this.requestCounts[minute] = (this.requestCounts[minute] || 0) + 1;
    
    // Clean up old entries (keep only the last 5 minutes)
    const minutes = Object.keys(this.requestCounts);
    if (minutes.length > 5) {
      delete this.requestCounts[minutes[0]];
    }
  }
  
  /**
   * Check if requests should be throttled
   */
  private shouldThrottle(): boolean {
    // If adaptive throttling is disabled, use simple rate limiting
    if (!this.config.adaptiveThrottling) {
      return this.getCurrentRequestRate() >= (this.config.requestsPerMinute || 60);
    }
    
    // With adaptive throttling, adjust based on network type
    const baseLimit = this.config.requestsPerMinute || 60;
    let adjustedLimit = baseLimit;
    
    // Adjust limit based on network type
    switch (this.networkType) {
      case 'wifi':
        // Full speed on WiFi
        adjustedLimit = baseLimit;
        break;
      case 'cellular':
        // 75% on cellular
        adjustedLimit = Math.floor(baseLimit * 0.75);
        break;
      case '2g':
        // 25% on 2G
        adjustedLimit = Math.floor(baseLimit * 0.25);
        break;
      case '3g':
        // 50% on 3G
        adjustedLimit = Math.floor(baseLimit * 0.5);
        break;
      case '4g':
        // 75% on 4G
        adjustedLimit = Math.floor(baseLimit * 0.75);
        break;
      default:
        // 50% for unknown or other types
        adjustedLimit = Math.floor(baseLimit * 0.5);
    }
    
    return this.getCurrentRequestRate() >= adjustedLimit;
  }
  
  /**
   * Calculate delay for throttling
   */
  private calculateThrottleDelay(): number {
    // Base delay
    let delay = 1000; // 1 second
    
    // Adjust based on how far over the limit we are
    const currentRate = this.getCurrentRequestRate();
    const limit = this.config.requestsPerMinute || 60;
    
    if (currentRate > limit) {
      // Add extra delay proportional to how far over limit we are
      const overageRatio = currentRate / limit;
      delay += Math.floor(overageRatio * 1000);
    }
    
    return delay;
  }
  
  /**
   * Get the current request rate (requests per minute)
   */
  private getCurrentRequestRate(): number {
    const now = new Date();
    const currentMinute = `${now.getHours()}:${now.getMinutes()}`;
    return this.requestCounts[currentMinute] || 0;
  }
  
  /**
   * Calculate optimal batch size based on network conditions
   */
  private calculateOptimalBatchSize(): number {
    const maxSize = this.config.maxBatchSize || 5;
    
    // Adjust batch size based on network type
    if (!this.config.adaptiveThrottling) {
      return maxSize;
    }
    
    switch (this.networkType) {
      case 'wifi':
        return maxSize;
      case 'cellular':
      case '4g':
        return Math.max(2, Math.floor(maxSize * 0.75));
      case '3g':
        return Math.max(2, Math.floor(maxSize * 0.5));
      case '2g':
        return 1;
      default:
        return Math.max(1, Math.floor(maxSize * 0.5));
    }
  }
  
  /**
   * Record network metrics for performance monitoring
   */
  private async recordNetworkMetrics(state: NetInfoState): Promise<void> {
    try {
      // Get current metrics
      const metricsString = await AsyncStorage.getItem('network_metrics') || '{}';
      const metrics = JSON.parse(metricsString);
      
      // Update metrics with network type changes
      const timestamp = Date.now();
      metrics.lastNetworkChange = timestamp;
      metrics.networkType = state.type;
      metrics.isConnected = state.isConnected;
      
      // Store network quality if available
      if (state.details && 'strength' in state.details) {
        metrics.signalStrength = (state.details as any).strength;
      }
      
      // Save updated metrics
      await AsyncStorage.setItem('network_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to record network metrics:', error);
    }
  }
  
  /**
   * Clear all pending requests (use for cleanup)
   */
  public clearQueue(): void {
    // Reject all pending requests
    this.requestQueue.forEach(request => {
      request.reject(new Error('Request cancelled - queue cleared'));
    });
    
    // Clear coalesced requests map
    this.pendingRequests.forEach(requests => {
      requests.forEach(request => {
        request.reject(new Error('Request cancelled - queue cleared'));
      });
    });
    
    // Reset data structures
    this.requestQueue = [];
    this.pendingRequests.clear();
    
    // Clear any pending batch timer
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
} 