import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { CollectionReminder } from '../../../src/components/notifications/CollectionReminder';

const mockReminder = {
  date: '2024-01-25',
  time: '14:00',
  address: '123 Main St',
  estimatedWeight: 5.5,
  estimatedCredits: 2.75
};

describe('CollectionReminder', () => {
  it('renders collection reminder details', () => {
    render(<CollectionReminder reminder={mockReminder} />);
    
    expect(screen.getByText('Jan 25, 2024')).toBeTruthy();
    expect(screen.getByText('14:00')).toBeTruthy();
    expect(screen.getByText('123 Main St')).toBeTruthy();
  });

  it('shows estimated credits', () => {
    render(<CollectionReminder reminder={mockReminder} />);
    
    expect(screen.getByText('Estimated Credits: 2.75')).toBeTruthy();
  });
}); 