import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/index';

export interface PerformanceMetric {
  timestamp: number;
  type: 'latency' | 'memory' | 'error' | 'api_call';
  value: number;
  context?: Record<string, unknown>;
}

export interface PerformanceThresholds {
  latency: number; // milliseconds
  memory: number; // megabytes
  errorRate: number; // percentage
  apiCallTimeout: number; // milliseconds
}

export interface PerformanceState {
  metrics: PerformanceMetric[];
  thresholds: PerformanceThresholds;
  isMonitoring: boolean;
  alertsEnabled: boolean;
  retentionDays: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  metrics: [],
  thresholds: {
    latency: 1000, // 1 second
    memory: 256, // 256 MB
    errorRate: 5, // 5%
    apiCallTimeout: 30000, // 30 seconds
  },
  isMonitoring: true,
  alertsEnabled: true,
  retentionDays: 7,
  isLoading: false,
  error: null,
};

export const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    addMetric: (state, action: PayloadAction<PerformanceMetric>) => {
      state.metrics.push(action.payload);
      
      // Remove metrics older than retention period
      const cutoffTime = Date.now() - (state.retentionDays * 24 * 60 * 60 * 1000);
      state.metrics = state.metrics.filter(metric => metric.timestamp >= cutoffTime);
    },
    setThresholds: (state, action: PayloadAction<Partial<PerformanceThresholds>>) => {
      state.thresholds = { ...state.thresholds, ...action.payload };
    },
    setMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isMonitoring = action.payload;
    },
    setAlertsEnabled: (state, action: PayloadAction<boolean>) => {
      state.alertsEnabled = action.payload;
    },
    setRetentionDays: (state, action: PayloadAction<number>) => {
      state.retentionDays = action.payload;
      // Remove metrics outside new retention period
      const cutoffTime = Date.now() - (action.payload * 24 * 60 * 60 * 1000);
      state.metrics = state.metrics.filter(metric => metric.timestamp >= cutoffTime);
    },
    clearMetrics: (state) => {
      state.metrics = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  addMetric,
  setThresholds,
  setMonitoring,
  setAlertsEnabled,
  setRetentionDays,
  clearMetrics,
  setLoading,
  setError,
} = performanceSlice.actions;

// Export selectors
export const selectMetrics = (state: RootState) => state.performance.metrics;
export const selectThresholds = (state: RootState) => state.performance.thresholds;
export const selectIsMonitoring = (state: RootState) => state.performance.isMonitoring;
export const selectAlertsEnabled = (state: RootState) => state.performance.alertsEnabled;
export const selectRetentionDays = (state: RootState) => state.performance.retentionDays;
export const selectIsLoading = (state: RootState) => state.performance.isLoading;
export const selectError = (state: RootState) => state.performance.error;

// Helper selectors for specific metric types
export const selectLatencyMetrics = (state: RootState) =>
  state.performance.metrics.filter(m => m.type === 'latency');
export const selectMemoryMetrics = (state: RootState) =>
  state.performance.metrics.filter(m => m.type === 'memory');
export const selectErrorMetrics = (state: RootState) =>
  state.performance.metrics.filter(m => m.type === 'error');
export const selectApiCallMetrics = (state: RootState) =>
  state.performance.metrics.filter(m => m.type === 'api_call');

// Export reducer
export default performanceSlice.reducer; 