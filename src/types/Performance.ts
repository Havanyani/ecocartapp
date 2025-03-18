/**
 * Performance type definitions
 * @module types/performance
 */

/**
 * Performance data interface
 */
export interface PerformanceData {
  timestamp: string;
  metrics: PerformanceMetrics;
  context: PerformanceContext;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  networkLatency: number;
  apiResponseTime: number;
  storageOperations: {
    reads: number;
    writes: number;
    latency: number;
  };
}

/**
 * Performance context interface
 */
export interface PerformanceContext {
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel: string;
    screenSize: {
      width: number;
      height: number;
    };
  };
  appInfo: {
    version: string;
    buildNumber: string;
  };
  networkInfo: {
    type: NetworkType;
    strength: number;
  };
}

/**
 * Network type
 */
export type NetworkType = 
  | 'WIFI'
  | 'CELLULAR'
  | 'ETHERNET'
  | 'NONE'
  | 'UNKNOWN';

export type TimeFrame = 'Last Hour' | 'Last Day' | 'Last Week' | 'Last Month' | 'Last 3 Months';
export type InsightType = 'positive' | 'negative' | 'neutral';
export type MetricCategory = 'collection' | 'environmental' | 'financial';

export interface MetricData {
  latency: number;
  throughput: number;
  compressionRatio: number;
  errorRate?: number;
}

export interface TimeSeriesMetrics {
  [timestamp: number]: MetricItem;
}

export interface MetricTrend {
  change: number;
  direction: 'increasing' | 'decreasing';
}

export interface MetricsSummary {
  latency: MetricSummary;
  throughput: MetricSummary;
  compressionRatio: MetricSummary;
}

export type TableAlign = 'left' | 'right' | 'center';

export interface TableColumn {
  id: string;
  label: string;
  width: number;
  align?: TableAlign;
}

const tableColumns: TableColumn[] = [
  { id: 'date', label: 'Date', width: 100, align: 'left' },
  { id: 'weight', label: 'Weight', width: 80, align: 'right' },
  { id: 'collectors', label: 'Collectors', width: 90, align: 'center' }
];

export interface ChartSeries {
  id: string;
  label: string;
  data: { date: Date; value: number; }[];
  color: string;
  category: MetricCategory;
}

export interface InsightTrend {
  id: string;
  type: InsightType;
  metric: string;
  description: string;
  value: number;
  change: number;
  confidence: number;
  category: MetricCategory;
  recommendations: string[];
  relatedMetrics?: { label: string; value: number; correlation: number; }[];
}

export interface MetricItem {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  change?: number;
  target?: number;
  category?: string;
  status?: 'on-track' | 'at-risk';
}

export interface TableRow {
  id: string;
  category: MetricCategory;
  data: { [key: string]: string | number };
  expandable: boolean;
  details: { label: string; value: string; }[];
}

export interface TrendData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

export interface MetricSummary {
  current: number;
  average: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface Metrics {
  memory: number;
  cpu: number;
  fps: number;
  renderTime: number;
  networkCalls: number;
  diskOperations: number;
}

export interface Trace {
  component: string;
  renderCount: number;
  totalTime: number;
  avgTime: number;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  thresholds: Metrics;
}

export interface MemoryLeakResult {
  isDetected: boolean;
  leakSize: number;
  componentName: string;
  stackTrace: string;
}

export interface AnimationMetrics {
  framesDropped: number;
  jankScore: number;
  averageFrameTime: number;
}

export interface ProfileResult {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  metrics: Metrics;
  traces: Trace[];
}

export interface ExtendedProfileResult extends ProfileResult {
  memoryLeak?: MemoryLeakResult;
  animation?: AnimationMetrics;
  thresholds: Metrics;
} 