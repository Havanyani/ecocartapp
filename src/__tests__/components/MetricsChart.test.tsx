import { render } from '@testing-library/react-native';
import React from 'react';
import { MetricsChart } from '../../components/MetricsChart';
import { MetricsPersistenceService } from '../../services/MetricsPersistenceService';
import { MetricsSummary, TimeSeriesMetrics } from '../../types/PerformanceMonitoring';

jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart'
}));

jest.mock('../../services/MetricsPersistenceService');

describe('MetricsChart', () => {
  const mockData: TimeSeriesMetrics = {
    1000: { latency: 100, throughput: 50, compressionRatio: 0.5 },
    2000: { latency: 150, throughput: 45, compressionRatio: 0.6 },
    3000: { latency: 120, throughput: 55, compressionRatio: 0.55 }
  };

  const mockSummary: MetricsSummary = {
    latency: {
      current: 120,
      average: 123.33,
      trend: 'stable'
    },
    throughput: {
      current: 55,
      average: 50,
      trend: 'increasing'
    },
    compressionRatio: {
      current: 0.55,
      average: 0.55,
      trend: 'stable'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MetricsPersistenceService.calculateMetricsSummary as jest.Mock).mockReturnValue(mockSummary);
  });

  it('renders chart with correct title', () => {
    const { getByText } = render(
      <MetricsChart
        data={mockData}
        metric="latency"
        title="Latency Chart"
      />
    );

    expect(getByText('Latency Chart')).toBeTruthy();
  });

  it('displays metric summary information', () => {
    const { getByText } = render(
      <MetricsChart
        data={mockData}
        metric="latency"
        title="Latency"
      />
    );

    expect(getByText('Current: 120ms')).toBeTruthy();
    expect(getByText('Average: 123.33ms')).toBeTruthy();
  });

  it('formats different metric types correctly', () => {
    const { getByText, rerender } = render(
      <MetricsChart
        data={mockData}
        metric="compressionRatio"
        title="Compression"
      />
    );

    expect(getByText('Current: 55%')).toBeTruthy();

    rerender(
      <MetricsChart
        data={mockData}
        metric="throughput"
        title="Throughput"
      />
    );

    expect(getByText('Current: 55/s')).toBeTruthy();
  });

  it('provides accessible chart information', () => {
    const { getByLabelText } = render(
      <MetricsChart
        data={mockData}
        metric="latency"
        title="Latency"
      />
    );

    expect(getByLabelText('Latency trend chart')).toBeTruthy();
    expect(getByLabelText('Current latency: 120 milliseconds')).toBeTruthy();
  });

  it('handles empty data gracefully', () => {
    const { getByText } = render(
      <MetricsChart
        data={{}}
        metric="latency"
        title="Latency"
      />
    );

    expect(getByText('No data available')).toBeTruthy();
  });

  it('displays trend indicators', () => {
    const { getByTestId } = render(
      <MetricsChart
        data={mockData}
        metric="throughput"
        title="Throughput"
      />
    );

    const trendIndicator = getByTestId('trend-indicator');
    expect(trendIndicator).toHaveTextContent('↑'); // Increasing trend
  });
}); 