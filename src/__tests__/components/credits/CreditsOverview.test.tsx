import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { CreditsOverview } from '../../../src/components/credits/CreditsOverview';

const mockCreditsData = {
  balance: 125.50,
  pendingCredits: 15.25,
  recentTransactions: [
    {
      id: '1',
      date: '2024-01-20',
      amount: 25.50,
      type: 'earned',
      source: 'collection'
    },
    {
      id: '2',
      date: '2024-01-18',
      amount: 50.00,
      type: 'redeemed',
      source: 'purchase'
    }
  ]
};

describe('CreditsOverview', () => {
  it('displays current credits balance', () => {
    render(<CreditsOverview data={mockCreditsData} />);
    
    expect(screen.getByText('125.50')).toBeTruthy();
    expect(screen.getByText('Current Balance')).toBeTruthy();
  });

  it('shows pending credits', () => {
    render(<CreditsOverview data={mockCreditsData} />);
    
    expect(screen.getByText('15.25')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders recent transactions', () => {
    render(<CreditsOverview data={mockCreditsData} />);
    
    expect(screen.getByText('+25.50')).toBeTruthy();
    expect(screen.getByText('-50.00')).toBeTruthy();
  });
}); 