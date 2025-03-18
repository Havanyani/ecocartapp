import { SettingsItem } from '@/components/ui/settings/SettingsItem';
import { useTheme } from '@/hooks/useTheme';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock theme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children
}));

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    card: '#F8F8F8',
    border: '#E0E0E0',
    text: {
      primary: '#000000',
      secondary: '#666666'
    }
  },
  text: {
    primary: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000000'
    },
    secondary: {
      fontSize: 14,
      fontWeight: '400',
      color: '#666666'
    }
  }
};

describe('SettingsItem', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders correctly with title and icon', () => {
    const { getByText } = render(
      <SettingsItem 
        title="Test Item" 
        icon="settings-outline" 
      />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
  });

  it('handles onPress callback', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SettingsItem 
        title="Test Item" 
        icon="settings-outline" 
        onPress={onPress}
      />
    );
    
    fireEvent.press(getByText('Test Item'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders with href prop', () => {
    const { getByText } = render(
      <SettingsItem 
        title="Test Item" 
        icon="settings-outline" 
        href="/settings/test"
      />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
  });

  it('applies border style when not last item', () => {
    const { getByText } = render(
      <SettingsItem 
        title="Test Item" 
        icon="settings-outline" 
        isLast={false}
      />
    );
    
    const container = getByText('Test Item').parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining({
        borderBottomWidth: expect.any(Number)
      })
    );
  });

  it('does not apply border style when last item', () => {
    const { getByText } = render(
      <SettingsItem 
        title="Test Item" 
        icon="settings-outline" 
        isLast={true}
      />
    );
    
    const container = getByText('Test Item').parent;
    expect(container?.props.style).not.toContainEqual(
      expect.objectContaining({
        borderBottomWidth: expect.any(Number)
      })
    );
  });
}); 