/**
 * useMobileVitals.ts
 * 
 * A hook for accessing Mobile performance metrics in React components.
 * This hook provides a platform-agnostic interface for Mobile Vitals,
 * returning dummy/empty data on non-mobile platforms.
 */

import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Interface for mobile performance metrics
 */
export interface MobileVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Interface for frame metrics
 */
export interface FrameMetrics {
  fps: number;
  jankCount: number;
  jankPercentage: number;
  totalFrames: number;
  lastFrameTimestamp: number;
}

/**
 * Interface for memory metrics
 */
export interface MemoryMetrics {
  jsHeapSize: number;
  nativeHeapSize?: number;
  totalMemoryUsage?: number;
  lastUpdated: number;
}

/**
 * Interface for mobile performance report
 */
export interface MobilePerformanceReport {
  launchTime: number;
  frameMetrics: FrameMetrics;
  memoryMetrics: MemoryMetrics;
  deviceInfo: {
    device: string;
    os: string;
    appVersion: string;
  };
  interactionMetrics: {
    componentStartup: number;
    navigationTime: number;
    interactionTime: number;
  };
  performanceScore: number;
  recommendations: string[];
  timestamp: number;
}

/**
 * Interface for options used by the hook
 */
export interface UseMobileVitalsOptions {
  refreshInterval?: number;
  autoTrackFrames?: boolean;
  disabled?: boolean;
}

/**
 * Default empty performance report for non-mobile platforms
 */
const EMPTY_REPORT: MobilePerformanceReport = {
  launchTime: 0,
  frameMetrics: {
    fps: 0,
    jankCount: 0,
    jankPercentage: 0,
    totalFrames: 0,
    lastFrameTimestamp: 0,
  },
  memoryMetrics: {
    jsHeapSize: 0,
    lastUpdated: Date.now(),
  },
  deviceInfo: {
    device: 'unknown',
    os: 'unknown',
    appVersion: 'unknown',
  },
  interactionMetrics: {
    componentStartup: 0,
    navigationTime: 0,
    interactionTime: 0,
  },
  performanceScore: 0,
  recommendations: ['Mobile performance metrics are only available on mobile platforms'],
  timestamp: Date.now(),
};

/**
 * React hook for accessing Mobile Vitals in components
 * Returns performance data for mobile platforms and dummy data on non-mobile platforms
 */
export function useMobileVitals(options?: UseMobileVitalsOptions) {
  const { refreshInterval = 0, autoTrackFrames = false, disabled = false } = options || {};
  const [data, setData] = useState<MobilePerformanceReport>(EMPTY_REPORT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTrackingFrames, setIsTrackingFrames] = useState(false);
  
  // Function to load mobile performance data
  const refresh = useCallback(async () => {
    // If disabled or not on mobile platform, don't try to load metrics
    if (disabled || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate some sample data for our demo
      // In a real implementation, this would come from the native module
      const sampleData: MobilePerformanceReport = {
        launchTime: 1200 + Math.random() * 400,
        frameMetrics: {
          fps: 55 + Math.random() * 5,
          jankCount: Math.floor(Math.random() * 10),
          jankPercentage: Math.random() * 15,
          totalFrames: 600 + Math.floor(Math.random() * 100),
          lastFrameTimestamp: Date.now(),
        },
        memoryMetrics: {
          jsHeapSize: 80 + Math.random() * 40,
          nativeHeapSize: 120 + Math.random() * 60,
          lastUpdated: Date.now(),
        },
        deviceInfo: {
          device: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
          os: `${Platform.OS} ${Platform.Version}`,
          appVersion: '1.0.0',
        },
        interactionMetrics: {
          componentStartup: 80 + Math.random() * 40,
          navigationTime: 200 + Math.random() * 100,
          interactionTime: 50 + Math.random() * 30,
        },
        performanceScore: 70 + Math.random() * 30,
        recommendations: [
          'Optimize image loading',
          'Reduce JavaScript bundle size',
          'Minimize use of animations on low-end devices'
        ],
        timestamp: Date.now(),
      };
      
      setData(sampleData);
    } catch (err) {
      const thrownError = err instanceof Error ? err : new Error('Failed to load mobile performance data');
      setError(thrownError);
      console.error(thrownError);
    } finally {
      setIsLoading(false);
    }
  }, [disabled]);

  // Function to start tracking frames
  const startFrameTracking = useCallback(() => {
    if (disabled || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
      return;
    }

    console.log('Started tracking frames');
    setIsTrackingFrames(true);
  }, [disabled]);

  // Function to stop tracking frames
  const stopFrameTracking = useCallback(() => {
    if (disabled || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
      return;
    }

    console.log('Stopped tracking frames');
    setIsTrackingFrames(false);
    
    // Refresh data to get latest frame metrics
    void refresh();
  }, [disabled, refresh]);

  // Initial load and refresh interval
  useEffect(() => {
    void refresh();

    if (refreshInterval > 0 && !disabled && (Platform.OS === 'ios' || Platform.OS === 'android')) {
      const interval = setInterval(() => {
        void refresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [refresh, refreshInterval, disabled]);

  // Auto-track frames if enabled
  useEffect(() => {
    if (autoTrackFrames && !disabled && (Platform.OS === 'ios' || Platform.OS === 'android')) {
      startFrameTracking();
      
      return () => {
        stopFrameTracking();
      };
    }
    
    return undefined;
  }, [autoTrackFrames, startFrameTracking, stopFrameTracking, disabled]);

  return {
    data,
    isLoading,
    error,
    isTrackingFrames,
    refresh,
    startFrameTracking,
    stopFrameTracking,
  };
}

export default useMobileVitals; 