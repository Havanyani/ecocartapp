import SustainabilityMetrics from '@components/sustainability/SustainabilityMetrics';
import { fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { generateMetrics, matchStyles, mockTheme, renderWithProviders } from '../../utils/testUtils';

type SustainabilityMetricsProps = {
  metrics?: ReturnType<typeof generateMetrics>;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onMetricSelect?: (type: string, value: number) => void;
};

// Extend the component's props
const SustainabilityMetricsWithProps = SustainabilityMetrics as React.ComponentType<SustainabilityMetricsProps>;

// Mock dependencies
jest.mock('@hooks/useTheme', () => ({
  useTheme: () => mockTheme
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name, testID }: any) => React.createElement(Text, { testID }, name)
}));

describe('SustainabilityMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders environmental metrics correctly', () => {
    const metrics = generateMetrics({ plasticWeight: 10 });
    const { getByTestId, getByText } = renderWithProviders(
      <SustainabilityMetricsWithProps metrics={metrics} />
    );

    // Check title
    expect(getByText('Environmental Impact')).toBeTruthy();

    // Check metrics
    expect(getByTestId('plastic-metric')).toHaveTextContent('10.0 kg');
    expect(getByTestId('carbon-metric')).toHaveTextContent('25.0 kg');
    expect(getByTestId('water-metric')).toHaveTextContent('38.0 L');
  });

  it('handles zero values', () => {
    const metrics = generateMetrics({
      plasticWeight: 0,
      carbonOffset: 0,
      waterSaved: 0
    });
    const { getByTestId } = renderWithProviders(
      <SustainabilityMetricsWithProps metrics={metrics} />
    );

    expect(getByTestId('plastic-metric')).toHaveTextContent('0.0 kg');
    expect(getByTestId('carbon-metric')).toHaveTextContent('0.0 kg');
    expect(getByTestId('water-metric')).toHaveTextContent('0.0 L');
  });

  it('provides accessible information', () => {
    const metrics = generateMetrics({ plasticWeight: 10 });
    const { getByLabelText } = renderWithProviders(
      <SustainabilityMetricsWithProps metrics={metrics} />
    );

    expect(getByLabelText('Plastic Recycled: 10 kg')).toBeTruthy();
    expect(getByLabelText('CO₂ Emissions Saved: 25 kg')).toBeTruthy();
    expect(getByLabelText('Water Saved: 38 L')).toBeTruthy();
  });

  it('applies theme styles correctly', () => {
    const metrics = generateMetrics();
    const { getByTestId } = renderWithProviders(
      <SustainabilityMetricsWithProps metrics={metrics} />,
      { theme: mockTheme }
    );

    const container = getByTestId('metrics-container');
    matchStyles(container, {
      backgroundColor: mockTheme.colors.background,
      padding: mockTheme.spacing.md
    });
  });

  it('handles user interactions', () => {
    const handleMetricPress = jest.fn();
    const metrics = generateMetrics();
    const { getByTestId } = renderWithProviders(
      <SustainabilityMetricsWithProps 
        metrics={metrics}
        onMetricSelect={handleMetricPress}
      />
    );

    fireEvent.press(getByTestId('plastic-metric'));
    expect(handleMetricPress).toHaveBeenCalledWith('plastic', metrics.plasticWeight);
  });

  it('displays loading state correctly', () => {
    const { getByTestId } = renderWithProviders(
      <SustainabilityMetricsWithProps isLoading={true} />
    );

    expect(getByTestId('metrics-loading')).toBeTruthy();
  });

  it('handles error state appropriately', () => {
    const handleRetry = jest.fn();
    const { getByText } = renderWithProviders(
      <SustainabilityMetricsWithProps 
        errorMessage="Failed to load metrics"
        onRetry={handleRetry}
      />
    );

    const retryButton = getByText('Retry');
    fireEvent.press(retryButton);
    expect(handleRetry).toHaveBeenCalled();
  });

  it('calculates derived metrics correctly', () => {
    const baseMetrics = generateMetrics();
    const metrics = { ...baseMetrics, plasticWeight: 100 };
    const { getByTestId } = renderWithProviders(
      <SustainabilityMetricsWithProps metrics={metrics} />
    );

    expect(getByTestId('plastic-metric')).toHaveTextContent('100.0 kg');
    expect(getByTestId('carbon-metric')).toHaveTextContent('250.0 kg'); // 100 * 2.5
    expect(getByTestId('water-metric')).toHaveTextContent('380.0 L');  // 100 * 3.8
  });

  it('renders correct icons for each metric', () => {
    const baseMetrics = generateMetrics();
    const metrics = { ...baseMetrics, plasticWeight: 10 };
    const { getByTestId } = renderWithProviders(
      <SustainabilityMetricsWithProps metrics={metrics} />
    );

    expect(getByTestId('metric-icon-recycle')).toBeTruthy();
    expect(getByTestId('metric-icon-molecule-co2')).toBeTruthy();
    expect(getByTestId('metric-icon-water')).toBeTruthy();
  });
}); 