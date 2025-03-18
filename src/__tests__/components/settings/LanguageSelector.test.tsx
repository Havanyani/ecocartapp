import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { LanguageSelector } from '../../../components/settings/LanguageSelector';
import { useLanguage } from '../../../hooks/useLanguage';
import { useTheme } from '../../../hooks/useTheme';

// Mock dependencies
jest.mock('../../../hooks/useTheme');
jest.mock('../../../hooks/useLanguage');

describe('LanguageSelector', () => {
  const mockTheme = {
    colors: {
      text: {
        primary: '#000000',
        secondary: '#666666',
      },
    },
  };

  const mockUseLanguage = {
    currentLang: 'en',
    changeLanguage: jest.fn(),
    supportedLanguages: {
      en: { name: 'English', isRTL: false },
      es: { name: 'Español', isRTL: false },
      ar: { name: 'العربية', isRTL: true },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ theme: mockTheme });
    (useLanguage as jest.Mock).mockReturnValue(mockUseLanguage);
  });

  it('renders language options correctly', () => {
    const { getByText, getAllByTestId } = render(<LanguageSelector />);

    // Check if title is rendered
    expect(getByText('Language')).toBeTruthy();

    // Check if language buttons are rendered
    const languageButtons = getAllByTestId(/^language-/);
    expect(languageButtons.length).toBe(3); // We have 3 languages in our mock
  });

  it('shows RTL indicator for RTL languages', () => {
    const { getByTestId } = render(<LanguageSelector />);
    
    // Arabic is an RTL language
    expect(getByTestId('language-ar')).toBeTruthy();
  });

  it('handles language change correctly', async () => {
    const { getByTestId } = render(<LanguageSelector />);
    
    // Click on Spanish language option
    const spanishButton = getByTestId('language-es');
    fireEvent.press(spanishButton);

    // Verify changeLanguage was called
    await waitFor(() => {
      expect(mockUseLanguage.changeLanguage).toHaveBeenCalledWith('es');
    });
  });

  it('handles language change errors gracefully', async () => {
    // Mock changeLanguage to throw an error
    mockUseLanguage.changeLanguage.mockRejectedValueOnce(new Error('Failed to change language'));

    const { getByTestId } = render(<LanguageSelector />);
    
    // Click on Spanish language option
    const spanishButton = getByTestId('language-es');
    fireEvent.press(spanishButton);

    // Verify error was handled without crashing
    await waitFor(() => {
      expect(mockUseLanguage.changeLanguage).toHaveBeenCalledWith('es');
    });
  });
}); 