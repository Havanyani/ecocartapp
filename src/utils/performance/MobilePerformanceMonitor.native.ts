/**
 * MobilePerformanceMonitor.native.ts
 * 
 * Mobile-specific implementation of performance monitoring.
 * Tracks React Native specific performance metrics.
 * Only imported in mobile platform builds (iOS/Android).
 */

import { InteractionManager, NativeModules, Platform } from 'react-native';
import { PerformanceMonitor } from '../PerformanceMonitoring';

// Mobile performance metrics
export interface MobileVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface MemoryMetrics {
  jsHeapSize: number;
  nativeHeapSize?: number;
  totalMemory?: number;
  availableMemory?: number;
}

interface FrameMetrics {
  fps: number;
  jankCount: number;
  totalFrames: number;
  slowFrames: number;
}

/**
 * Mobile Performance Monitor class for tracking mobile-specific metrics
 */
class MobilePerformanceMonitorClass {
  private isInitialized = false;
  private metrics: MobileVitalMetric[] = [];
  private memoryMetrics: MemoryMetrics | null = null;
  private frameMetrics: FrameMetrics = {
    fps: 60,
    jankCount: 0,
    totalFrames: 0,
    slowFrames: 0
  };
  private startupTime: number | null = null;
  private frameHistory: number[] = [];
  private lastFrameTimestamp = 0;
  private trackingFrames = false;
  private memoryUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Only run on native platforms
    if (Platform.OS === 'web') return;
    
    // Store startup time
    this.startupTime = Date.now();
    
    // Initialize when JS thread is ready
    InteractionManager.runAfterInteractions(() => {
      this.init();
    });
  }

  /**
   * Initialize the Mobile Performance Monitor
   */
  public init(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    // Record app startup time
    if (this.startupTime) {
      const launchTime = Date.now() - this.startupTime;
      this.metrics.push({
        name: 'app_launch_time',
        value: launchTime,
        rating: this.getRatingForLaunchTime(launchTime),
        timestamp: Date.now()
      });
      
      // Report app launch time to underlying performance monitor
      PerformanceMonitor.recordMetric({
        name: 'app_launch_time',
        type: 'interaction',
        duration: launchTime,
        timestamp: Date.now()
      });
    }
    
    // Start monitoring memory usage
    this.startMemoryMonitoring();
    
    // Report device info
    this.reportDeviceInfo();
  }

  /**
   * Start tracking frame rates
   */
  public startTrackingFrames(): void {
    if (this.trackingFrames) return;
    
    this.trackingFrames = true;
    this.lastFrameTimestamp = Date.now();
    this.frameHistory = [];
    
    const trackFrame = () => {
      if (!this.trackingFrames) return;
      
      const now = Date.now();
      const elapsed = now - this.lastFrameTimestamp;
      
      if (elapsed > 0) {
        // Calculate FPS based on time between frames
        const instantFps = 1000 / elapsed;
        this.frameHistory.push(instantFps);
        
        // Keep only last 60 frames for rolling average
        if (this.frameHistory.length > 60) {
          this.frameHistory.shift();
        }
        
        // Calculate average FPS
        const avgFps = this.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.frameHistory.length;
        
        // Update frame metrics
        this.frameMetrics.fps = Math.min(60, avgFps);
        this.frameMetrics.totalFrames++;
        
        // Track slow frames (below 30 FPS)
        if (instantFps < 30) {
          this.frameMetrics.slowFrames++;
        }
        
        // Track janky frames (below 45 FPS)
        if (instantFps < 45) {
          this.frameMetrics.jankCount++;
        }
      }
      
      this.lastFrameTimestamp = now;
      
      // Request next frame
      requestAnimationFrame(trackFrame);
    };
    
    // Start tracking frames
    requestAnimationFrame(trackFrame);
  }

  /**
   * Stop tracking frame rates
   */
  public stopTrackingFrames(): void {
    this.trackingFrames = false;
    
    // Calculate jank percentage
    const jankPercentage = this.frameMetrics.totalFrames > 0 
      ? (this.frameMetrics.jankCount / this.frameMetrics.totalFrames) * 100 
      : 0;
    
    // Add frame metrics to performance metrics
    this.metrics.push({
      name: 'frame_rate',
      value: this.frameMetrics.fps,
      rating: this.getRatingForFrameRate(this.frameMetrics.fps),
      timestamp: Date.now()
    });
    
    this.metrics.push({
      name: 'jank_percentage',
      value: jankPercentage,
      rating: this.getRatingForJankPercentage(jankPercentage),
      timestamp: Date.now()
    });
    
    // Report to general performance metrics
    PerformanceMonitor.recordMetric({
      name: 'mobile_frame_rate',
      type: 'interaction',
      duration: this.frameMetrics.fps,
      timestamp: Date.now(),
      component: 'MobileVitals'
    });
    
    PerformanceMonitor.recordMetric({
      name: 'mobile_jank_percentage',
      type: 'interaction',
      duration: jankPercentage,
      timestamp: Date.now(),
      component: 'MobileVitals'
    });
  }

  /**
   * Report device information
   */
  private reportDeviceInfo(): void {
    const deviceInfo = {
      os: Platform.OS,
      osVersion: Platform.Version,
      brand: Platform.OS === 'android' ? NativeModules?.DeviceInfo?.getBrand || 'Unknown' : 'Apple',
      model: Platform.OS === 'android' ? NativeModules?.DeviceInfo?.getModel || 'Unknown' : 'iOS Device',
      isEmulator: false, // Need to implement proper detection
    };
    
    // Note device info in a custom metric
    PerformanceMonitor.recordMetric({
      name: 'device_info',
      type: 'interaction',
      duration: 0,
      timestamp: Date.now(),
      component: `${deviceInfo.brand} ${deviceInfo.model} (${deviceInfo.os} ${deviceInfo.osVersion})`
    });
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring(): void {
    // Clear existing interval if any
    if (this.memoryUpdateInterval) {
      clearInterval(this.memoryUpdateInterval);
    }
    
    // Update memory usage every 10 seconds
    this.memoryUpdateInterval = setInterval(() => {
      this.updateMemoryMetrics();
    }, 10000);
    
    // Initial update
    this.updateMemoryMetrics();
  }

  /**
   * Update memory metrics
   */
  private updateMemoryMetrics(): void {
    try {
      // Get JS heap size
      const jsHeapSize = global.performance?.memory?.usedJSHeapSize || 0;
      
      // Create memory metrics object
      this.memoryMetrics = {
        jsHeapSize,
        // Note: We would need to use native modules to get more detailed memory info
      };
      
      // Add to metrics if significant change
      if (jsHeapSize > 0) {
        // Convert to MB for readable metrics
        const jsHeapSizeMB = jsHeapSize / (1024 * 1024);
        
        this.metrics.push({
          name: 'js_heap_size',
          value: jsHeapSizeMB,
          rating: this.getRatingForMemoryUsage(jsHeapSizeMB),
          timestamp: Date.now()
        });
        
        // Report to general performance metrics
        PerformanceMonitor.recordMetric({
          name: 'mobile_memory_usage',
          type: 'interaction',
          duration: jsHeapSizeMB,
          timestamp: Date.now(),
          component: 'MobileVitals'
        });
      }
    } catch (error) {
      console.error('Error updating memory metrics:', error);
    }
  }

  /**
   * Track startup time for a specific component or screen
   */
  public trackComponentStartupTime(componentName: string, startTime: number): void {
    const duration = Date.now() - startTime;
    
    this.metrics.push({
      name: `${componentName}_startup_time`,
      value: duration,
      rating: this.getRatingForComponentStartupTime(duration),
      timestamp: Date.now()
    });
    
    // Report to general performance metrics
    PerformanceMonitor.recordMetric({
      name: `component_startup_${componentName}`,
      type: 'render',
      duration,
      timestamp: Date.now(),
      component: componentName
    });
  }

  /**
   * Track an interaction duration
   */
  public trackInteraction(interactionName: string, duration: number): void {
    this.metrics.push({
      name: `${interactionName}_interaction`,
      value: duration,
      rating: this.getRatingForInteraction(duration),
      timestamp: Date.now()
    });
    
    // Report to general performance metrics
    PerformanceMonitor.recordMetric({
      name: `mobile_interaction_${interactionName}`,
      type: 'interaction',
      duration,
      timestamp: Date.now(),
      component: 'Interaction'
    });
  }

  /**
   * Track a navigation time between screens
   */
  public trackNavigationTime(fromScreen: string, toScreen: string, duration: number): void {
    this.metrics.push({
      name: `navigation_${fromScreen}_to_${toScreen}`,
      value: duration,
      rating: this.getRatingForNavigation(duration),
      timestamp: Date.now()
    });
    
    // Report to general performance metrics
    PerformanceMonitor.recordMetric({
      name: `navigation_${fromScreen}_to_${toScreen}`,
      type: 'interaction',
      duration,
      timestamp: Date.now(),
      component: 'Navigation'
    });
  }

  /**
   * Get all mobile performance metrics
   */
  public getMetrics(): MobileVitalMetric[] {
    return [...this.metrics];
  }

  /**
   * Get memory metrics
   */
  public getMemoryMetrics(): MemoryMetrics | null {
    return this.memoryMetrics;
  }

  /**
   * Get frame metrics
   */
  public getFrameMetrics(): FrameMetrics {
    return { ...this.frameMetrics };
  }

  /**
   * Generate a complete performance report for mobile
   */
  public generateReport(): {
    metrics: MobileVitalMetric[];
    memoryMetrics: MemoryMetrics | null;
    frameMetrics: FrameMetrics;
    performanceScore: number;
    recommendations: string[];
  } {
    // Calculate performance score based on metrics
    let performanceScore = 100;
    const recommendations: string[] = [];
    
    // Analyze metrics
    for (const metric of this.metrics) {
      if (metric.rating === 'needs-improvement') {
        performanceScore -= 5;
        recommendations.push(`Improve ${metric.name.replace(/_/g, ' ')} (${metric.value.toFixed(2)})`);
      } else if (metric.rating === 'poor') {
        performanceScore -= 15;
        recommendations.push(`Critical: Fix ${metric.name.replace(/_/g, ' ')} (${metric.value.toFixed(2)})`);
      }
    }
    
    // Check frame rate
    if (this.frameMetrics.fps < 45) {
      performanceScore -= 20;
      recommendations.push(`Critical: Improve frame rate (${this.frameMetrics.fps.toFixed(1)} FPS)`);
    } else if (this.frameMetrics.fps < 55) {
      performanceScore -= 10;
      recommendations.push(`Improve frame rate (${this.frameMetrics.fps.toFixed(1)} FPS)`);
    }
    
    // Check jank percentage
    if (this.frameMetrics.jankCount > 0 && this.frameMetrics.totalFrames > 0) {
      const jankPercentage = (this.frameMetrics.jankCount / this.frameMetrics.totalFrames) * 100;
      if (jankPercentage > 15) {
        performanceScore -= 15;
        recommendations.push(`Reduce janky frames (${jankPercentage.toFixed(1)}% of frames)`);
      } else if (jankPercentage > 5) {
        performanceScore -= 5;
        recommendations.push(`Minimize janky frames (${jankPercentage.toFixed(1)}% of frames)`);
      }
    }
    
    // Memory usage recommendations
    if (this.memoryMetrics && this.memoryMetrics.jsHeapSize > 0) {
      const jsHeapSizeMB = this.memoryMetrics.jsHeapSize / (1024 * 1024);
      if (jsHeapSizeMB > 100) {
        performanceScore -= 15;
        recommendations.push(`Reduce memory usage (${jsHeapSizeMB.toFixed(1)} MB)`);
      } else if (jsHeapSizeMB > 50) {
        performanceScore -= 5;
        recommendations.push(`Optimize memory usage (${jsHeapSizeMB.toFixed(1)} MB)`);
      }
    }
    
    // Cap score between 0-100
    performanceScore = Math.max(0, Math.min(100, performanceScore));
    
    // Add recommendations based on score
    if (performanceScore < 50) {
      recommendations.push('Consider using more memoization to prevent unnecessary renders');
      recommendations.push('Optimize or lazy load images and heavy components');
    }
    
    return {
      metrics: this.metrics,
      memoryMetrics: this.memoryMetrics,
      frameMetrics: this.frameMetrics,
      performanceScore,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Stop tracking frames
    this.trackingFrames = false;
    
    // Clear memory monitoring interval
    if (this.memoryUpdateInterval) {
      clearInterval(this.memoryUpdateInterval);
      this.memoryUpdateInterval = null;
    }
  }

  /**
   * Rating functions
   */
  private getRatingForLaunchTime(time: number): 'good' | 'needs-improvement' | 'poor' {
    return time < 1000 ? 'good' : time < 2000 ? 'needs-improvement' : 'poor';
  }

  private getRatingForFrameRate(fps: number): 'good' | 'needs-improvement' | 'poor' {
    return fps >= 55 ? 'good' : fps >= 45 ? 'needs-improvement' : 'poor';
  }

  private getRatingForJankPercentage(percentage: number): 'good' | 'needs-improvement' | 'poor' {
    return percentage < 5 ? 'good' : percentage < 15 ? 'needs-improvement' : 'poor';
  }

  private getRatingForMemoryUsage(memoryMB: number): 'good' | 'needs-improvement' | 'poor' {
    return memoryMB < 50 ? 'good' : memoryMB < 100 ? 'needs-improvement' : 'poor';
  }

  private getRatingForComponentStartupTime(time: number): 'good' | 'needs-improvement' | 'poor' {
    return time < 300 ? 'good' : time < 800 ? 'needs-improvement' : 'poor';
  }

  private getRatingForInteraction(time: number): 'good' | 'needs-improvement' | 'poor' {
    return time < 100 ? 'good' : time < 300 ? 'needs-improvement' : 'poor';
  }

  private getRatingForNavigation(time: number): 'good' | 'needs-improvement' | 'poor' {
    return time < 300 ? 'good' : time < 800 ? 'needs-improvement' : 'poor';
  }
}

// Create singleton instance
export const MobilePerformanceMonitor = new MobilePerformanceMonitorClass();

// Auto-initialize on import
InteractionManager.runAfterInteractions(() => {
  MobilePerformanceMonitor.init();
});

export default MobilePerformanceMonitor; 