import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { ImpactMetrics } from '../../../components/sustainability/ImpactMetrics';

const mockMetrics = {
  plasticCollected: 1250.5,
  co2Reduced: 375.15,
  treesEquivalent: 17,
  communityRank: 5,
  totalParticipants: 100
};

describe('ImpactMetrics', () => {
  it('displays environmental impact metrics', () => {
    render(<ImpactMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('1,250.5 kg')).toBeTruthy();
    expect(screen.getByText('375.15 kg')).toBeTruthy();
    expect(screen.getByText('17')).toBeTruthy();
  });

  it('shows community ranking', () => {
    render(<ImpactMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('Top 5%')).toBeTruthy();
    expect(screen.getByText('of 100 participants')).toBeTruthy();
  });
}); 