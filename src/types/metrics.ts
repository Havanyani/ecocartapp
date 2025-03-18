export interface TimeSeriesMetrics {
  timestamp: string;
  value: number;
  metadata: {
    source: string;
    confidence: number;
    tags: string[];
  };
} 