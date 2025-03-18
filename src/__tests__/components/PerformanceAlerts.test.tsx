import { PerformanceAlerts } from '@/components/performance/PerformanceAlerts';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { act, render } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/utils/WebSocketPerformance');
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null
}));

describe('PerformanceAlerts', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<PerformanceAlerts />);
    expect(getByTestId('performance-alerts')).toBeTruthy();
  });

  it('displays alerts when they exist', () => {
    const mockAlerts = [
      {
        id: 1,
        type: 'latency',
        message: 'High latency detected',
        severity: 'warning',
        icon: 'warning'
      }
    ];

    const { getByText } = render(<PerformanceAlerts />);
    expect(getByText('High latency detected')).toBeTruthy();
  });

  it('handles empty alerts array', () => {
    const { getByTestId } = render(<PerformanceAlerts />);
    expect(getByTestId('no-alerts')).toBeTruthy();
  });

  it('displays correct severity colors', () => {
    const mockAlerts = [
      {
        id: 1,
        type: 'error',
        message: 'Critical error',
        severity: 'error',
        icon: 'error'
      },
      {
        id: 2,
        type: 'warning',
        message: 'Warning message',
        severity: 'warning',
        icon: 'warning'
      }
    ];

    const { getByTestId } = render(<PerformanceAlerts />);
    expect(getByTestId('alert-1')).toHaveStyle({ borderLeftColor: '#FF3B30' });
    expect(getByTestId('alert-2')).toHaveStyle({ borderLeftColor: '#FF9500' });
  });

  it('shows no alerts when metrics are within thresholds', () => {
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockReturnValue({
      averageLatency: 500,
      averageCompressionRatio: 0.5,
      averageBatchSize: 50
    });

    const { queryByRole } = render(<PerformanceAlerts />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(queryByRole('alert')).toBeNull();
  });

  it('shows latency alert when threshold exceeded', () => {
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockReturnValue({
      averageLatency: 1500,
      averageCompressionRatio: 0.5,
      averageBatchSize: 50
    });

    const { getByRole, getByText } = render(<PerformanceAlerts />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const alert = getByRole('alert');
    expect(alert).toBeTruthy();
    expect(getByText(/High latency/)).toBeTruthy();
  });

  it('shows multiple alerts when multiple thresholds exceeded', () => {
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockReturnValue({
      averageLatency: 1500,
      averageCompressionRatio: 0.9,
      averageBatchSize: 150
    });

    const { getAllByRole } = render(<PerformanceAlerts />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const alerts = getAllByRole('alert');
    expect(alerts).toHaveLength(3);
  });

  it('handles errors gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockImplementation(() => {
      throw new Error('Network error');
    });

    render(<PerformanceAlerts />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Error fetching performance metrics:',
      expect.any(Error)
    );
    consoleError.mockRestore();
  });

  it('applies correct styling to alerts based on severity', () => {
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockReturnValue({
      averageLatency: 1500,
      averageCompressionRatio: 0.9,
      averageBatchSize: 150
    });

    const { getAllByRole } = render(<PerformanceAlerts />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const alerts = getAllByRole('alert');
    expect(alerts[0]).toHaveStyle({
      backgroundColor: '#fff3cd'
    });
  });
}); 