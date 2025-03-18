import { ReactNode } from 'react';
import { ExtendedProfileResult, Metrics } from './Performance';

export interface PerformanceInsight {
  id: string;
  title: string;
  description: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high';
  metric: keyof Metrics;
  timestamp: number;
}

export interface TrendPrediction {
  metric: keyof Metrics;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  rateOfChange: number;
}

export interface TrendChart {
  metric: keyof Metrics;
  data: Array<{ x: number; y: number }>;
  prediction: Array<{ x: number; y: number }>;
  bounds: Array<{ x: number; y: number }>;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface ZoomDomain {
  x: [number, number];
  y?: [number, number];
}

export interface ExportModalState {
  visible: boolean;
  format: 'json' | 'csv';
  selectedMetrics: Array<keyof Metrics>;
  includeInsights: boolean;
  includeCharts: boolean;
}

export interface AdvancedAnalyticsProps {
  results: ExtendedProfileResult[];
  onMetricSelect?: (metric: keyof Metrics) => void;
  children?: ReactNode;
}