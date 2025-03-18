/** @jsx React.createElement */

/**
 * PerformanceMonitorService.ts
 * 
 * Service for monitoring app performance in production.
 * Tracks key metrics like render times, API response times,
 * frame drops, and memory usage.
 */

import { isProduction } from '@/config/environments';
import { SafeStorage } from '@/utils/storage';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import React from 'react';
import { InteractionManager } from 'react-native';

// Performance metric types
export enum MetricType {
  SCREEN_RENDER = 'screen_render',
  API_RESPONSE = 'api_response',
  FRAME_DROP = 'frame_drop',
  MEMORY_WARNING = 'memory_warning',
  STARTUP_TIME = 'startup_time',
  TTI = 'time_to_interactive',
  RESOURCE_LOAD = 'resource_load',
  JS_ERROR = 'js_error',
  NATIVE_ERROR = 'native_error',
  GESTURE_RESPONSE = 'gesture_response',
  CUSTOM = 'custom',
  // Analytics metrics
  USER_ACTION = 'user_action',
  SCREEN_VIEW = 'screen_view',
  FEATURE_USAGE = 'feature_usage',
  CONVERSION = 'conversion',
  USER_ENGAGEMENT = 'user_engagement',
}

// Performance metric data
export interface PerformanceMetric {
  id: string;
  type: MetricType;
  value: number; // Duration in milliseconds or other numeric value
  timestamp: number;
  screen?: string;
  name?: string;
  metadata?: Record<string, any>;
}

// Context for performance metrics
export interface PerformanceContext {
  appVersion: string;
  buildNumber?: string;
  deviceModel?: string;
  osVersion?: string;
  memoryLimit?: number;
  networkType?: string;
  isLowPerformanceDevice: boolean;
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
  private static readonly METRICS_STORAGE_KEY = '@ecocart/performance_metrics';
  private static readonly METRICS_CONFIG_KEY = '@ecocart/performance_config';
  private static readonly MAX_STORED_METRICS = 100;
  
  private static isInitialized = false;
  private static context: PerformanceContext | null = null;
  private static metrics: PerformanceMetric[] = [];
  private static renderStartTimes: Record<string, number> = {};
  private static apiStartTimes: Record<string, number> = {};
  private static isLowPerformanceDevice = false;
  private static samplingRate = 1.0; // 100% by default
  private static uploadUrl: string | null = null;
  private static reportingThreshold = 10; // Upload after 10 metrics

  /**
   * Initialize the performance monitoring service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load configuration
      await this.loadConfig();
      
      // Load cached metrics
      await this.loadMetrics();
      
      // Determine if device is low performance
      await this.detectDevicePerformance();
      
      // Create performance context
      await this.createContext();
      
      // Configure sampling rate based on device performance
      if (this.isLowPerformanceDevice) {
        this.samplingRate = 0.25; // Reduce sampling on low-performance devices
      }
      
      this.isInitialized = true;
      console.log(`Performance monitoring initialized with sampling rate: ${this.samplingRate * 100}%`);
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Marks the start of a screen render
   * 
   * @param screenName Name of the screen being rendered
   */
  static markRenderStart(screenName: string): void {
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
  static markRenderEnd(screenName: string, metadata?: Record<string, any>): void {
    if (!this.renderStartTimes[screenName]) {
      return;
    }
    
    const endTime = performance.now();
    const startTime = this.renderStartTimes[screenName];
    const duration = endTime - startTime;
    
    delete this.renderStartTimes[screenName];
    
    // Record the metric
    this.recordMetric({
      type: MetricType.SCREEN_RENDER,
      value: duration,
      screen: screenName,
      metadata,
    });
  }

  /**
   * Marks the start of an API request
   * 
   * @param requestId Identifier for the API request
   * @param endpoint API endpoint
   */
  static markApiStart(requestId: string, endpoint: string): void {
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
  static markApiEnd(requestId: string, metadata?: Record<string, any>): void {
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
      name: requestId,
      metadata,
    });
  }

  /**
   * Records a frame drop event
   * 
   * @param droppedFrames Number of frames dropped
   * @param metadata Additional data about the frame drop
   */
  static recordFrameDrop(droppedFrames: number, metadata?: Record<string, any>): void {
    if (!this.shouldSampleMetric()) {
      return;
    }
    
    this.recordMetric({
      type: MetricType.FRAME_DROP,
      value: droppedFrames,
      metadata,
    });
  }

  /**
   * Records app startup time
   * 
   * @param duration Time from app launch to first interactive screen
   * @param metadata Additional startup data
   */
  static recordStartupTime(duration: number, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.STARTUP_TIME,
      value: duration,
      metadata,
    });
  }

  /**
   * Records time to interactive
   * This is called after the initial render and when the app is ready for user interaction
   * 
   * @param duration Time from app launch to fully interactive
   */
  static recordTimeToInteractive(duration: number): void {
    this.recordMetric({
      type: MetricType.TTI,
      value: duration,
    });
  }

  /**
   * Records resource load time
   * 
   * @param resourceName Name of the resource
   * @param duration Load time in milliseconds
   * @param metadata Additional data about the resource
   */
  static recordResourceLoad(resourceName: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.shouldSampleMetric()) {
      return;
    }
    
    this.recordMetric({
      type: MetricType.RESOURCE_LOAD,
      value: duration,
      name: resourceName,
      metadata,
    });
  }

  /**
   * Records JavaScript error
   * 
   * @param error Error object
   * @param metadata Additional error context
   */
  static recordJsError(error: Error, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.JS_ERROR,
      value: 1,
      name: error.name,
      metadata: {
        ...metadata,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  /**
   * Records gesture response time
   * 
   * @param gestureName Name of the gesture
   * @param duration Response time in milliseconds
   */
  static recordGestureResponse(gestureName: string, duration: number): void {
    if (!this.shouldSampleMetric()) {
      return;
    }
    
    this.recordMetric({
      type: MetricType.GESTURE_RESPONSE,
      value: duration,
      name: gestureName,
    });
  }

  /**
   * Records a custom performance metric
   * 
   * @param name Metric name
   * @param value Metric value (usually a duration in ms)
   * @param metadata Additional metric data
   */
  static recordCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.shouldSampleMetric()) {
      return;
    }
    
    this.recordMetric({
      type: MetricType.CUSTOM,
      value,
      name,
      metadata,
    });
  }

  /**
   * Gets average render time for a specific screen
   * 
   * @param screenName Name of the screen
   * @returns Average render time in milliseconds
   */
  static async getAverageRenderTime(screenName: string): Promise<number> {
    const screenMetrics = this.metrics.filter(
      m => m.type === MetricType.SCREEN_RENDER && m.screen === screenName
    );
    
    if (screenMetrics.length === 0) {
      return 0;
    }
    
    const sum = screenMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / screenMetrics.length;
  }

  /**
   * Gets average API response time for a specific endpoint
   * 
   * @param endpoint API endpoint
   * @returns Average response time in milliseconds
   */
  static async getAverageApiTime(endpoint: string): Promise<number> {
    const apiMetrics = this.metrics.filter(
      m => m.type === MetricType.API_RESPONSE && 
          m.metadata && 
          m.metadata.endpoint === endpoint
    );
    
    if (apiMetrics.length === 0) {
      return 0;
    }
    
    const sum = apiMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / apiMetrics.length;
  }

  /**
   * Gets performance summary
   * 
   * @returns Summary of key performance metrics
   */
  static async getPerformanceSummary(): Promise<{
    averageStartupTime: number;
    averageScreenRenderTime: number;
    averageApiResponseTime: number;
    totalFrameDrops: number;
    errorCount: number;
    slowestScreens: Array<{ screen: string; averageTime: number }>;
    slowestApis: Array<{ endpoint: string; averageTime: number }>;
  }> {
    // Calculate average startup time
    const startupMetrics = this.metrics.filter(m => m.type === MetricType.STARTUP_TIME);
    const averageStartupTime = startupMetrics.length > 0
      ? startupMetrics.reduce((acc, metric) => acc + metric.value, 0) / startupMetrics.length
      : 0;
    
    // Calculate average screen render time
    const renderMetrics = this.metrics.filter(m => m.type === MetricType.SCREEN_RENDER);
    const averageScreenRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((acc, metric) => acc + metric.value, 0) / renderMetrics.length
      : 0;
    
    // Calculate average API response time
    const apiMetrics = this.metrics.filter(m => m.type === MetricType.API_RESPONSE);
    const averageApiResponseTime = apiMetrics.length > 0
      ? apiMetrics.reduce((acc, metric) => acc + metric.value, 0) / apiMetrics.length
      : 0;
    
    // Count total frame drops
    const frameDropMetrics = this.metrics.filter(m => m.type === MetricType.FRAME_DROP);
    const totalFrameDrops = frameDropMetrics.reduce((acc, metric) => acc + metric.value, 0);
    
    // Count errors
    const errorMetrics = this.metrics.filter(
      m => m.type === MetricType.JS_ERROR || m.type === MetricType.NATIVE_ERROR
    );
    const errorCount = errorMetrics.length;
    
    // Find slowest screens
    const screenTimes: Record<string, { total: number; count: number }> = {};
    
    renderMetrics.forEach(metric => {
      if (!metric.screen) return;
      
      if (!screenTimes[metric.screen]) {
        screenTimes[metric.screen] = { total: 0, count: 0 };
      }
      
      screenTimes[metric.screen].total += metric.value;
      screenTimes[metric.screen].count += 1;
    });
    
    const slowestScreens = Object.entries(screenTimes)
      .map(([screen, { total, count }]) => ({
        screen,
        averageTime: total / count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
    
    // Find slowest APIs
    const apiTimes: Record<string, { total: number; count: number }> = {};
    
    apiMetrics.forEach(metric => {
      if (!metric.metadata || !metric.metadata.endpoint) return;
      
      const endpoint = metric.metadata.endpoint;
      
      if (!apiTimes[endpoint]) {
        apiTimes[endpoint] = { total: 0, count: 0 };
      }
      
      apiTimes[endpoint].total += metric.value;
      apiTimes[endpoint].count += 1;
    });
    
    const slowestApis = Object.entries(apiTimes)
      .map(([endpoint, { total, count }]) => ({
        endpoint,
        averageTime: total / count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
    
    return {
      averageStartupTime,
      averageScreenRenderTime,
      averageApiResponseTime,
      totalFrameDrops,
      errorCount,
      slowestScreens,
      slowestApis,
    };
  }

  /**
   * Clears all stored metrics
   */
  static async clearMetrics(): Promise<void> {
    this.metrics = [];
    await SafeStorage.removeItem(this.METRICS_STORAGE_KEY);
  }

  /**
   * Sets the upload URL for metrics
   * 
   * @param url URL to upload metrics to
   */
  static setUploadUrl(url: string): void {
    this.uploadUrl = url;
  }

  /**
   * Sets the sampling rate for metrics collection
   * 
   * @param rate Sampling rate (0-1)
   */
  static setSamplingRate(rate: number): void {
    this.samplingRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Sets the threshold for reporting metrics
   * 
   * @param threshold Number of metrics to collect before reporting
   */
  static setReportingThreshold(threshold: number): void {
    this.reportingThreshold = threshold;
  }

  /**
   * Set context value for enhanced reporting
   * 
   * @param key Context key
   * @param value Context value
   */
  static setContextValue(key: string, value: any): void {
    if (!this.context) {
      return;
    }
    
    this.context = {
      ...this.context,
      [key]: value,
    };
  }

  /**
   * Force upload of metrics immediately
   */
  static async forceUpload(): Promise<boolean> {
    return this.uploadMetrics();
  }

  // Private methods

  /**
   * Records a performance metric
   */
  private static recordMetric(metricData: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    if (!this.isInitialized) {
      this.initialize().catch(console.error);
    }

    const id = `metric_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();
    
    const metric: PerformanceMetric = {
      id,
      timestamp,
      ...metricData,
    };
    
    // Add to metrics array
    this.metrics.push(metric);
    
    // Trim if too many metrics
    if (this.metrics.length > this.MAX_STORED_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_STORED_METRICS);
    }
    
    // Save metrics async
    this.saveMetrics().catch(error => {
      console.error('Error saving metrics:', error);
    });
    
    // Upload metrics if reached threshold
    if (this.metrics.length >= this.reportingThreshold && this.uploadUrl) {
      InteractionManager.runAfterInteractions(() => {
        this.uploadMetrics().catch(error => {
          console.error('Error uploading metrics:', error);
        });
      });
    }
  }

  /**
   * Loads metrics from storage
   */
  private static async loadMetrics(): Promise<void> {
    try {
      const metricsJson = await SafeStorage.getItem(this.METRICS_STORAGE_KEY);
      
      if (!metricsJson) {
        this.metrics = [];
        return;
      }
      
      this.metrics = JSON.parse(metricsJson);
    } catch (error) {
      console.error('Error loading metrics:', error);
      this.metrics = [];
    }
  }

  /**
   * Saves metrics to storage
   */
  private static async saveMetrics(): Promise<void> {
    try {
      await SafeStorage.setItem(this.METRICS_STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  /**
   * Loads configuration from storage
   */
  private static async loadConfig(): Promise<void> {
    try {
      const configJson = await SafeStorage.getItem(this.METRICS_CONFIG_KEY);
      
      if (!configJson) {
        // Default configuration
        return;
      }
      
      const config = JSON.parse(configJson);
      
      if (config.uploadUrl) {
        this.uploadUrl = config.uploadUrl;
      }
      
      if (config.samplingRate !== undefined) {
        this.samplingRate = config.samplingRate;
      }
      
      if (config.reportingThreshold !== undefined) {
        this.reportingThreshold = config.reportingThreshold;
      }
    } catch (error) {
      console.error('Error loading metrics configuration:', error);
    }
  }

  /**
   * Save configuration to storage
   */
  private static async saveConfig(): Promise<void> {
    try {
      const config = {
        uploadUrl: this.uploadUrl,
        samplingRate: this.samplingRate,
        reportingThreshold: this.reportingThreshold,
      };
      
      await SafeStorage.setItem(this.METRICS_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving metrics configuration:', error);
    }
  }

  /**
   * Creates performance context
   */
  private static async createContext(): Promise<void> {
    try {
      // Get app info
      const appVersion = Application.nativeApplicationVersion || '1.0.0';
      const buildNumber = Application.nativeBuildVersion;
      
      // Get device info
      const deviceModel = Device.modelName;
      const osVersion = `${Device.osName} ${Device.osVersion}`;
      
      // Get network info
      const netInfo = await NetInfo.fetch();
      const networkType = netInfo.type;
      
      // Convert all null values to undefined with a helper function
      const nullToUndefined = <T>(value: T | null): T | undefined => 
        value === null ? undefined : value;

      this.context = {
        appVersion,
        buildNumber: nullToUndefined(buildNumber),
        deviceModel: nullToUndefined(deviceModel),
        osVersion: nullToUndefined(osVersion),
        networkType,
        isLowPerformanceDevice: this.isLowPerformanceDevice,
      };
    } catch (error) {
      console.error('Error creating performance context:', error);
      
      // Create minimal context
      this.context = {
        appVersion: '1.0.0',
        isLowPerformanceDevice: false,
      };
    }
  }

  /**
   * Detects if device is low performance
   */
  private static async detectDevicePerformance(): Promise<void> {
    try {
      // Simple heuristic based on device year/tier
      if (Device.deviceYearClass && Device.deviceYearClass < 2019) {
        this.isLowPerformanceDevice = true;
        return;
      }
      
      // Check device memory
      if (Device.totalMemory && Device.totalMemory < 2 * 1024 * 1024 * 1024) {
        this.isLowPerformanceDevice = true;
        return;
      }
      
      this.isLowPerformanceDevice = false;
    } catch (error) {
      console.error('Error detecting device performance:', error);
      this.isLowPerformanceDevice = false;
    }
  }

  /**
   * Determines if a metric should be sampled based on sampling rate
   */
  private static shouldSampleMetric(): boolean {
    // Always collect metrics in development
    if (!isProduction) {
      return true;
    }
    
    // Sample based on rate
    return Math.random() < this.samplingRate;
  }

  /**
   * Uploads metrics to server
   */
  private static async uploadMetrics(): Promise<boolean> {
    if (!this.uploadUrl || this.metrics.length === 0) {
      return false;
    }
    
    try {
      // Deep clone metrics to upload
      const metricsToUpload = JSON.parse(JSON.stringify(this.metrics));
      
      // Upload metrics
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToUpload,
          context: this.context,
          timestamp: Date.now(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Clear uploaded metrics
      this.metrics = [];
      await this.saveMetrics();
      
      return true;
    } catch (error) {
      console.error('Error uploading metrics:', error);
      return false;
    }
  }

  /**
   * Measure a task's execution time
   * 
   * @param taskName Name of the task
   * @param task Function to measure
   * @returns Result of the task
   */
  static async measure<T>(taskName: string, task: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await task();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Record as custom metric
      this.recordCustomMetric(taskName, duration);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Record as custom metric with error flag
      this.recordCustomMetric(taskName, duration, { error: true });
      
      throw error;
    }
  }

  /**
   * Wrap a component with performance monitoring
   * 
   * @param screenName Screen name
   * @param Component Component to wrap
   * @returns Wrapped component
   */
  static withPerformanceTracking(screenName: string, Component: React.ComponentType<any>): React.ComponentType<any> {
    return class PerformanceTrackedComponent extends React.Component<any> {
      componentDidMount() {
        PerformanceMonitorService.markRenderEnd(screenName);
      }
      
      componentWillUnmount() {
        // No action needed
      }
      
      render() {
        PerformanceMonitorService.markRenderStart(screenName);
        return React.createElement(Component, this.props);
      }
    };
  }

  /**
   * Records a user action event
   * 
   * @param actionName Name of the user action
   * @param metadata Additional data about the action
   */
  static recordUserAction(actionName: string, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.USER_ACTION,
      value: 1, // Count of actions
      name: actionName,
      metadata,
    });
  }

  /**
   * Records a screen view event
   * 
   * @param screenName Name of the screen viewed
   * @param duration Time spent on screen in milliseconds
   * @param metadata Additional data about the screen view
   */
  static recordScreenView(screenName: string, duration: number, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.SCREEN_VIEW,
      value: duration,
      name: screenName,
      metadata,
    });
  }

  /**
   * Records feature usage
   * 
   * @param featureName Name of the feature
   * @param usageCount Number of times the feature was used
   * @param metadata Additional data about the feature usage
   */
  static recordFeatureUsage(featureName: string, usageCount: number, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.FEATURE_USAGE,
      value: usageCount,
      name: featureName,
      metadata,
    });
  }

  /**
   * Records a conversion event
   * 
   * @param conversionName Name of the conversion event
   * @param value Value associated with the conversion
   * @param metadata Additional data about the conversion
   */
  static recordConversion(conversionName: string, value: number, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.CONVERSION,
      value,
      name: conversionName,
      metadata,
    });
  }

  /**
   * Records user engagement metrics
   * 
   * @param engagementType Type of engagement
   * @param value Engagement value
   * @param metadata Additional data about the engagement
   */
  static recordUserEngagement(engagementType: string, value: number, metadata?: Record<string, any>): void {
    this.recordMetric({
      type: MetricType.USER_ENGAGEMENT,
      value,
      name: engagementType,
      metadata,
    });
  }

  /**
   * Gets analytics summary for a specific time range
   * 
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @returns Analytics summary
   */
  static getAnalyticsSummary(startTime: number, endTime: number): Record<string, any> {
    const relevantMetrics = this.metrics.filter(
      metric => metric.timestamp >= startTime && metric.timestamp <= endTime
    );

    const summary: Record<string, any> = {
      totalActions: 0,
      screenViews: {},
      featureUsage: {},
      conversions: {},
      engagement: {},
    };

    relevantMetrics.forEach(metric => {
      switch (metric.type) {
        case MetricType.USER_ACTION:
          summary.totalActions += metric.value;
          break;
        case MetricType.SCREEN_VIEW:
          summary.screenViews[metric.name || 'unknown'] = (summary.screenViews[metric.name || 'unknown'] || 0) + 1;
          break;
        case MetricType.FEATURE_USAGE:
          summary.featureUsage[metric.name || 'unknown'] = (summary.featureUsage[metric.name || 'unknown'] || 0) + metric.value;
          break;
        case MetricType.CONVERSION:
          summary.conversions[metric.name || 'unknown'] = (summary.conversions[metric.name || 'unknown'] || 0) + metric.value;
          break;
        case MetricType.USER_ENGAGEMENT:
          summary.engagement[metric.name || 'unknown'] = (summary.engagement[metric.name || 'unknown'] || 0) + metric.value;
          break;
      }
    });

    return summary;
  }

  /**
   * Gets current performance metrics for the application
   * 
   * @returns Object containing performance metrics
   */
  static async getPerformanceMetrics() {
    // In a real implementation, this would collect actual metrics
    // For now, we're returning mock data
    return {
      appCrashRate: 0.5, // Percentage
      avgApiResponseTimeMs: 230, // Milliseconds
      avgScreenLoadTimeMs: 180, // Milliseconds
      networkErrorRate: 1.2, // Percentage
      batteryUsagePercentage: 2.5 // Percentage
    };
  }

  /**
   * Gets performance metrics over time to show trends
   * 
   * @param timeFrame The time range to get metrics for
   * @returns Performance metrics history data
   */
  static async getPerformanceHistory(timeFrame: 'week' | 'month' | 'year') {
    // Mock data for performance history
    const weekData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      apiResponseTimes: [250, 245, 230, 210, 220, 225, 230],
      screenLoadTimes: [190, 185, 175, 180, 170, 175, 180],
      networkErrors: [1.5, 1.4, 1.2, 1.3, 1.0, 1.1, 1.2],
      batteryUsage: [2.8, 2.7, 2.5, 2.6, 2.4, 2.5, 2.5]
    };
    
    const monthData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      apiResponseTimes: [248, 235, 225, 230],
      screenLoadTimes: [188, 180, 175, 180],
      networkErrors: [1.5, 1.3, 1.1, 1.2],
      batteryUsage: [2.8, 2.6, 2.5, 2.5]
    };
    
    const yearData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      apiResponseTimes: [300, 290, 280, 270, 260, 250, 240, 235, 230, 228, 225, 230],
      screenLoadTimes: [220, 215, 210, 205, 200, 195, 190, 185, 180, 178, 175, 180],
      networkErrors: [2.2, 2.0, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.2, 1.1, 1.2],
      batteryUsage: [3.5, 3.3, 3.2, 3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.5, 2.4, 2.5]
    };
    
    // Return appropriate data based on timeFrame
    switch (timeFrame) {
      case 'week':
        return weekData;
      case 'month':
        return monthData;
      case 'year':
        return yearData;
      default:
        return weekData;
    }
  }
  
  /**
   * Records an API call performance entry
   * 
   * @param endpoint The API endpoint called
   * @param responseTimeMs The response time in milliseconds
   * @param success Whether the call was successful
   */
  static recordApiCall(endpoint: string, responseTimeMs: number, success: boolean) {
    // In a real implementation, this would store the data
    console.log(`API Call: ${endpoint}, Time: ${responseTimeMs}ms, Success: ${success}`);
  }
  
  /**
   * Records a screen load performance entry
   * 
   * @param screenName The name of the screen loaded
   * @param loadTimeMs The load time in milliseconds
   */
  static recordScreenLoad(screenName: string, loadTimeMs: number) {
    // In a real implementation, this would store the data
    console.log(`Screen Load: ${screenName}, Time: ${loadTimeMs}ms`);
  }
  
  /**
   * Records an app crash event
   * 
   * @param error The error that caused the crash
   * @param componentStack The component stack trace
   */
  static recordCrash(error: Error, componentStack?: string) {
    // In a real implementation, this would report to a crash reporting service
    console.error('App Crash:', error, componentStack);
  }
  
  /**
   * Records a network error event
   * 
   * @param endpoint The API endpoint that returned an error
   * @param error The error object
   * @param statusCode The HTTP status code (if available)
   */
  static recordNetworkError(endpoint: string, error: any, statusCode?: number) {
    // In a real implementation, this would store the data
    console.error(`Network Error: ${endpoint}, Status: ${statusCode}, Error:`, error);
  }
  
  /**
   * Gets an analysis of app performance with recommendations
   * 
   * @returns Performance analysis and recommendations
   */
  static async getPerformanceAnalysis() {
    // In a real implementation, this would analyze actual metrics
    return {
      summary: "App performance is good with slight issues in API response times.",
      issues: [
        {
          type: "apiResponseTime",
          severity: "medium",
          description: "API response times are slightly above target (230ms vs 200ms target)."
        },
        {
          type: "batteryUsage",
          severity: "low",
          description: "Battery usage is acceptable but could be optimized further."
        }
      ],
      recommendations: [
        "Implement API response caching for frequently accessed endpoints.",
        "Optimize image loading to reduce screen load times.",
        "Consider implementing background fetch to reduce user wait times."
      ],
      score: 85 // Out of 100
    };
  }
} 