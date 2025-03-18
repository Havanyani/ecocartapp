/**
 * Types for analytics and data visualization
 */

import { CollectionStatus } from './Collection';

// Time frame options for data filtering
export type TimeFrame = 'day' | 'week' | 'month' | 'year' | 'all';

// Metric types for data visualization
export type MetricType = 'weight' | 'collections' | 'impact' | 'co2' | 'water';

// Material data for visualization
export interface MaterialData {
  name: string;
  value: number;
  color?: string;
}

// Dataset for charts
export interface Dataset {
  data: number[];
  color?: string | ((opacity: number) => string);
  colors?: Array<string | ((opacity: number) => string)>;
  strokeWidth?: number;
}

// Chart data structure
export interface ChartData {
  labels: string[];
  datasets: Dataset[];
  legend?: string[];
}

// Analytics summary data
export interface AnalyticsSummary {
  totalWeight: number;
  totalCollections: number;
  co2Saved: number;
  waterSaved: number;
  treesEquivalent: number;
  energySaved: number;
  wasteReduced: number;
}

// Collection data for analytics
export interface CollectionData {
  id: string;
  date: string;
  weight: number;
  materials: MaterialData[];
  location?: string;
  status: CollectionStatus;
  environmentalImpact: {
    co2Saved: number;
    waterSaved: number;
    treesEquivalent: number;
  };
}

// User recycling goal
export interface RecyclingGoal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  category: 'weight' | 'collections' | 'impact' | 'specific_material';
  specificMaterial?: string;
  status: 'active' | 'completed' | 'failed';
  progress: number; // 0-100
}

// Export data format options
export type ExportFormat = 'csv' | 'pdf' | 'json';

// Export data configuration
export interface ExportConfig {
  format: ExportFormat;
  timeFrame: TimeFrame;
  metrics: MetricType[];
  includeMaterials: boolean;
  includeCollections: boolean;
  includeImpact: boolean;
}

// Analytics filter options
export interface AnalyticsFilter {
  timeFrame: TimeFrame;
  materials?: string[];
  startDate?: string;
  endDate?: string;
  metrics: MetricType[];
}

// Community comparison data
export interface CommunityComparison {
  metric: MetricType;
  userValue: number;
  communityAverage: number;
  communityTopTen: number;
  percentileRank: number; // 0-100
}

// Aggregated analytics data
export interface AggregatedAnalytics {
  summary: AnalyticsSummary;
  materialBreakdown: MaterialData[];
  historyData: {
    [key in TimeFrame]: ChartData;
  };
  goals: RecyclingGoal[];
  communityComparison: CommunityComparison[];
  collections: CollectionData[];
}

// New types for Environmental Impact Metrics
export interface MaterialImpact {
  material: RecyclingMaterial;
  weight: number;
  co2Saved: number;
  waterSaved: number;
  energySaved: number;
  percentOfTotal: number;
}

export interface EcoComparisonMetric {
  co2SavedPercentage: number;
  waterSavedPercentage: number;
  energySavedPercentage: number;
  comparison: 'better' | 'worse' | 'same';
}

export interface EcoImpactMetrics {
  co2Saved: number;
  waterSaved: number;
  energySaved: number;
  treesEquivalent: number;
  comparisons?: Record<string, EcoComparisonMetric>;
  materialBreakdown?: MaterialImpact[];
  milestones?: any[];
  predictedImpact?: any;
  carbonOffsets?: any;
  communityContribution?: any;
}

// Add RecyclingMaterial type that matches what's in Collection
export type RecyclingMaterial = 'plastic' | 'paper' | 'glass' | 'metal' | 'electronics' | 'organic' | 'textile' | 'other'; 