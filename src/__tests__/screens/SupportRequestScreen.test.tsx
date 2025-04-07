import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { AccessibilityInfo, Alert, Platform } from 'react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SupportRequestScreen } from '../../screens/help/SupportRequestScreen';

// Mock the required modules
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'test-image-uri' }],
  }),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
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
    error: '#FF0000',
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

describe('SupportRequestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <ThemeProvider>
        <SupportRequestScreen navigation={mockNavigation} />
      </ThemeProvider>
    );
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    // Check if main elements are rendered
    expect(getByText('Submit Support Request')).toBeTruthy();
    expect(getByPlaceholderText('Enter subject...')).toBeTruthy();
    expect(getByPlaceholderText('Describe your issue...')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Priority')).toBeTruthy();
    expect(getByText('Attachments')).toBeTruthy();
  });

  it('handles category selection with haptic feedback on iOS', async () => {
    Platform.OS = 'ios';
    const { getByText } = renderScreen();

    // Select a category
    fireEvent.press(getByText('Category'));
    fireEvent.press(getByText('Technical Issue'));

    // Check if haptic feedback was triggered
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('handles priority selection with haptic feedback on iOS', async () => {
    Platform.OS = 'ios';
    const { getByText } = renderScreen();

    // Select a priority
    fireEvent.press(getByText('Priority'));
    fireEvent.press(getByText('High'));

    // Check if haptic feedback was triggered
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('handles form input', () => {
    const { getByPlaceholderText } = renderScreen();
    const subjectInput = getByPlaceholderText('Enter subject...');
    const descriptionInput = getByPlaceholderText('Describe your issue...');

    // Enter form data
    fireEvent.changeText(subjectInput, 'Test Subject');
    fireEvent.changeText(descriptionInput, 'Test Description');

    // Check if input values are updated
    expect(subjectInput.props.value).toBe('Test Subject');
    expect(descriptionInput.props.value).toBe('Test Description');
  });

  it('handles attachment addition', async () => {
    const { getByText } = renderScreen();

    // Press add attachment button
    fireEvent.press(getByText('Add Attachment'));

    // Check if image picker was launched
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  it('handles attachment removal', () => {
    const { getByText, getByTestId } = renderScreen();

    // Add an attachment first
    fireEvent.press(getByText('Add Attachment'));

    // Remove the attachment
    fireEvent.press(getByTestId('remove-attachment-0'));

    // Check if attachment was removed
    expect(getByText('No attachments added')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText } = renderScreen();

    // Submit without filling required fields
    fireEvent.press(getByText('Submit Request'));

    // Check if validation alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please fill in all required fields'
    );
  });

  it('handles successful submission', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    // Fill in required fields
    fireEvent.changeText(getByPlaceholderText('Enter subject...'), 'Test Subject');
    fireEvent.changeText(getByPlaceholderText('Describe your issue...'), 'Test Description');
    fireEvent.press(getByText('Category'));
    fireEvent.press(getByText('Technical Issue'));

    // Submit the form
    fireEvent.press(getByText('Submit Request'));

    // Check if success alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Your support request has been submitted successfully'
      );
    });
  });

  it('handles submission error', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    // Mock a failed submission
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    // Fill in required fields
    fireEvent.changeText(getByPlaceholderText('Enter subject...'), 'Test Subject');
    fireEvent.changeText(getByPlaceholderText('Describe your issue...'), 'Test Description');
    fireEvent.press(getByText('Category'));
    fireEvent.press(getByText('Technical Issue'));

    // Submit the form
    fireEvent.press(getByText('Submit Request'));

    // Check if error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to submit support request. Please try again.'
      );
    });
  });

  it('applies theme colors correctly', () => {
    const { getByText } = renderScreen();

    // Check if theme colors are applied
    const title = getByText('Submit Support Request');
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
    expect(getByLabelText('Subject input field')).toBeTruthy();
    expect(getByLabelText('Description input field')).toBeTruthy();
    expect(getByLabelText('Category selection button')).toBeTruthy();
    expect(getByLabelText('Priority selection button')).toBeTruthy();
    expect(getByLabelText('Add attachment button')).toBeTruthy();
    expect(getByLabelText('Submit request button')).toBeTruthy();
  });

  it('handles platform-specific optimizations', () => {
    // Test iOS
    Platform.OS = 'ios';
    const { rerender } = renderScreen();
    
    // Test Android
    Platform.OS = 'android';
    rerender(
      <ThemeProvider>
        <SupportRequestScreen navigation={mockNavigation} />
      </ThemeProvider>
    );
    
    // Test Web
    Platform.OS = 'web';
    rerender(
      <ThemeProvider>
        <SupportRequestScreen navigation={mockNavigation} />
      </ThemeProvider>
    );
  });
}); 