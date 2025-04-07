import { useTheme } from '@/theme';
import i18n from '@/utils/i18n';
import { render } from '@testing-library/react-native';
import React from 'react';
import SettingsLayout from '../../../../app/settings/_layout';

// Mock hooks and navigation
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ name, options }: { name: string; options: any }) => (
      <div data-testid={`screen-${name}`} data-options={JSON.stringify(options)} />
    )
  }
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

describe('SettingsLayout Integration', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders all screen routes', () => {
    const { getAllByTestId } = render(<SettingsLayout />);
    
    const expectedScreens = [
      'index',
      'translations',
      'notifications',
      'schedule',
      'reminders',
      'profile',
      'environmental',
      'credits'
    ];

    expectedScreens.forEach(screen => {
      expect(getAllByTestId(`screen-${screen}`)).toBeTruthy();
    });
  });

  it('applies consistent header styling', () => {
    const { getAllByTestId } = render(<SettingsLayout />);
    
    getAllByTestId(/^screen-/).forEach(screen => {
      const options = JSON.parse(screen.getAttribute('data-options') || '{}');
      expect(options.headerStyle).toEqual({
        backgroundColor: mockTheme.colors.background
      });
      expect(options.headerShadowVisible).toBe(false);
    });
  });

  it('uses correct translations for titles', () => {
    const { getByTestId } = render(<SettingsLayout />);
    
    const screens = [
      { name: 'index', key: 'settings.title' },
      { name: 'translations', key: 'settings.language' },
      { name: 'notifications', key: 'settings.notifications' },
      { name: 'schedule', key: 'settings.schedule' },
      { name: 'reminders', key: 'settings.reminders' },
      { name: 'profile', key: 'settings.profile' },
      { name: 'environmental', key: 'settings.environmental' },
      { name: 'credits', key: 'settings.credits' }
    ];

    screens.forEach(({ name, key }) => {
      const screen = getByTestId(`screen-${name}`);
      const options = JSON.parse(screen.getAttribute('data-options') || '{}');
      expect(options.title).toBe(i18n.t(key));
    });
  });

  it('handles language switching for all screens', () => {
    const languages = ['en', 'es', 'fr', 'de', 'zh', 'af'];
    
    languages.forEach(lang => {
      i18n.locale = lang;
      const { getAllByTestId } = render(<SettingsLayout />);
      
      getAllByTestId(/^screen-/).forEach(screen => {
        const options = JSON.parse(screen.getAttribute('data-options') || '{}');
        expect(options.title).toBeTruthy();
      });
    });
  });

  it('applies theme colors consistently', () => {
    const { getAllByTestId } = render(<SettingsLayout />);
    
    getAllByTestId(/^screen-/).forEach(screen => {
      const options = JSON.parse(screen.getAttribute('data-options') || '{}');
      expect(options.headerTintColor).toBe(mockTheme.colors.text.primary);
    });
  });
}); 