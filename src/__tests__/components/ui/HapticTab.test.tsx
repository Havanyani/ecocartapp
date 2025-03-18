import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text } from 'react-native';
import { HapticTab } from '../../../components/ui/HapticTab';
import { useTheme } from '../../../hooks/useTheme';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

describe('HapticTab', () => {
  const mockOnPress = jest.fn();
  const mockTheme = {
    colors: {
      primary: '#2e7d32',
      text: '#ffffff',
      background: '#ffffff'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <HapticTab onPress={mockOnPress}>
        <Text>Test Button</Text>
      </HapticTab>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('triggers haptic feedback on press', async () => {
    const { getByRole } = render(
      <HapticTab onPress={mockOnPress}>
        <Text>Test Button</Text>
      </HapticTab>
    );

    fireEvent.press(getByRole('button'));

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('applies theme styles', () => {
    const { getByTestId } = render(
      <HapticTab onPress={mockOnPress}>
        <Text>Test Button</Text>
      </HapticTab>
    );

    const button = getByTestId('haptic-tab');
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.colors.primary,
      padding: 16,
      borderRadius: 8
    });
  });

  it('handles custom styles', () => {
    const customStyle = {
      backgroundColor: '#ff0000',
      padding: 24
    };

    const { getByTestId } = render(
      <HapticTab onPress={mockOnPress} style={customStyle}>
        <Text>Test Button</Text>
      </HapticTab>
    );

    const button = getByTestId('haptic-tab');
    expect(button).toHaveStyle(customStyle);
  });

  it('provides accessibility features', () => {
    const { getByRole } = render(
      <HapticTab 
        onPress={mockOnPress}
        accessibilityLabel="Test button"
        accessibilityHint="Performs test action"
      >
        <Text>Test Button</Text>
      </HapticTab>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Test button');
    expect(button.props.accessibilityHint).toBe('Performs test action');
  });
}); 