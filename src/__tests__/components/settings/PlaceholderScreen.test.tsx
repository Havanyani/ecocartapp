import { Ionicons } from '@expo/vector-icons';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { PlaceholderScreen } from '../../../../app/settings/components/PlaceholderScreen';

// Mock dependencies
jest.mock('@/components/ui/ThemedText', () => ({
  ThemedText: ({ children, style, testID }: any) => React.createElement(Text, { style, testID }, children)
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, style, testID }: any) => React.createElement('View', { style, testID }, children)
}));

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    text: { primary: '#000000', secondary: '#666666' }
  }
};

// Mock dependencies
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: mockTheme
  }))
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.FadeIn = { duration: () => ({ duration: 500 }) };
  return Reanimated;
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: {
    glyphMap: {
      'calendar-outline': '',
      'notifications-outline': '',
    }
  }
}));

describe('PlaceholderScreen Component', () => {
  const defaultProps = {
    title: 'Test Title',
    icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
    description: 'Test Description'
  };

  it('renders all required elements', () => {
    const { getByText, getByTestId } = render(
      <PlaceholderScreen {...defaultProps} />
    );

    expect(getByText(defaultProps.title)).toBeTruthy();
    expect(getByText(defaultProps.description)).toBeTruthy();
    expect(getByTestId('placeholder-icon')).toBeTruthy();
  });

  it('renders title correctly', () => {
    const { getByText } = render(
      <PlaceholderScreen
        title="Test Title"
        icon="settings-outline"
        description="Test description"
      />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders description correctly', () => {
    const { getByText } = render(
      <PlaceholderScreen
        title="Test Title"
        icon="settings-outline"
        description="Test description"
      />
    );
    
    expect(getByText('Test description')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByText } = render(
      <PlaceholderScreen
        title="Test Title"
        icon="settings-outline"
        description="Test description"
      />
    );
    
    const container = getByText('Test Title').parent?.parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: mockTheme.colors.background
      })
    );
  });

  it('renders icon with correct size', () => {
    const { UNSAFE_getByProps } = render(
      <PlaceholderScreen
        title="Test Title"
        icon="settings-outline"
        description="Test description"
      />
    );
    
    const icon = UNSAFE_getByProps({ size: 64 });
    expect(icon).toBeTruthy();
    expect(icon.props.name).toBe('settings-outline');
  });
}); 