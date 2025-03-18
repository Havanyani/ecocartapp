import { CollectionHistoryScreen } from '@/screens/CollectionHistoryScreen';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock components
jest.mock('@/components/WeightTracker', () => ({
  WeightTracker: () => null
}));

describe('CollectionHistoryScreen', () => {
  it('renders correctly', () => {
    const { getByTestId, getByText } = render(<CollectionHistoryScreen />);
    
    expect(getByTestId('collection-history-list')).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('Pending')).toBeTruthy();
  });

  it('filters collections correctly', () => {
    const { getByText, queryByText } = render(<CollectionHistoryScreen />);
    
    // Click completed filter
    fireEvent.press(getByText('Completed'));
    expect(getByText('2.5kg collected')).toBeTruthy();
    
    // Click pending filter
    fireEvent.press(getByText('Pending'));
    expect(queryByText('2.5kg collected')).toBeNull();
  });

  it('displays environmental impact for completed collections', () => {
    const { getByText } = render(<CollectionHistoryScreen />);
    
    expect(getByText('Environmental Impact:')).toBeTruthy();
    expect(getByText('0.3')).toBeTruthy(); // Trees
    expect(getByText('62')).toBeTruthy(); // Bottles
    expect(getByText('42.5L')).toBeTruthy(); // Water
  });

  it('shows empty state when no collections match filter', () => {
    const { getByText } = render(<CollectionHistoryScreen />);
    
    // Click pending filter (which has no items in test data)
    fireEvent.press(getByText('Pending'));
    expect(getByText('No collections found')).toBeTruthy();
  });

  it('handles date formatting correctly', () => {
    const { getByText } = render(<CollectionHistoryScreen />);
    
    // Check if date is formatted correctly
    expect(getByText('Mar 15')).toBeTruthy();
  });
}); 