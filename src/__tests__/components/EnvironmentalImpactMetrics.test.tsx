import { EnvironmentalImpactMetrics } from '@/components/analytics/EnvironmentalImpactMetrics';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

describe('EnvironmentalImpactMetrics', () => {
  const mockMetrics = {
    totalPlasticCollected: 1500.75,
    plasticTypes: [
      {
        type: 'PET',
        weight: 500,
        co2Saved: 1000,
        waterSaved: 5000,
        energySaved: 200
      }
    ],
    co2Reduction: 3000.5,
    waterSaved: 15000,
    energySaved: 600,
    treesEquivalent: 50,
    communityMetrics: {
      totalUsers: 1000,
      activeUsers: 750,
      totalCollections: 5000,
      averagePerUser: 1.5
    },
    monthlyTrends: {
      dates: ['Jan', 'Feb', 'Mar'],
      plasticWeights: [400, 500, 600],
      co2Savings: [800, 1000, 1200]
    }
  };

  it('handles extremely large numbers', () => {
    const largeMetrics = {
      ...mockMetrics,
      totalPlasticCollected: 1000000000,
      co2Reduction: 2000000000
    };

    const { getByText } = render(
      <EnvironmentalImpactMetrics metrics={largeMetrics} />
    );

    expect(getByText('1000.0M')).toBeTruthy();
    expect(getByText('2000.0M')).toBeTruthy();
  });

  it('handles zero values', () => {
    const zeroMetrics = {
      ...mockMetrics,
      totalPlasticCollected: 0,
      co2Reduction: 0,
      waterSaved: 0,
      energySaved: 0
    };

    const { getAllByText } = render(
      <EnvironmentalImpactMetrics metrics={zeroMetrics} />
    );

    const zeroValues = getAllByText('0.0');
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  it('handles negative trends', () => {
    const negativeMetrics = {
      ...mockMetrics,
      monthlyTrends: {
        dates: ['Jan', 'Feb', 'Mar'],
        plasticWeights: [600, 400, 200],
        co2Savings: [1200, 800, 400]
      }
    };

    const { getByTestId } = render(
      <EnvironmentalImpactMetrics metrics={negativeMetrics} />
    );

    const chart = getByTestId('trends-chart');
    expect(chart).toBeTruthy();
  });

  it('handles missing community metrics', () => {
    const incompleteMetrics = {
      ...mockMetrics,
      communityMetrics: {
        totalUsers: 0,
        activeUsers: 0,
        totalCollections: 0,
        averagePerUser: 0
      }
    };

    const { getByText } = render(
      <EnvironmentalImpactMetrics metrics={incompleteMetrics} />
    );

    expect(getByText('0')).toBeTruthy();
  });

  it('handles timeframe changes with no data', () => {
    const noTrendsMetrics = {
      ...mockMetrics,
      monthlyTrends: {
        dates: [],
        plasticWeights: [],
        co2Savings: []
      }
    };

    const mockOnTimeframeChange = jest.fn();
    const { getByText } = render(
      <EnvironmentalImpactMetrics
        metrics={noTrendsMetrics}
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    fireEvent.press(getByText('Year'));
    expect(mockOnTimeframeChange).toHaveBeenCalledWith('Year');
  });
}); 