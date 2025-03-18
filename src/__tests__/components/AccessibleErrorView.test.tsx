import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { AccessibleErrorView } from '../../components/AccessibleErrorView';
import { useTheme } from '../../hooks/useTheme';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
  isScreenReaderEnabled: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

describe('AccessibleErrorView', () => {
  const mockError = new Error('Test error message');
  const mockOnReset = jest.fn();
  const mockTheme = {
    isDark: false,
    colors: {
      error: '#d32f2f',
      text: '#000000',
      background: '#ffffff'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('displays error message', () => {
    const { getByText } = render(
      <AccessibleErrorView 
        error={mockError}
        onReset={mockOnReset}
      />
    );

    expect(getByText('Test error message')).toBeTruthy();
  });

  it('announces error to screen reader', () => {
    render(
      <AccessibleErrorView 
        error={mockError}
        onReset={mockOnReset}
      />
    );

    expect(AccessibilityInfo.announceForAccessibility)
      .toHaveBeenCalledWith('Error: Test error message');
  });

  it('handles reset action with haptic feedback', async () => {
    const { getByText } = render(
      <AccessibleErrorView 
        error={mockError}
        onReset={mockOnReset}
      />
    );

    fireEvent.press(getByText('Try Again'));

    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('provides accessible error information', () => {
    const { getByRole } = render(
      <AccessibleErrorView 
        error={mockError}
        onReset={mockOnReset}
      />
    );

    const errorMessage = getByRole('alert');
    expect(errorMessage).toHaveAccessibilityLabel(
      expect.stringContaining('Error occurred')
    );
  });

  it('applies error styling', () => {
    const { getByTestId } = render(
      <AccessibleErrorView 
        error={mockError}
        onReset={mockOnReset}
      />
    );

    const container = getByTestId('error-container');
    expect(container).toHaveStyle({
      backgroundColor: mockTheme.colors.background,
      padding: 16
    });
  });

  it('handles missing error gracefully', () => {
    const { getByText } = render(
      <AccessibleErrorView 
        onReset={mockOnReset}
      />
    );

    expect(getByText('An unknown error occurred')).toBeTruthy();
  });

  it('provides accessible reset button', () => {
    const { getByRole } = render(
      <AccessibleErrorView 
        error={mockError}
        onReset={mockOnReset}
      />
    );

    const resetButton = getByRole('button', { name: 'Try Again' });
    expect(resetButton).toHaveAccessibilityHint(
      'Attempts to recover from the error'
    );
  });
}); 