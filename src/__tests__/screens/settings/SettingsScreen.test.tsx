import { useTheme } from '@/theme';
import i18n from '@/utils/i18n';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SettingsScreen from '../../../../app/settings';

// Mock hooks and navigation
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

jest.mock('expo-router', () => ({
  Link: jest.fn(({ href, children }) => (
    <button testID={`link-${href}`} onClick={() => {}}>{children}</button>
  ))
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

describe('SettingsScreen Integration', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders all settings sections', () => {
    const { getByText } = render(<SettingsScreen />);
    
    // Check section headers
    expect(getByText(i18n.t('settings.preferences'))).toBeTruthy();
    expect(getByText(i18n.t('settings.collection'))).toBeTruthy();
    expect(getByText(i18n.t('settings.account'))).toBeTruthy();
  });

  it('renders all navigation items with correct icons', () => {
    const { getAllByTestId } = render(<SettingsScreen />);
    
    const expectedRoutes = [
      '/settings/translations',
      '/settings/notifications',
      '/settings/schedule',
      '/settings/reminders',
      '/settings/profile',
      '/settings/environmental',
      '/settings/credits'
    ];

    expectedRoutes.forEach(route => {
      expect(getAllByTestId(`link-${route}`)).toBeTruthy();
    });
  });

  it('applies theme styles consistently', () => {
    const { getByTestId } = render(<SettingsScreen />);
    
    const container = getByTestId('settings-container');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: mockTheme.colors.background
      })
    );
  });

  it('handles language switching', () => {
    const { getByText } = render(<SettingsScreen />);
    
    // Test with different languages
    const languages = ['en', 'es', 'fr', 'de', 'zh', 'af'];
    languages.forEach(lang => {
      i18n.locale = lang;
      expect(getByText(i18n.t('settings.preferences'))).toBeTruthy();
    });
  });

  it('maintains scroll position on re-render', () => {
    const { getByTestId } = render(<SettingsScreen />);
    
    const scrollView = getByTestId('settings-scroll');
    const scrollEvent = {
      nativeEvent: {
        contentOffset: {
          y: 100
        }
      }
    };

    fireEvent.scroll(scrollView, scrollEvent);
    expect(scrollView.props.contentOffset?.y).toBe(100);
  });
}); 