import { PerformanceMonitorService } from '@/services/PerformanceMonitorService';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalActions: number;
  screenViews: Record<string, number>;
  featureUsage: Record<string, number>;
  conversions: Record<string, number>;
  engagement: Record<string, number>;
  activeUsers: number;
  sessionDuration: number;
  totalScreenViews: number;
  avgLoadTime: number;
  errorRate: number;
  memoryUsage: number;
  retentionRate: number;
  conversionRate: number;
  satisfactionScore: number;
  timeSeriesData: Array<{
    x: number;
    y: number;
    label: string;
  }>;
}

interface UseAnalyticsOptions {
  timeRange: 'day' | 'week' | 'month';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAnalytics(options: UseAnalyticsOptions) {
  const { timeRange, autoRefresh = true, refreshInterval = 60000 } = options;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = () => {
    try {
      setIsLoading(true);
      const now = Date.now();
      let startTime: number;

      switch (timeRange) {
        case 'day':
          startTime = now - 24 * 60 * 60 * 1000;
          break;
        case 'week':
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
      }

      const analyticsData = PerformanceMonitorService.getAnalyticsSummary(startTime, now) as AnalyticsData;
      setData(analyticsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load analytics data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh, refreshInterval]);

  const recordScreenView = (screenName: string, duration: number = 0, metadata?: Record<string, any>) => {
    PerformanceMonitorService.recordScreenView(screenName, duration, metadata);
  };

  const recordFeatureUsage = (featureName: string, usageCount: number = 1, metadata?: Record<string, any>) => {
    PerformanceMonitorService.recordFeatureUsage(featureName, usageCount, metadata);
  };

  const recordConversion = (conversionName: string, value: number = 1, metadata?: Record<string, any>) => {
    PerformanceMonitorService.recordConversion(conversionName, value, metadata);
  };

  const recordUserAction = (actionName: string, metadata?: Record<string, any>) => {
    PerformanceMonitorService.recordUserAction(actionName, metadata);
  };

  const recordUserEngagement = (type: string, value: number = 1, metadata?: Record<string, any>) => {
    PerformanceMonitorService.recordUserEngagement(type, value, metadata);
  };

  return {
    data,
    isLoading,
    error,
    recordScreenView,
    recordFeatureUsage,
    recordConversion,
    recordUserAction,
    recordUserEngagement,
    refresh: loadData,
  };
} 