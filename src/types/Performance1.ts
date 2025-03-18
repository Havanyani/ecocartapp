export interface MetricData {
  latency: number;
  processingTime: number;
  compressionRatio: number;
  [key: string]: number;
}

export interface TimeSeriesMetrics {
  [timestamp: string]: MetricData;
}

export interface MetricTrend {
  direction: 'increasing' | 'decreasing';
  change: number;
}

export interface MetricsSummary {
  trends: {
    [K in keyof MetricData]?: MetricTrend;
  };
  latest: number;
  oldest: number;
  timeSpan: number;
  sampleCount: number;
} 