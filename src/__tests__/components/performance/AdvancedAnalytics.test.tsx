import { AdvancedAnalytics } from '@/components/performance/AdvancedAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTheme } from '@/theme';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock the hooks
jest.mock('@/hooks/useAnalytics');
jest.mock('@/hooks/useTheme');

describe('AdvancedAnalytics', () => {
  const mockAnalyticsData = {
    activeUsers: 1000,
    sessionDuration: 120,
    totalScreenViews: 5000,
    avgLoadTime: 1.5,
    errorRate: 0.1,
    memoryUsage: 50,
    retentionRate: 85,
    conversionRate: 25,
    satisfactionScore: 4.5,
    timeSeriesData: [
      { x: '1', y: 10 },
      { x: '2', y: 20 },
      { x: '3', y: 15 },
    ],
  };

  const mockTheme = {
    colors: {
      primary: '#4ECDC4',
      background: '#FFFFFF',
      text: '#000000',
    },
  };

  beforeEach(() => {
    (useAnalytics as jest.Mock).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    });
    (useTheme as jest.Mock).mockReturnValue({ theme: mockTheme });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={() => {}} />
    );

    // Check if main sections are rendered
    expect(getByText('Advanced Analytics')).toBeTruthy();
    expect(getByText('Usage')).toBeTruthy();
    expect(getByText('Performance')).toBeTruthy();
    expect(getByText('Engagement')).toBeTruthy();
  });

  it('displays correct metrics for usage category', () => {
    const { getByText } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={() => {}} />
    );

    expect(getByText('1000')).toBeTruthy(); // Active Users
    expect(getByText('120')).toBeTruthy(); // Session Duration
    expect(getByText('5000')).toBeTruthy(); // Screen Views
  });

  it('switches between metric categories', () => {
    const { getByText } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={() => {}} />
    );

    // Click on Performance tab
    fireEvent.press(getByText('Performance'));
    expect(getByText('1.5')).toBeTruthy(); // Load Time
    expect(getByText('0.1')).toBeTruthy(); // Error Rate
    expect(getByText('50')).toBeTruthy(); // Memory Usage

    // Click on Engagement tab
    fireEvent.press(getByText('Engagement'));
    expect(getByText('85')).toBeTruthy(); // Retention
    expect(getByText('25')).toBeTruthy(); // Conversion
    expect(getByText('4.5')).toBeTruthy(); // Satisfaction
  });

  it('changes time range when buttons are pressed', () => {
    const onTimeRangeChange = jest.fn();
    const { getByText } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={onTimeRangeChange} />
    );

    fireEvent.press(getByText('Day'));
    expect(onTimeRangeChange).toHaveBeenCalledWith('day');

    fireEvent.press(getByText('Month'));
    expect(onTimeRangeChange).toHaveBeenCalledWith('month');
  });

  it('displays loading state when data is loading', () => {
    (useAnalytics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { getByTestId } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={() => {}} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error state when there is an error', () => {
    const errorMessage = 'Failed to load analytics data';
    (useAnalytics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error(errorMessage),
    });

    const { getByText } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={() => {}} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders charts with correct data', async () => {
    const { getByTestId } = render(
      <AdvancedAnalytics timeRange="week" onTimeRangeChange={() => {}} />
    );

    // Check if charts are rendered
    expect(getByTestId('trend-analysis-chart')).toBeTruthy();
    expect(getByTestId('metric-distribution-chart')).toBeTruthy();

    // Wait for charts to be populated with data
    await waitFor(() => {
      expect(getByTestId('trend-analysis-chart')).toHaveProp('data', mockAnalyticsData.timeSeriesData);
    });
  });
}); 