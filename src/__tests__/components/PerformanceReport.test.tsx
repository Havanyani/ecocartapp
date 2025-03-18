import { PerformanceReport } from '@components/performance/PerformanceReport';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import { MetricsPersistenceService } from '../../services/MetricsPersistenceService';
import { PerformanceExportService } from '../../services/PerformanceExportService';

jest.mock('../../services/MetricsPersistenceService');
jest.mock('../../services/PerformanceExportService');

// Mock the MetricsChart component
jest.mock('../../components/MetricsChart', () => ({
  MetricsChart: function MockMetricsChart(props: any) {
    return <View testID="metrics-chart" {...props} />;
  }
}));

describe('PerformanceReport', () => {
  const mockMetrics = [
    {
      type: 'latency',
      label: 'Latency',
      value: 150,
      unit: 'ms',
      values: [100, 150, 200],
      average: 150,
      trend: 'increasing',
      change: +50,
      icon: 'timer'
    },
    {
      type: 'throughput',
      label: 'Throughput',
      value: 1033,
      unit: 'req/s',
      values: [1000, 1200, 900],
      average: 1033,
      trend: 'stable',
      change: -100,
      icon: 'chart-line'
    }
  ];

  const defaultProps = {
    metrics: mockMetrics,
    timeframe: '7d'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MetricsPersistenceService.loadMetrics as jest.Mock).mockResolvedValue(mockMetrics);
  });

  it('loads and displays metrics on mount', async () => {
    const { getByTestId, getByText } = render(<PerformanceReport {...defaultProps} />);

    await act(async () => {
      // Wait for metrics to load
    });

    expect(MetricsPersistenceService.loadMetrics).toHaveBeenCalled();
    expect(getByTestId('metrics-chart')).toBeTruthy();
    expect(getByText('Average Latency: 150ms')).toBeTruthy();
    expect(getByText('Average Throughput: 1,033/s')).toBeTruthy();
  });

  it('handles export functionality', async () => {
    const { getByText } = render(<PerformanceReport {...defaultProps} />);

    await act(async () => {
      fireEvent.press(getByText('Export Report'));
    });

    expect(PerformanceExportService.exportMetrics).toHaveBeenCalledWith(
      mockMetrics,
      expect.any(String)
    );
  });

  it('shows loading state while fetching metrics', () => {
    const { getByTestId } = render(<PerformanceReport {...defaultProps} />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('handles load metrics error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (MetricsPersistenceService.loadMetrics as jest.Mock).mockRejectedValueOnce(new Error('Load failed'));

    await act(async () => {
      render(<PerformanceReport {...defaultProps} />);
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to load metrics:',
      expect.any(Error)
    );
    consoleError.mockRestore();
  });

  it('provides accessible metrics information', async () => {
    const { getByLabelText } = render(<PerformanceReport {...defaultProps} />);

    await act(async () => {
      // Wait for metrics to load
    });

    expect(getByLabelText('Performance metrics chart')).toBeTruthy();
    expect(getByLabelText('Export performance report')).toBeTruthy();
  });
}); 