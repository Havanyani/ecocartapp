import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { CreditRedemption } from '@/src/components/rewards/CreditRedemption';

const mockRewards = [
  {
    id: '1',
    title: '₹50 Off Next Order',
    credits: 100,
    expiryDays: 30
  },
  {
    id: '2',
    title: 'Free Delivery',
    credits: 150,
    expiryDays: 15
  }
];

describe('CreditRedemption', () => {
  const mockOnRedeem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays available rewards', () => {
    render(
      <CreditRedemption 
        rewards={mockRewards}
        userCredits={200}
        onRedeem={mockOnRedeem}
      />
    );
    
    expect(screen.getByText('₹50 Off Next Order')).toBeTruthy();
    expect(screen.getByText('100 Credits')).toBeTruthy();
  });

  it('handles reward redemption', () => {
    render(
      <CreditRedemption 
        rewards={mockRewards}
        userCredits={200}
        onRedeem={mockOnRedeem}
      />
    );
    
    fireEvent.press(screen.getByText('Redeem'));
    
    expect(mockOnRedeem).toHaveBeenCalledWith({
      rewardId: '1',
      credits: 100
    });
  });

  it('disables redemption when insufficient credits', () => {
    render(
      <CreditRedemption 
        rewards={mockRewards}
        userCredits={50}
        onRedeem={mockOnRedeem}
      />
    );
    
    const redeemButton = screen.getByText('Redeem').parent;
    expect(redeemButton.props.disabled).toBe(true);
  });
}); 