import { act, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PerformanceTrends } from '../../components/performance/PerformanceTrends';

// Mock LineChart component
jest.mock('react-native-chart-kit', () => ({
  LineChart: jest.fn().mockImplementation(props => (
    <View testID="line-chart" {...props} />
  ))
}));

// Mock WebSocketPerformance
jest.mock('../../utils/WebSocketPerformance', () => ({
  WebSocketPerformance: {
    subscribeToMetrics: jest.fn(callback => {
      callback({
        latency: 100,
        throughput: 1000,
        errorRate: 0.01
      });
      return () => {};
    }),
    getMetricsSummary: jest.fn(() => ({
      averageLatency: 150,
      averageThroughput: 950,
      errorRate: 0.02
    }))
  }
}));

describe('PerformanceTrends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial metrics', () => {
    const { getByTestId, getByText } = render(<PerformanceTrends />);
    
    expect(getByTestId('line-chart')).toBeTruthy();
    expect(getByText('Average Latency: 150ms')).toBeTruthy();
    expect(getByText('Average Throughput: 950/s')).toBeTruthy();
  });

  it('updates metrics in real-time', async () => {
    const { getByText } = render(<PerformanceTrends />);

    await act(async () => {
      // Metrics update is handled by the mock
    });

    expect(getByText('Current Latency: 100ms')).toBeTruthy();
    expect(getByText('Current Throughput: 1,000/s')).toBeTruthy();
  });

  it('provides accessible chart', () => {
    const { getByTestId } = render(<PerformanceTrends />);
    
    const chart = getByTestId('line-chart');
    expect(chart.props.accessible).toBe(true);
    expect(chart.props.accessibilityLabel).toBe('Performance trends chart');
    expect(chart.props.accessibilityHint).toContain('Shows performance metrics over time');
  });

  it('applies correct styling', () => {
    const { getByTestId } = render(<PerformanceTrends />);
    const container = getByTestId('trends-container');
    const flattenedStyle = StyleSheet.flatten(container.props.style);

    expect(flattenedStyle).toMatchObject({
      padding: expect.any(Number)
    });
  });

  it('handles subscription cleanup', () => {
    const unsubscribe = jest.fn();
    const mockWebSocketPerformance = require('../../utils/WebSocketPerformance').WebSocketPerformance;
    mockWebSocketPerformance.subscribeToMetrics.mockImplementationOnce(() => unsubscribe);

    const { unmount } = render(<PerformanceTrends />);
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
}); 