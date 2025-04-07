/**
 * useWebVitals.ts
 * 
 * A hook for accessing Web Vitals metrics in React components.
 * This hook provides a platform-agnostic interface for Web Vitals,
 * returning dummy/empty data on non-web platforms.
 */

import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Interface representing Web Vitals metrics
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

/**
 * Interface for Web Performance Report
 */
export interface WebPerformanceReport {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  navigationTiming?: {
    domComplete: number;
    domInteractive: number;
    loadEventEnd: number;
  };
  performanceScore: number;
  recommendations: string[];
  timestamp: number;
}

/**
 * History item for tracking performance over time
 */
export interface PerformanceHistoryItem {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  timestamp: number;
  score: number;
}

/**
 * Options for the useWebVitals hook
 */
export interface UseWebVitalsOptions {
  refreshInterval?: number;
  disabled?: boolean;
}

/**
 * Default empty performance report for non-web platforms
 */
const EMPTY_REPORT: WebPerformanceReport = {
  lcp: 0,
  fid: 0,
  cls: 0,
  ttfb: 0,
  fcp: 0,
  performanceScore: 0,
  recommendations: ['Web performance metrics are only available on web platforms'],
  timestamp: Date.now(),
};

/**
 * React hook for accessing Web Vitals in components
 * Returns performance data for web platforms and dummy data for non-web platforms
 */
export function useWebVitals(options?: UseWebVitalsOptions) {
  const { refreshInterval = 0, disabled = false } = options || {};
  const [data, setData] = useState<WebPerformanceReport>(EMPTY_REPORT);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [webVitals, setWebVitals] = useState<Record<string, WebVitalMetric>>({});

  // Function to load web performance data
  const refresh = useCallback(async () => {
    // If disabled or not on web platform, don't try to load metrics
    if (disabled || Platform.OS !== 'web') {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let performanceReportData: WebPerformanceReport;

      // Dynamic import to avoid loading web-specific code on mobile
      try {
        const module = await import('../../../utils/performance/WebPerformanceMonitor.web');
        const webPerformanceMonitor = module.WebPerformanceMonitor;
        
        // Generate a performance report using the monitor directly
        // We don't make assumptions about its implementation (singleton or static)
        if (typeof webPerformanceMonitor.generatePerformanceReport === 'function') {
          // If we can call it directly as a static method
          performanceReportData = webPerformanceMonitor.generatePerformanceReport();
        } else {
          // If we need to use another approach (to be implemented based on actual implementation)
          console.warn('WebPerformanceMonitor needs a different approach to generate reports');
          performanceReportData = EMPTY_REPORT;
        }
        
        // Update web vitals
        const vitals: Record<string, WebVitalMetric> = {
          LCP: {
            name: 'LCP',
            value: performanceReportData.lcp,
            rating: performanceReportData.lcp < 2500 ? 'good' : performanceReportData.lcp < 4000 ? 'needs-improvement' : 'poor',
          },
          FID: {
            name: 'FID',
            value: performanceReportData.fid,
            rating: performanceReportData.fid < 100 ? 'good' : performanceReportData.fid < 300 ? 'needs-improvement' : 'poor',
          },
          CLS: {
            name: 'CLS',
            value: performanceReportData.cls,
            rating: performanceReportData.cls < 0.1 ? 'good' : performanceReportData.cls < 0.25 ? 'needs-improvement' : 'poor',
          },
          TTFB: {
            name: 'TTFB',
            value: performanceReportData.ttfb,
            rating: performanceReportData.ttfb < 200 ? 'good' : performanceReportData.ttfb < 500 ? 'needs-improvement' : 'poor',
          },
          FCP: {
            name: 'FCP',
            value: performanceReportData.fcp,
            rating: performanceReportData.fcp < 1800 ? 'good' : performanceReportData.fcp < 3000 ? 'needs-improvement' : 'poor',
          },
        };
        
        setWebVitals(vitals);
        
        // Update history
        const historyItem: PerformanceHistoryItem = {
          lcp: performanceReportData.lcp,
          fid: performanceReportData.fid,
          cls: performanceReportData.cls,
          ttfb: performanceReportData.ttfb,
          fcp: performanceReportData.fcp,
          score: performanceReportData.performanceScore,
          timestamp: performanceReportData.timestamp,
        };
        
        setPerformanceHistory(prev => {
          // Keep last 30 data points
          const newHistory = [...prev, historyItem];
          if (newHistory.length > 30) {
            return newHistory.slice(newHistory.length - 30);
          }
          return newHistory;
        });
        
      } catch (err) {
        console.error('Failed to import WebPerformanceMonitor:', err);
        performanceReportData = EMPTY_REPORT;
      }
      
      setData(performanceReportData);
    } catch (err) {
      const thrownError = err instanceof Error ? err : new Error('Failed to load web performance data');
      setError(thrownError);
      console.error(thrownError);
    } finally {
      setIsLoading(false);
    }
  }, [disabled]);

  // Initial load and refresh interval
  useEffect(() => {
    void refresh();

    if (refreshInterval > 0 && !disabled && Platform.OS === 'web') {
      const interval = setInterval(() => {
        void refresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [refresh, refreshInterval, disabled]);

  return {
    data,
    webVitals,
    performanceHistory,
    isLoading,
    error,
    refresh,
  };
}

export default useWebVitals; 