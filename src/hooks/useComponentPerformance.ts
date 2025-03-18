import { useEffect, useRef } from 'react';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface PerformanceOptions {
  trackRender?: boolean;
  trackInteractions?: boolean;
  trackLifecycle?: boolean;
}

export function useComponentPerformance(
  componentName: string,
  options: PerformanceOptions = {
    trackRender: true,
    trackInteractions: true,
    trackLifecycle: true,
  }
) {
  const { trackRender, trackInteractions, trackLifecycle } = options;
  const renderCount = useRef(0);

  useEffect(() => {
    if (trackRender) {
      renderCount.current += 1;
      performanceMetrics.startMetric(`${componentName}_render_${renderCount.current}`);
      
      return () => {
        performanceMetrics.endMetric(`${componentName}_render_${renderCount.current}`);
      };
    }
  });

  useEffect(() => {
    if (trackLifecycle) {
      performanceMetrics.startMetric(`${componentName}_mount`);
      
      return () => {
        performanceMetrics.endMetric(`${componentName}_mount`);
      };
    }
  }, [componentName, trackLifecycle]);

  const trackInteraction = async <T>(
    name: string,
    interaction: () => Promise<T>
  ): Promise<T> => {
    if (!trackInteractions) return interaction();
    
    return performanceMetrics.trackInteraction(
      `${componentName}_${name}`,
      interaction
    );
  };

  return { trackInteraction };
} 