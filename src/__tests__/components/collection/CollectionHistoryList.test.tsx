import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { CollectionHistoryList } from '../../../src/components/collection/CollectionHistoryList';

const mockHistory = [
  {
    id: '1',
    date: '2024-01-15',
    weight: 5.5,
    credits: 2.75,
    status: 'completed',
    deliveryId: 'DEL-123'
  },
  {
    id: '2',
    date: '2024-01-22',
    weight: 3.2,
    credits: 1.60,
    status: 'completed',
    deliveryId: 'DEL-124'
  }
];

describe('CollectionHistoryList', () => {
  it('renders collection history items', () => {
    render(<CollectionHistoryList history={mockHistory} />);
    
    expect(screen.getByText('5.5 kg')).toBeTruthy();
    expect(screen.getByText('2.75 credits')).toBeTruthy();
  });

  it('formats dates correctly', () => {
    render(<CollectionHistoryList history={mockHistory} />);
    
    expect(screen.getByText('Jan 15, 2024')).toBeTruthy();
  });
}); 