import { HapticTab } from '@components/ui/HapticTab';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text } from 'react-native';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 1,
    Medium: 2,
    Heavy: 3
  },
  selectionAsync: jest.fn()
}));

describe('HapticTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <HapticTab>
        <Text>Test Content</Text>
      </HapticTab>
    );
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('triggers haptic feedback on press', async () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HapticTab testID="haptic-button" onPress={onPress} />
    );

    await fireEvent.press(getByTestId('haptic-button'));
    
    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalled();
  });

  it('uses correct feedback style', async () => {
    const { getByTestId } = render(
      <HapticTab testID="haptic-button" feedback="medium" />
    );

    await fireEvent.press(getByTestId('haptic-button'));
    
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    );
  });

  it('supports accessibility features', async () => {
    const { getByTestId } = render(
      <HapticTab
        testID="haptic-button"
        accessible={true}
        accessibilityLabel="Test button"
        accessibilityHint="Triggers haptic feedback"
      >
        <Text>Test Content</Text>
      </HapticTab>
    );

    const button = getByTestId('haptic-button');
    expect(button.props.accessible).toBe(true);
    expect(button.props.accessibilityLabel).toBe('Test button');
    expect(button.props.accessibilityHint).toBe('Triggers haptic feedback');
  });

  it('applies theme styles correctly', () => {
    const { getByTestId } = render(
      <HapticTab testID="haptic-button" variant="primary" />
    );
    
    const button = getByTestId('haptic-button');
    expect(button.props.style).toMatchObject({
      backgroundColor: expect.any(String),
      borderRadius: expect.any(Number),
      padding: expect.any(Number)
    });
  });

  it('applies pressed state styles', async () => {
    const { getByTestId } = render(
      <HapticTab testID="haptic-button" variant="primary" />
    );
    
    const button = getByTestId('haptic-button');
    await fireEvent.press(button);
    
    expect(button.props.style).toMatchObject({
      opacity: expect.any(Number)
    });
  });
}); 