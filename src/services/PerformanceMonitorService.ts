/**
 * PerformanceMonitorService.ts
 * 
 * Service for monitoring app performance in production.
 * Tracks key metrics like render times, API response times,
 * frame drops, and memory usage.
 */

import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Dimensions, InteractionManager, Platform } from 'react-native';
import {
    NetworkType,
    PerformanceContext
} from '../types/Performance';

// Performance metric types
export enum MetricType {
  RENDER_TIME = 'render_time',
  API_RESPONSE = 'api_response',
  FRAME_DROP = 'frame_drop',
  MEMORY_USAGE = 'memory_usage',
  APP_START = 'app_start',
  SCREEN_LOAD = 'screen_load',
  INTERACTION = 'interaction',
  ERROR = 'error',
  CRASH = 'crash',
  NETWORK = 'network',
  BATTERY = 'battery',
  STORAGE = 'storage'
}

// Performance metric data
interface PerformanceMetric {
  type: MetricType;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Performance Monitoring Service
 * 
 * Tracks and reports performance metrics for the application, including:
 * - API response times
 * - Screen load times
 * - App crashes
 * - Network errors
 * - Battery usage
 */
export class PerformanceMonitorService {
  // Static properties
  private static readonly METRICS_STORAGE_KEY = '@ecocart/performance_metrics';
  private static readonly METRICS_CONFIG_KEY = '@ecocart/performance_config';
  private static readonly MAX_STORED_METRICS = 100;
  private static readonly FLUSH_INTERVAL = 60000; // 1 minute
  private static instance: PerformanceMonitorService;
  
  // Instance properties
  private context: PerformanceContext | null = null;
  private metrics: PerformanceMetric[] = [];
  private renderStartTimes: Record<string, number> = {};
  private apiStartTimes: Record<string, number> = {};
  private isLowPerformanceDevice = false;
  private samplingRate = 1.0; // 100% by default
  private uploadUrl: string | null = null;
  private reportingThreshold = 10; // Upload after 10 metrics
  private isInitialized = false;
  private isNetworkInitialized = false;
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  /**
   * Initialize the performance monitoring service without network operations
   * This is safe to call during app startup
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const deviceInfo = {
        platform: Platform.OS,
        osVersion: Platform.Version.toString(),
        deviceModel: Device.modelName || 'Unknown',
        screenSize: {
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height
        }
      };

      const appInfo = {
        version: Application.nativeApplicationVersion || '1.0.0',
        buildNumber: Application.nativeBuildVersion || '1'
      };

      // Initialize with unknown network info
      const networkInfo = {
        type: 'unknown' as NetworkType,
        strength: 0
      };

      this.context = {
        deviceInfo,
        appInfo,
        networkInfo
      };

      this.isInitialized = true;
      
      // Schedule network initialization to run after the app UI is rendered
      InteractionManager.runAfterInteractions(() => {
        this.initializeNetworkFeatures().catch(error => {
          console.warn('Failed to initialize network features for performance monitoring:', error);
        });
      });
    } catch (error) {
      console.error('Failed to initialize PerformanceMonitorService:', error);
    }
  }

  /**
   * Initialize network-dependent features
   * This is called after the UI is rendered to avoid slowing app startup
   */
  private async initializeNetworkFeatures(): Promise<void> {
    if (this.isNetworkInitialized || !this.context) {
      return;
    }

    try {
      // Start periodic context updates
      this.startContextUpdates();
      
      // Start periodic metric flushing
      this.startMetricFlushing();

      this.isNetworkInitialized = true;
    } catch (error) {
      console.error('Failed to initialize network features:', error);
    }
  }

  /**
   * Start periodic context updates
   */
  private startContextUpdates(): void {
    // Update context every 5 minutes
    setInterval(() => {
      try {
        if (!this.context) return;
        
        // No network updates without expo-network, but we could add other updates here
      } catch (error) {
        console.error('Failed to update context:', error);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Start periodic metric flushing
   */
  private startMetricFlushing(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, PerformanceMonitorService.FLUSH_INTERVAL);
  }

  /**
   * Flush metrics to backend
   */
  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) {
      return;
    }

    try {
      // Copy metrics and clear the array
      const metricsToSend = [...this.metrics];
      this.metrics = [];

      // Skip sending if no upload URL is set
      if (!this.uploadUrl) {
        return;
      }

      // Send metrics to backend with timeout protection
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Metrics upload timeout')), 5000);
      });

      await Promise.race([
        fetch(this.uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            metrics: metricsToSend,
            context: this.context
          })
        }),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // If sending fails, add metrics back to the queue
      // But limit the number to avoid memory leaks
      if (this.metrics.length < PerformanceMonitorService.MAX_STORED_METRICS) {
        this.metrics.push(...this.metrics.slice(0, PerformanceMonitorService.MAX_STORED_METRICS - this.metrics.length));
      }
    }
  }

  /**
   * Determines if a metric should be sampled based on the sampling rate
   */
  private shouldSampleMetric(): boolean {
    return Math.random() < this.samplingRate;
  }

  /**
   * Records a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.shouldSampleMetric()) {
      return;
    }

    this.metrics.push(metric);

    // Flush metrics if threshold is reached and network is initialized
    if (this.metrics.length >= this.reportingThreshold && this.isNetworkInitialized) {
      this.flushMetrics();
    }
  }

  /**
   * Marks the start of a screen render
   * 
   * @param screenName Name of the screen being rendered
   */
  public markRenderStart(screenName: string): void {
    if (!this.shouldSampleMetric()) {
      return;
    }
    
    this.renderStartTimes[screenName] = performance.now();
  }

  /**
   * Marks the end of a screen render and records the metric
   * 
   * @param screenName Name of the screen being rendered
   * @param metadata Additional data about the render
   */
  public markRenderEnd(screenName: string, metadata?: Record<string, any>): void {
    if (!this.renderStartTimes[screenName]) {
      return;
    }
    
    const endTime = performance.now();
    const startTime = this.renderStartTimes[screenName];
    const duration = endTime - startTime;
    
    delete this.renderStartTimes[screenName];
    
    // Record the metric
    this.recordMetric({
      type: MetricType.RENDER_TIME,
      value: duration,
      timestamp: Date.now(),
      metadata,
    });
  }

  /**
   * Marks the start of an API request
   * 
   * @param requestId Identifier for the API request
   * @param endpoint API endpoint
   */
  public markApiStart(requestId: string, endpoint: string): void {
    if (!this.shouldSampleMetric()) {
      return;
    }
    
    this.apiStartTimes[requestId] = performance.now();
  }

  /**
   * Marks the end of an API request and records the metric
   * 
   * @param requestId Identifier for the API request
   * @param metadata Additional data about the API request
   */
  public markApiEnd(requestId: string, metadata?: Record<string, any>): void {
    if (!this.apiStartTimes[requestId]) {
      return;
    }
    
    const endTime = performance.now();
    const startTime = this.apiStartTimes[requestId];
    const duration = endTime - startTime;
    
    delete this.apiStartTimes[requestId];
    
    // Record the metric
    this.recordMetric({
      type: MetricType.API_RESPONSE,
      value: duration,
      timestamp: Date.now(),
      metadata,
    });
  }

  /**
   * Tracks network requests
   * 
   * @param url URL of the request
   * @param duration Duration of the request in ms
   * @param status HTTP status code
   * @param metadata Additional data about the request
   */
  public trackNetworkRequest(
    url: string, 
    duration: number, 
    status: number, 
    metadata?: Record<string, any>
  ): void {
    this.recordMetric({
      type: MetricType.NETWORK,
      value: duration,
      timestamp: Date.now(),
      metadata: {
        url,
        status,
        ...metadata
      }
    });
  }

  /**
   * Captures an error for monitoring
   * 
   * @param error The error that occurred
   * @param metadata Additional data about the error
   */
  public captureError(error: Error, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.ERROR,
      value: 1,
      timestamp: Date.now(),
      metadata: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...metadata
      }
    });
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static markRenderStart(screenName: string): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.markRenderStart(screenName);
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static markRenderEnd(screenName: string, metadata?: Record<string, any>): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.markRenderEnd(screenName, metadata);
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static markApiStart(requestId: string, endpoint: string): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.markApiStart(requestId, endpoint);
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static markApiEnd(requestId: string, metadata?: Record<string, any>): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.markApiEnd(requestId, metadata);
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static recordMetric(metric: PerformanceMetric): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.recordMetric(metric);
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static trackNetworkRequest(
    url: string, 
    duration: number, 
    status: number, 
    metadata?: Record<string, any>
  ): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.trackNetworkRequest(url, duration, status, metadata);
  }

  /**
   * Static method that delegates to the instance for backward compatibility
   */
  public static captureError(error: Error, metadata?: Record<string, any>): void {
    const instance = PerformanceMonitorService.getInstance();
    instance.captureError(error, metadata);
  }
}

// Export instance for convenience
export const performanceMonitor = PerformanceMonitorService.getInstance(); 