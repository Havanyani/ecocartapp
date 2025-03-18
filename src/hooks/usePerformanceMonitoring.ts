import { PerformanceMonitor, PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { useEffect, useRef } from 'react';
import { performanceSettingsStore } from '@/stores/PerformanceSettingsStore';

export function usePerformanceMonitoring(componentName: string) {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const startTime = mountTime.current;
    const endTime = Date.now();
    Performance.trackResponseTime(startTime, endTime);
    PerformanceMonitor.captureError(new Error(`Component ${componentName} mounted in ${endTime - startTime}ms`));

    return () => {
      const lifetimeMs = Date.now() - mountTime.current;
      Performance.addBreadcrumb('component-lifetime', `${componentName} lived for ${lifetimeMs}ms`);
    };
  }, [componentName]);
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