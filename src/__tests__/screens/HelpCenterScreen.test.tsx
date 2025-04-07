import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { HelpCenterScreen } from '../../screens/help/HelpCenterScreen';

// Mock the required modules
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

// Mock AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
      addEventListener: jest.fn().mockReturnValue({
        remove: jest.fn(),
      }),
    },
  };
});

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock theme context
const mockTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#4CAF50',
    card: '#F5F5F5',
    border: '#E0E0E0',
    placeholder: '#9E9E9E',
  },
};

const mockThemeContext = {
  theme: mockTheme,
  toggleTheme: jest.fn(),
};

// Mock ThemeContext.Provider
jest.mock('../../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => mockThemeContext,
}));

describe('HelpCenterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <ThemeProvider>
        <HelpCenterScreen navigation={mockNavigation} />
      </ThemeProvider>
    );
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    // Check if main elements are rendered
    expect(getByText('Help Center')).toBeTruthy();
    expect(getByText('Find answers to common questions and get support')).toBeTruthy();
    expect(getByPlaceholderText('Search for help...')).toBeTruthy();
    expect(getByText('Help Categories')).toBeTruthy();
    expect(getByText('Frequently Asked Questions')).toBeTruthy();
    expect(getByText('Need more help?')).toBeTruthy();
  });

  it('displays all help categories', () => {
    const { getByText } = renderScreen();

    // Check if all category titles are displayed
    expect(getByText('Getting Started')).toBeTruthy();
    expect(getByText('Plastic Collection')).toBeTruthy();
    expect(getByText('Eco Credits')).toBeTruthy();
    expect(getByText('Account & Settings')).toBeTruthy();
    expect(getByText('Troubleshooting')).toBeTruthy();
  });

  it('handles category selection with haptic feedback on iOS', async () => {
    Platform.OS = 'ios';
    const { getByText } = renderScreen();

    // Select a category
    fireEvent.press(getByText('Getting Started'));

    // Check if haptic feedback was triggered
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('handles search input', () => {
    const { getByPlaceholderText } = renderScreen();
    const searchInput = getByPlaceholderText('Search for help...');

    // Enter search query
    fireEvent.changeText(searchInput, 'collection');

    // Check if input value is updated
    expect(searchInput.props.value).toBe('collection');
  });

  it('navigates to support request screen', () => {
    const { getByText } = renderScreen();

    // Press contact support button
    fireEvent.press(getByText('Contact Support'));

    // Check if navigation was triggered
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SupportRequest');
  });

  it('displays platform-specific FAQs', () => {
    Platform.OS = 'ios';
    const { getByText } = renderScreen();

    // Check if iOS-specific FAQ is displayed
    expect(getByText('How do I enable notifications on iOS?')).toBeTruthy();
    expect(getByText('How do I use Face ID with EcoCart?')).toBeTruthy();
    expect(getByText('How do I add EcoCart to my Apple Wallet?')).toBeTruthy();
  });

  it('handles external link opening', async () => {
    const { getByText } = renderScreen();

    // Press a category that has an external link
    fireEvent.press(getByText('Getting Started'));

    // Check if external link was opened
    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('/help/')
      );
    });
  });

  it('applies theme colors correctly', () => {
    const { getByText } = renderScreen();

    // Check if theme colors are applied
    const title = getByText('Help Center');
    expect(title.props.style).toMatchObject({
      color: mockTheme.colors.text,
    });
  });

  it('handles keyboard avoiding behavior', () => {
    const { getByTestId } = renderScreen();

    // Check if KeyboardAvoidingView is rendered with correct behavior
    const keyboardAvoidingView = getByTestId('keyboard-avoiding-view');
    expect(keyboardAvoidingView.props.behavior).toBe(
      Platform.OS === 'ios' ? 'padding' : 'height'
    );
  });

  it('checks for screen reader status', async () => {
    renderScreen();

    // Check if AccessibilityInfo.isScreenReaderEnabled was called
    expect(AccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalled();
    
    // Check if event listener was added
    expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith(
      'screenReaderChanged',
      expect.any(Function)
    );
  });

  it('provides accessibility labels for interactive elements', () => {
    const { getByLabelText } = renderScreen();

    // Check if accessibility labels are provided
    expect(getByLabelText('Search help articles')).toBeTruthy();
    expect(getByLabelText('Contact support button')).toBeTruthy();
  });

  it('handles platform-specific optimizations', () => {
    // Test iOS
    Platform.OS = 'ios';
    const { rerender } = renderScreen();
    
    // Test Android
    Platform.OS = 'android';
    rerender(
      <ThemeProvider>
        <HelpCenterScreen navigation={mockNavigation} />
      </ThemeProvider>
    );
    
    // Test Web
    Platform.OS = 'web';
    rerender(
      <ThemeProvider>
        <HelpCenterScreen navigation={mockNavigation} />
      </ThemeProvider>
    );
  });
}); 