import {
    ExportModalState,
    PerformanceInsight,
    TrendChart,
    TrendPrediction
} from '@/types/AdvancedAnalytics';
import {
    ExtendedProfileResult,
    Metrics,
} from '@/types/Performance';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { PerformanceAnalytics } from '@/utils/PerformanceAnalytics';
import type { ExportOptions } from '@/utils/PerformanceExporter';
import { PerformanceExporter } from '@/utils/PerformanceExporter';
import React, { useEffect, useRef, useState } from 'react';

const errorHandler = ErrorHandler.getInstance();

/**
 * Custom hook for handling chart data loading and processing
 */
export const useChartData = (results: ExtendedProfileResult[]) => {
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [trendCharts, setTrendCharts] = useState<TrendChart[]>([]);
  const chartRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        if (results.length === 0) return;

        const metrics = Object.keys(results[0].metrics) as (keyof Metrics)[];
        
        // Initialize chart refs
        chartRefs.current = metrics.reduce((acc, metric) => ({
          ...acc,
          [metric]: React.createRef(),
        }), {});

        // Generate insights with error handling
        const newInsights = await errorHandler.handleAsync<PerformanceInsight[]>(
          () => PerformanceAnalytics.generateInsights(results),
          {
            severity: 'medium',
            context: { resultsCount: results.length },
          }
        );

        if (newInsights) {
          setInsights(newInsights);
        }

        // Generate trend charts
        const newTrendCharts = await generateTrendCharts(metrics, results);
        setTrendCharts(newTrendCharts);
      } catch (error) {
        errorHandler.handleError(error as Error, {
          severity: 'high',
          context: { component: 'AdvancedAnalytics' },
        });
      }
    };

    loadData();
  }, [results]);

  return { insights, trendCharts, chartRefs };
};

/**
 * Custom hook for managing export modal state
 */
export const useExportModal = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportModal, setExportModal] = useState<ExportModalState>({
    visible: false,
    format: 'json',
    selectedMetrics: [],
    includeInsights: true,
    includeCharts: false,
  });

  const handleExport = async (
    results: ExtendedProfileResult[],
    timeRange: ExportOptions['timeRange'],
    chartRefs: { [key: string]: React.RefObject<any> }
  ) => {
    try {
      setIsExporting(true);
      await errorHandler.handleAsync(
        () => PerformanceExporter.export(results, {
          format: exportModal.format,
          timeRange,
          metrics: exportModal.selectedMetrics.length > 0 ? exportModal.selectedMetrics : undefined,
          includeInsights: exportModal.includeInsights,
          includeCharts: exportModal.includeCharts,
          chartRefs: exportModal.includeCharts ? chartRefs : undefined,
        }),
        {
          severity: 'medium',
          context: {
            format: exportModal.format,
            selectedMetrics: exportModal.selectedMetrics,
          },
        }
      );
    } finally {
      setIsExporting(false);
      setExportModal((prev: ExportModalState) => ({ ...prev, visible: false }));
    }
  };

  return {
    isExporting,
    exportModal,
    setExportModal,
    handleExport,
  };
};

/**
 * Helper function to generate trend charts
 */
const generateTrendCharts = async (
  metrics: Array<keyof Metrics>,
  results: ExtendedProfileResult[]
): Promise<TrendChart[]> => {
  const trendCharts = await Promise.all(
    metrics.map(async (metric) => {
      try {
        const values = results.map(r => r.metrics[metric]);
        const timestamps = results.map((_, i) => i);

        // Get trend prediction with error handling
        const trends = await errorHandler.handleAsync<TrendPrediction[]>(
          () => PerformanceAnalytics.analyzeTrends(results),
          {
            severity: 'medium',
            context: { metric },
          }
        );

        if (!trends) return null;

        const trend = trends.find(t => t.metric === metric);
        if (!trend) return null;

        // Create chart data
        const data = timestamps.map((x, i) => ({ x, y: values[i] }));
        const prediction = [
          { x: timestamps.length, y: trend.currentValue },
          { x: timestamps.length + 1, y: trend.predictedValue },
        ];

        // Calculate confidence bounds
        const bounds = timestamps.map((x, i) => {
          const y = values[i];
          const confidence = trend.confidence;
          const range = y * (1 - confidence);
          return {
            x,
            y: y + range,
          };
        });

        return {
          metric,
          data,
          prediction,
          bounds,
        } as TrendChart;
      } catch (error) {
        errorHandler.handleError(error as Error, {
          severity: 'low',
          context: { metric },
        });
        return null;
      }
    })
  );

  return trendCharts.filter((chart): chart is TrendChart => chart !== null);
}; 