/**
 * RequestQueue.ts
 * 
 * Implements a priority-based request queue for managing network requests
 * with different importance levels. This component handles the queuing,
 * prioritization, and scheduling of network requests.
 */

import { AxiosRequestConfig } from 'axios';
import { NetworkOptimizer } from './NetworkOptimizer';

/**
 * Priority levels for requests
 */
export enum RequestPriority {
  CRITICAL = 10,  // User-facing, blocking operations
  HIGH = 7,       // Important but non-blocking operations
  NORMAL = 5,     // Standard API calls
  LOW = 3,        // Background operations
  BACKGROUND = 1  // Prefetching, analytics, etc.
}

/**
 * Configuration options for the RequestQueue
 */
export interface RequestQueueConfig {
  // Maximum concurrent requests (overall)
  maxConcurrentRequests?: number;
  
  // Maximum concurrent requests per priority level
  maxConcurrentPerPriority?: {
    [key in RequestPriority]?: number;
  };
  
  // Enable background processing during idle periods
  enableBackgroundProcessing?: boolean;
  
  // Timeout in ms for different priority levels
  timeoutsByPriority?: {
    [key in RequestPriority]?: number;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: RequestQueueConfig = {
  maxConcurrentRequests: 8,
  maxConcurrentPerPriority: {
    [RequestPriority.CRITICAL]: 4,
    [RequestPriority.HIGH]: 3,
    [RequestPriority.NORMAL]: 2,
    [RequestPriority.LOW]: 1,
    [RequestPriority.BACKGROUND]: 1
  },
  enableBackgroundProcessing: true,
  timeoutsByPriority: {
    [RequestPriority.CRITICAL]: 10000,   // 10 seconds
    [RequestPriority.HIGH]: 15000,       // 15 seconds
    [RequestPriority.NORMAL]: 30000,     // 30 seconds
    [RequestPriority.LOW]: 45000,        // 45 seconds
    [RequestPriority.BACKGROUND]: 60000  // 60 seconds
  }
};

/**
 * Information about an active request
 */
interface ActiveRequest {
  id: string;
  priority: RequestPriority;
  startTime: number;
  timeout: NodeJS.Timeout | null;
}

/**
 * RequestQueue class manages network requests with different priorities
 */
export class RequestQueue {
  private static instance: RequestQueue;
  private config: RequestQueueConfig;
  private networkOptimizer: NetworkOptimizer;
  private activeRequests: Map<string, ActiveRequest> = new Map();
  private priorityCounts: Record<RequestPriority, number> = {
    [RequestPriority.CRITICAL]: 0,
    [RequestPriority.HIGH]: 0,
    [RequestPriority.NORMAL]: 0,
    [RequestPriority.LOW]: 0,
    [RequestPriority.BACKGROUND]: 0
  };
  private idleCallbackId: number | null = null;
  
  /**
   * Creates a new RequestQueue
   */
  private constructor(config: RequestQueueConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.networkOptimizer = NetworkOptimizer.getInstance();
    
    // Schedule background processing if enabled
    if (this.config.enableBackgroundProcessing && typeof requestIdleCallback !== 'undefined') {
      this.scheduleBackgroundProcessing();
    }
  }
  
  /**
   * Get the RequestQueue instance (singleton)
   */
  public static getInstance(config?: RequestQueueConfig): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue(config);
    }
    return RequestQueue.instance;
  }
  
  /**
   * Schedule background processing during idle periods
   */
  private scheduleBackgroundProcessing(): void {
    // Cancel any existing idle callback
    if (this.idleCallbackId !== null && typeof cancelIdleCallback !== 'undefined') {
      cancelIdleCallback(this.idleCallbackId);
    }
    
    // Schedule a new idle callback if supported
    if (typeof requestIdleCallback !== 'undefined') {
      this.idleCallbackId = requestIdleCallback(() => {
        // Process background requests during idle time
        this.processBackgroundRequests();
        
        // Reschedule for the next idle period
        this.scheduleBackgroundProcessing();
      });
    } else {
      // Fallback for platforms without requestIdleCallback
      setTimeout(() => {
        this.processBackgroundRequests();
        this.scheduleBackgroundProcessing();
      }, 1000);
    }
  }
  
  /**
   * Process background (low priority) requests during idle periods
   */
  private processBackgroundRequests(): void {
    // Only process if we're under the concurrent limit
    const totalActive = Array.from(Object.values(this.priorityCounts))
      .reduce((sum, count) => sum + count, 0);
      
    if (totalActive >= (this.config.maxConcurrentRequests || 8)) {
      return;
    }
    
    // We could trigger processing of background requests here
    // but the NetworkOptimizer already handles the actual processing
  }
  
  /**
   * Add a GET request to the queue
   */
  public async get<T>(
    url: string, 
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.enqueueRequest<T>('GET', url, undefined, config, priority);
  }
  
  /**
   * Add a POST request to the queue
   */
  public async post<T>(
    url: string, 
    data?: any,
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.enqueueRequest<T>('POST', url, data, config, priority);
  }
  
  /**
   * Add a PUT request to the queue
   */
  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.enqueueRequest<T>('PUT', url, data, config, priority);
  }
  
  /**
   * Add a PATCH request to the queue
   */
  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.enqueueRequest<T>('PATCH', url, data, config, priority);
  }
  
  /**
   * Add a DELETE request to the queue
   */
  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.enqueueRequest<T>('DELETE', url, undefined, config, priority);
  }
  
  /**
   * Enqueue a request with the NetworkOptimizer
   */
  private async enqueueRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    // Generate a unique ID for this request
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we can process this request now or need to queue it
    if (!this.canProcessRequest(priority)) {
      // Create a promise that will resolve when the request can be processed
      return new Promise<T>((resolve, reject) => {
        // Queue the request for later processing
        setTimeout(() => {
          // Try again after a delay based on priority
          this.enqueueRequest<T>(method, url, data, config, priority)
            .then(resolve)
            .catch(reject);
        }, this.getDelayForPriority(priority));
      });
    }
    
    try {
      // Mark request as active
      this.trackActiveRequest(requestId, priority);
      
      // Enqueue with the NetworkOptimizer
      const result = await this.networkOptimizer.enqueueRequest<T>(
        method,
        url,
        data,
        config,
        priority
      );
      
      // Request completed successfully
      this.untrackActiveRequest(requestId);
      return result;
    } catch (error) {
      // Request failed
      this.untrackActiveRequest(requestId);
      throw error;
    }
  }
  
  /**
   * Track an active request
   */
  private trackActiveRequest(id: string, priority: RequestPriority): void {
    // Create timeout based on priority
    const timeout = setTimeout(() => {
      // Request has timed out
      this.untrackActiveRequest(id);
    }, this.config.timeoutsByPriority?.[priority] || 30000);
    
    // Record the active request
    this.activeRequests.set(id, {
      id,
      priority,
      startTime: Date.now(),
      timeout
    });
    
    // Update priority counts
    this.priorityCounts[priority]++;
  }
  
  /**
   * Remove tracking for a completed request
   */
  private untrackActiveRequest(id: string): void {
    const request = this.activeRequests.get(id);
    if (request) {
      // Clear any timeout
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      
      // Update priority counts
      this.priorityCounts[request.priority]--;
      
      // Remove from active requests
      this.activeRequests.delete(id);
    }
  }
  
  /**
   * Check if a request with the given priority can be processed now
   */
  private canProcessRequest(priority: RequestPriority): boolean {
    // Check total concurrent requests limit
    const totalActive = Array.from(Object.values(this.priorityCounts))
      .reduce((sum, count) => sum + count, 0);
      
    if (totalActive >= (this.config.maxConcurrentRequests || 8)) {
      // Only allow critical requests when at capacity
      return priority === RequestPriority.CRITICAL;
    }
    
    // Check priority-specific limits
    const priorityLimit = this.config.maxConcurrentPerPriority?.[priority] || 2;
    if (this.priorityCounts[priority] >= priorityLimit) {
      return false;
    }
    
    // Can process the request
    return true;
  }
  
  /**
   * Calculate delay for retrying a request based on priority
   */
  private getDelayForPriority(priority: RequestPriority): number {
    switch (priority) {
      case RequestPriority.CRITICAL:
        return 100;  // Almost immediate retry
      case RequestPriority.HIGH:
        return 500;  // Half second
      case RequestPriority.NORMAL:
        return 1000; // One second
      case RequestPriority.LOW:
        return 2000; // Two seconds
      case RequestPriority.BACKGROUND:
        return 5000; // Five seconds
      default:
        return 1000; // Default one second
    }
  }
  
  /**
   * Cancel all active requests
   */
  public cancelAllRequests(): void {
    // Clear all active requests
    this.activeRequests.forEach((request) => {
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
    });
    
    // Reset tracking
    this.activeRequests.clear();
    this.priorityCounts = {
      [RequestPriority.CRITICAL]: 0,
      [RequestPriority.HIGH]: 0,
      [RequestPriority.NORMAL]: 0,
      [RequestPriority.LOW]: 0,
      [RequestPriority.BACKGROUND]: 0
    };
    
    // Clear any pending requests in the NetworkOptimizer
    this.networkOptimizer.clearQueue();
  }
  
  /**
   * Get statistics about current request queue
   */
  public getQueueStats(): Record<string, any> {
    return {
      activeRequests: this.activeRequests.size,
      byPriority: { ...this.priorityCounts },
      oldestRequest: this.getOldestRequestAge()
    };
  }
  
  /**
   * Get the age of the oldest active request in milliseconds
   */
  private getOldestRequestAge(): number {
    if (this.activeRequests.size === 0) {
      return 0;
    }
    
    const now = Date.now();
    let oldestTime = now;
    
    this.activeRequests.forEach((request) => {
      if (request.startTime < oldestTime) {
        oldestTime = request.startTime;
      }
    });
    
    return now - oldestTime;
  }
} 