import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { UserProfile } from '../../../src/components/account/UserProfile';

const mockUserData = {
  name: 'Jane Smith',
  totalCollections: 25,
  totalCredits: 125.50,
  joinDate: '2024-01-01',
  impactLevel: 'EcoChampion',
  preferences: {
    notifications: true,
    weeklyGoal: 10
  }
};

describe('UserProfile', () => {
  it('displays user information correctly', () => {
    render(<UserProfile userData={mockUserData} />);
    
    expect(screen.getByText('Jane Smith')).toBeTruthy();
    expect(screen.getByText('125.50 Credits')).toBeTruthy();
    expect(screen.getByText('EcoChampion')).toBeTruthy();
  });

  it('shows collection statistics', () => {
    render(<UserProfile userData={mockUserData} />);
    
    expect(screen.getByText('25')).toBeTruthy();
    expect(screen.getByText('Total Collections')).toBeTruthy();
  });
}); 