import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('react-native-chart-kit', () => ({
  LineChart: () => null
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null
}));

describe('PerformanceDashboard', () => {
  const mockMetrics = {
    averageLatency: 100,
    throughput: 50,
    averageCompressionRatio: 0.75,
    totalMetrics: {
      messages: 1000,
      failed: 50
    },
    chartData: {
      labels: ['1', '2', '3'],
      datasets: [{
        data: [10, 20, 30]
      }]
    }
  };

  const mockOnTimeframeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all metric cards with correct values', () => {
    const { getByText } = render(
      <PerformanceDashboard 
        metrics={mockMetrics}
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    expect(getByText('100.00ms')).toBeTruthy();
    expect(getByText('50.00/s')).toBeTruthy();
    expect(getByText('75.00%')).toBeTruthy();
    expect(getByText('95.00%')).toBeTruthy(); // Success rate calculation
  });

  it('handles timeframe selection', () => {
    const { getByText } = render(
      <PerformanceDashboard 
        metrics={mockMetrics}
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    fireEvent.press(getByText('Week'));
    expect(mockOnTimeframeChange).toHaveBeenCalledWith('Week');
  });

  it('applies selected timeframe styling', () => {
    const { getByText } = render(
      <PerformanceDashboard 
        metrics={mockMetrics}
        onTimeframeChange={mockOnTimeframeChange}
        selectedTimeframe="Week"
      />
    );

    const weekButton = getByText('Week').parent;
    expect(weekButton).toHaveStyle({
      backgroundColor: '#2e7d32'
    });
  });

  it('handles edge cases in metrics data', () => {
    const edgeCaseMetrics = {
      ...mockMetrics,
      averageLatency: NaN,
      totalMetrics: {
        messages: 0,
        failed: 0
      }
    };

    const { getByText } = render(
      <PerformanceDashboard 
        metrics={edgeCaseMetrics}
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    expect(getByText('N/A')).toBeTruthy();
    expect(getByText('0.00%')).toBeTruthy();
  });

  it('provides proper accessibility labels', () => {
    const { getByLabelText } = render(
      <PerformanceDashboard 
        metrics={mockMetrics}
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    expect(getByLabelText('Average latency is 100.00 milliseconds')).toBeTruthy();
    expect(getByLabelText('Time frame selection')).toBeTruthy();
    expect(getByLabelText('Switch to week view')).toBeTruthy();
  });

  it('renders chart with correct dimensions', () => {
    const { getByTestId } = render(
      <PerformanceDashboard 
        metrics={mockMetrics}
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    const dashboard = getByTestId('performance-dashboard');
    expect(dashboard).toHaveStyle({
      padding: 16
    });
  });
}); 