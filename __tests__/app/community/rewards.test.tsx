import { ThemeProvider } from '@/theme/ThemeProvider';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import RewardsScreen from '../../../app/community/rewards';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('RewardsScreen', () => {
  it('renders correctly', () => {
    const { getByText, getAllByText } = render(
      <ThemeProvider>
        <RewardsScreen />
      </ThemeProvider>
    );

    // Check if main elements are rendered
    expect(getByText('Rewards')).toBeTruthy();
    expect(getByText('Your EcoPoints')).toBeTruthy();
    expect(getByText('720')).toBeTruthy(); // Default points value
    expect(getByText('Earn More')).toBeTruthy();
    
    // Check if categories are rendered
    expect(getByText('All Rewards')).toBeTruthy();
    expect(getByText('Discounts')).toBeTruthy();
    expect(getByText('Donations')).toBeTruthy();
    expect(getByText('Merchandise')).toBeTruthy();
    expect(getByText('Experiences')).toBeTruthy();
    
    // Check if rewards are rendered
    expect(getByText('10% Off at EcoStore')).toBeTruthy();
    expect(getByText('Plant a Tree')).toBeTruthy();
    expect(getAllByText('Redeem').length).toBeGreaterThan(0);
  });

  it('filters rewards by category', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <RewardsScreen />
      </ThemeProvider>
    );

    // Initially all rewards should be visible
    expect(getByText('10% Off at EcoStore')).toBeTruthy();
    expect(getByText('Plant a Tree')).toBeTruthy();
    
    // Filter by Donations category
    fireEvent.press(getByText('Donations'));
    
    // Now only donation rewards should be visible
    await waitFor(() => {
      expect(getByText('Plant a Tree')).toBeTruthy();
      expect(getByText('Clean Ocean Donation')).toBeTruthy();
      expect(queryByText('10% Off at EcoStore')).toBeNull();
    });
  });

  it('shows alert when trying to redeem a reward', () => {
    const { getAllByText } = render(
      <ThemeProvider>
        <RewardsScreen />
      </ThemeProvider>
    );

    // Find a "Redeem" button and press it
    const redeemButtons = getAllByText('Redeem');
    fireEvent.press(redeemButtons[0]);
    
    // Check if Alert.alert was called
    expect(Alert.alert).toHaveBeenCalledWith(
      'Redeem Reward',
      expect.stringContaining('Are you sure you want to redeem'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Redeem' })
      ])
    );
  });
}); 