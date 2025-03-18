import { MetricItem, TimeSeriesMetrics } from '@/types/PerformanceMonitoring';

type AggregationFunction = (values: number[]) => number;

export class MetricsAggregation {
  static readonly AGGREGATION_FUNCTIONS = {
    avg: (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length,
    max: (values: number[]) => Math.max(...values),
    min: (values: number[]) => Math.min(...values),
    sum: (values: number[]) => values.reduce((a, b) => a + b, 0),
  };

  static aggregateByTimeWindow(
    metrics: TimeSeriesMetrics,
    windowSize: number,
    aggregation: keyof typeof MetricsAggregation.AGGREGATION_FUNCTIONS = 'avg'
  ): TimeSeriesMetrics {
    const windows = this.groupByTimeWindow(metrics, windowSize);
    const aggFn = this.AGGREGATION_FUNCTIONS[aggregation];

    return Object.entries(windows).reduce((acc, [timestamp, items]) => {
      acc[Number(timestamp)] = this.aggregateMetrics(items, aggFn);
      return acc;
    }, {} as TimeSeriesMetrics);
  }

  private static groupByTimeWindow(metrics: TimeSeriesMetrics, windowSize: number) {
    return Object.entries(metrics).reduce((acc, [timestamp, metric]) => {
      const time = Number(timestamp);
      const windowStart = Math.floor(time / windowSize) * windowSize;
      
      if (!acc[windowStart]) {
        acc[windowStart] = [];
      }
      acc[windowStart].push(metric);
      return acc;
    }, {} as Record<number, MetricItem[]>);
  }

  private static aggregateMetrics(
    metrics: MetricItem[],
    aggFn: AggregationFunction
  ): MetricItem {
    const result: MetricItem = { timestamp: metrics[0].timestamp };

    ['latency', 'throughput', 'compressionRatio'].forEach(key => {
      const values = metrics
        .map(m => m[key as keyof MetricItem])
        .filter((v): v is number => typeof v === 'number');

      if (values.length > 0) {
        result[key as keyof MetricItem] = aggFn(values);
      }
    });

    return result;
  }
} 