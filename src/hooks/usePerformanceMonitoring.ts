import { performanceSettingsStore } from '@/stores/PerformanceSettingsStore';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { useEffect, useRef } from 'react';

interface UsePerformanceMonitoringOptions {
  componentName: string;
  enabled?: boolean;
  trackRenders?: boolean;
  trackProps?: boolean;
}

/**
 * A hook for monitoring component performance and rendering
 * 
 * @param options Configuration options for the performance monitoring
 * @returns Performance monitoring utilities
 */
export function usePerformanceMonitoring({
  componentName,
  enabled = __DEV__,
  trackRenders = true,
  trackProps = false,
}: UsePerformanceMonitoringOptions) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const propsRef = useRef<any>(null);

  // Track component mount and render
  useEffect(() => {
    if (!enabled) return;

    const mountTime = Date.now() - lastRenderTime.current;
    PerformanceMonitor.recordMetric({
      name: `mount_${componentName}`,
      duration: mountTime,
      type: 'render',
      component: componentName,
      timestamp: Date.now(),
    });

    return () => {
      PerformanceMonitor.recordMetric({
        name: `total_lifetime_${componentName}`,
        duration: Date.now() - lastRenderTime.current,
        type: 'render',
        component: componentName,
        timestamp: Date.now(),
      });
    };
  }, [componentName, enabled]);

  // Track rerenders
  useEffect(() => {
    if (!enabled || !trackRenders) return;
    
    renderCount.current += 1;
    
    // Skip the first render (it's tracked as mount)
    if (renderCount.current === 1) return;
    
    const renderTime = Date.now() - lastRenderTime.current;
    lastRenderTime.current = Date.now();
    
    PerformanceMonitor.recordMetric({
      name: `rerender_${componentName}`,
      duration: renderTime,
      type: 'render',
      component: componentName,
      timestamp: Date.now(),
    });
  });

  /**
   * Track execution time of a function
   */
  const trackOperation = async <T>(
    operationName: string, 
    operation: () => T | Promise<T>
  ): Promise<T> => {
    if (!enabled) {
      return operation();
    }

    const startTime = Date.now();
    try {
      const result = await Promise.resolve(operation());
      const duration = Date.now() - startTime;
      
      PerformanceMonitor.recordMetric({
        name: `${operationName}_${componentName}`,
        duration,
        type: 'interaction',
        component: componentName,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      PerformanceMonitor.recordMetric({
        name: `${operationName}_error_${componentName}`,
        duration,
        type: 'interaction',
        component: componentName,
        timestamp: Date.now(),
      });
      
      throw error;
    }
  };

  return {
    trackOperation,
    renderCount: renderCount.current,
  };
}

export function useMetricsCollection(interval = 5000) {
  useEffect(() => {
    if (!performanceSettingsStore.persistMetrics) return;

    const collectMetrics = async () => {
      const metrics = PerformanceMonitor.getMetrics();
      // Skip metrics persistence for now due to type issues
    };

    const intervalId = setInterval(collectMetrics, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [interval]);
}

export function useErrorBoundaryAnalytics() {
  useEffect(() => {
    const handleError = (error: Error) => {
      Performance.captureError(error);
      PerformanceMonitor.captureError(error);
    };

    window.addEventListener('error', (event) => handleError(event.error));
    window.addEventListener('unhandledrejection', (event) => handleError(event.reason));

    return () => {
      window.removeEventListener('error', (event) => handleError(event.error));
      window.removeEventListener('unhandledrejection', (event) => handleError(event.reason));
    };
  }, []);
} 