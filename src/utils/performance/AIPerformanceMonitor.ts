/**
 * AIPerformanceMonitor.ts
 * 
 * Utility for monitoring and tracking AI Assistant performance metrics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager, Platform } from 'react-native';

// Storage key for performance metrics
const METRICS_STORAGE_KEY = 'ai_assistant_performance_metrics';

// Define performance metric types
export type MetricType = 
  | 'response_time'       // Time to get a response
  | 'cache_lookup'        // Time to look up from cache
  | 'similarity_calc'     // Time to calculate similarity
  | 'render_time'         // Time to render message
  | 'memory_usage'        // Memory usage snapshot
  | 'cache_load_time'     // Time to load cache
  | 'api_request_time'    // Time for API request
  | 'message_processing'; // Time to process message

export interface PerformanceMetric {
  type: MetricType;
  value: number;        // The measured value (usually in ms)
  timestamp: number;    // When the measurement was taken
  context?: {           // Additional context about the measurement
    messageId?: string;
    messageLength?: number;
    cacheSize?: number;
    apiService?: string;
    isOffline?: boolean;
    deviceInfo?: {
      platform: string;
      version: string;
      memory?: number;
    };
    [key: string]: any;
  };
}

class AIPerformanceMonitor {
  private static instance: AIPerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = __DEV__; // Only enabled in development by default
  private maxStoredMetrics: number = 1000;
  private activeTimers: Map<string, number> = new Map();
  
  private constructor() {
    // Load existing metrics
    this.loadMetrics();
  }
  
  public static getInstance(): AIPerformanceMonitor {
    if (!AIPerformanceMonitor.instance) {
      AIPerformanceMonitor.instance = new AIPerformanceMonitor();
    }
    return AIPerformanceMonitor.instance;
  }
  
  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Check if performance monitoring is enabled
   */
  public isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
  
  /**
   * Start a performance timer
   * @param id Unique identifier for this timer
   * @returns The timer ID for stopping the timer later
   */
  public startTimer(id: string): string {
    if (!this.isEnabled) return id;
    
    this.activeTimers.set(id, performance.now());
    return id;
  }
  
  /**
   * Stop a performance timer and record the metric
   * @param id The timer ID from startTimer
   * @param type The type of metric being measured
   * @param context Additional context for the measurement
   * @returns The duration in milliseconds
   */
  public stopTimer(id: string, type: MetricType, context?: PerformanceMetric['context']): number {
    if (!this.isEnabled) return 0;
    
    const startTime = this.activeTimers.get(id);
    if (startTime === undefined) {
      console.warn(`[PerformanceMonitor] No timer found with id: ${id}`);
      return 0;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.recordMetric(type, duration, context);
    this.activeTimers.delete(id);
    
    return duration;
  }
  
  /**
   * Record a performance metric directly
   */
  public recordMetric(
    type: MetricType, 
    value: number,
    context?: PerformanceMetric['context']
  ): void {
    if (!this.isEnabled) return;
    
    const metric: PerformanceMetric = {
      type,
      value,
      timestamp: Date.now(),
      context: {
        ...context,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version as string,
        }
      }
    };
    
    this.metrics.push(metric);
    
    // Ensure we don't exceed max stored metrics
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }
    
    // Save metrics after UI interactions are complete to avoid blocking the UI
    InteractionManager.runAfterInteractions(() => {
      this.saveMetrics();
    });
  }
  
  /**
   * Get metrics filtered by type and/or time range
   */
  public getMetrics(
    type?: MetricType,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    return this.metrics.filter(metric => {
      let matches = true;
      
      if (type && metric.type !== type) {
        matches = false;
      }
      
      if (startTime && metric.timestamp < startTime) {
        matches = false;
      }
      
      if (endTime && metric.timestamp > endTime) {
        matches = false;
      }
      
      return matches;
    });
  }
  
  /**
   * Calculate average for a specific metric type
   */
  public getAverageMetric(type: MetricType, sampleSize?: number): number {
    const metrics = this.getMetrics(type);
    
    if (metrics.length === 0) return 0;
    
    // If sample size is provided, only use the most recent metrics
    const samplesToUse = sampleSize ? metrics.slice(-sampleSize) : metrics;
    
    const sum = samplesToUse.reduce((total, metric) => total + metric.value, 0);
    return sum / samplesToUse.length;
  }
  
  /**
   * Clear all stored metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    AsyncStorage.removeItem(METRICS_STORAGE_KEY);
  }
  
  /**
   * Export metrics as JSON for analysis
   */
  public exportMetrics(): string {
    return JSON.stringify(this.metrics);
  }
  
  /**
   * Save metrics to AsyncStorage
   */
  private async saveMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('[PerformanceMonitor] Error saving metrics:', error);
    }
  }
  
  /**
   * Load metrics from AsyncStorage
   */
  private async loadMetrics(): Promise<void> {
    try {
      const storedMetrics = await AsyncStorage.getItem(METRICS_STORAGE_KEY);
      if (storedMetrics) {
        this.metrics = JSON.parse(storedMetrics);
      }
    } catch (error) {
      console.error('[PerformanceMonitor] Error loading metrics:', error);
    }
  }
  
  /**
   * Generate a performance report
   */
  public generateReport(): {
    averages: Record<MetricType, number>;
    counts: Record<MetricType, number>;
    recents: Record<MetricType, number>;
  } {
    const metricTypes: MetricType[] = [
      'response_time',
      'cache_lookup',
      'similarity_calc',
      'render_time',
      'memory_usage',
      'cache_load_time',
      'api_request_time',
      'message_processing'
    ];
    
    const averages: Record<MetricType, number> = {} as Record<MetricType, number>;
    const counts: Record<MetricType, number> = {} as Record<MetricType, number>;
    const recents: Record<MetricType, number> = {} as Record<MetricType, number>;
    
    metricTypes.forEach(type => {
      const metrics = this.getMetrics(type);
      averages[type] = this.getAverageMetric(type);
      counts[type] = metrics.length;
      
      // Get average of 5 most recent measurements
      recents[type] = this.getAverageMetric(type, 5);
    });
    
    return { averages, counts, recents };
  }
}

export const aiPerformanceMonitor = AIPerformanceMonitor.getInstance();
export default aiPerformanceMonitor; 