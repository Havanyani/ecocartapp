import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { PackagingPreferences } from './PackagingPreferences';

describe('PackagingPreferences', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows selecting eco-friendly packaging options', () => {
    render(<PackagingPreferences onSave={mockOnSave} />);
    
    fireEvent.press(screen.getByText('Paper Bags'));
    fireEvent.press(screen.getByText('Save Preferences'));

    expect(mockOnSave).toHaveBeenCalledWith({
      preferredPackaging: 'paper',
      minimizePackaging: true
    });
  });

  it('displays packaging impact information', () => {
    render(<PackagingPreferences onSave={mockOnSave} />);
    
    expect(screen.getByText('Environmental Impact')).toBeTruthy();
    expect(screen.getByText('Reduces plastic waste by 75%')).toBeTruthy();
  });
}); 