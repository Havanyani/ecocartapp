import type { RootStackParamList } from '@/navigation/types';
import { PerformanceMonitorScreen } from '@/screens/PerformanceMonitorScreen';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/utils/WebSocketPerformance');
jest.mock('@components/performance/PerformanceAlerts', () => ({
  PerformanceAlerts: () => 'PerformanceAlerts'
}));
jest.mock('@components/performance/PerformanceDashboard', () => ({
  PerformanceDashboard: ({ metrics }: { metrics: any }) => `PerformanceDashboard-${JSON.stringify(metrics)}`
}));
jest.mock('@components/performance/PerformanceReport', () => ({
  PerformanceReport: () => 'PerformanceReport'
}));
jest.mock('@components/performance/PerformanceTrends', () => ({
  PerformanceTrends: () => 'PerformanceTrends'
}));

const mockNavigation: NativeStackNavigationProp<RootStackParamList, 'PerformanceMonitor'> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  navigateDeprecated: jest.fn(),
  preload: jest.fn(),
  setStateForNextRouteNamesChange: jest.fn(),
} as unknown as NativeStackNavigationProp<RootStackParamList, 'PerformanceMonitor'>;

const mockRoute: RouteProp<RootStackParamList, 'PerformanceMonitor'> = {
  key: 'PerformanceMonitor',
  name: 'PerformanceMonitor',
  params: undefined
};

describe('PerformanceMonitorScreen', () => {
  const mockMetrics = {
    averageLatency: 100,
    throughput: 50,
    averageCompressionRatio: 0.75,
    totalMetrics: {
      messages: 1000,
      failed: 10
    },
    chartData: {
      labels: ['1h', '2h', '3h'],
      datasets: [{
        data: [10, 20, 30]
      }]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockReturnValue(mockMetrics);
  });

  it('renders all performance components', () => {
    render(
      <PerformanceMonitorScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByTestId('performance-monitor-screen')).toBeTruthy();
    expect(screen.getByText('PerformanceAlerts')).toBeTruthy();
    expect(screen.getByText(`PerformanceDashboard-${JSON.stringify(mockMetrics)}`)).toBeTruthy();
    expect(screen.getByText('PerformanceReport')).toBeTruthy();
    expect(screen.getByText('PerformanceTrends')).toBeTruthy();
  });

  it('fetches metrics on render', () => {
    render(
      <PerformanceMonitorScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(WebSocketPerformance.getMetricsSummary).toHaveBeenCalledTimes(1);
  });

  it('passes metrics to PerformanceDashboard', () => {
    render(
      <PerformanceMonitorScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByText(`PerformanceDashboard-${JSON.stringify(mockMetrics)}`)).toBeTruthy();
  });

  it('handles error state when metrics fetch fails', () => {
    const error = new Error('Failed to fetch metrics');
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockImplementation(() => {
      throw error;
    });

    render(
      <PerformanceMonitorScreen 
        navigation={mockNavigation}
        route={mockRoute}
      />
    );

    expect(screen.getByTestId('performance-monitor-error')).toBeTruthy();
    expect(screen.getByText('Failed to fetch metrics')).toBeTruthy();
  });
}); 