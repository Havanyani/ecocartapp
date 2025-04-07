import { SettingsSection } from '@/components/ui/settings/SettingsSection';
import { useTheme } from '@/theme';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

// Mock theme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn()
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

describe('SettingsSection', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders section title correctly', () => {
    const { getByText } = render(
      <SettingsSection title="Test Section">
        <Text>Child content</Text>
      </SettingsSection>
    );
    
    expect(getByText('Test Section')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <SettingsSection title="Test Section">
        <Text>Child content</Text>
      </SettingsSection>
    );
    
    expect(getByText('Child content')).toBeTruthy();
  });

  it('applies correct styles', () => {
    const { getByText } = render(
      <SettingsSection title="Test Section">
        <Text>Child content</Text>
      </SettingsSection>
    );
    
    const title = getByText('Test Section');
    expect(title.props.style).toContainEqual(
      expect.objectContaining({
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase'
      })
    );
  });

  it('applies theme colors correctly', () => {
    const { getByText } = render(
      <SettingsSection title="Test Section">
        <Text>Child content</Text>
      </SettingsSection>
    );
    
    const title = getByText('Test Section');
    expect(title.props.style).toContainEqual(
      expect.objectContaining({
        color: mockTheme.colors.text.secondary
      })
    );
  });
}); 