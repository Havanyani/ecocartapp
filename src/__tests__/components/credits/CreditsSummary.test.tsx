import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { CreditsSummary } from '../../../../credits/CreditsSummary';

const mockSummary = {
  totalCredits: 250.75,
  pendingCredits: 25.50,
  lastCollection: {
    date: '2024-01-20',
    credits: 12.25,
    weight: 4.5
  },
  nextRedemptionAvailable: true
};

describe('CreditsSummary', () => {
  it('displays credit totals', () => {
    render(<CreditsSummary summary={mockSummary} />);
    
    expect(screen.getByText('250.75')).toBeTruthy();
    expect(screen.getByText('Pending: 25.50')).toBeTruthy();
  });

  it('shows last collection details', () => {
    render(<CreditsSummary summary={mockSummary} />);
    import { render, screen } from '@testing-library/react-native';
    import React from 'react';
    import { CreditsSummary } from '../../../src/components/credits/CreditsSummary';
    
    const mockSummary = {
      totalCredits: 250.75,
      pendingCredits: 25.50,
      lastCollection: {
        date: '2024-01-20',
        credits: 12.25,
        weight: 4.5
      },
      nextRedemptionAvailable: true
    };
    
    describe('CreditsSummary', () => {
      it('displays credit totals', () => {
        render(<CreditsSummary summary={mockSummary} />);
        
        expect(screen.getByText('250.75')).toBeTruthy();
        expect(screen.getByText('Pending: 25.50')).toBeTruthy();
      });
    
      it('shows last collection details', () => {
        render(<CreditsSummary summary={mockSummary} />);