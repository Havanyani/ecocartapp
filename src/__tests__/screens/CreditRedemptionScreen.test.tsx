import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert } from 'react-native';
import { CreditsProvider } from '../../contexts/CreditsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { CreditRedemptionScreen } from '../../screens/credits/CreditRedemptionScreen';

// Mock the navigation prop
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock Haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('CreditRedemptionScreen', () => {
  const renderScreen = () => {
    return render(
      <ThemeProvider>
        <CreditsProvider>
          <CreditRedemptionScreen navigation={mockNavigation} />
        </CreditsProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    const { getByText, getByPlaceholderText } = renderScreen();
    
    expect(getByText('Redeem Credits')).toBeTruthy();
    expect(getByText('Available Credits: 0')).toBeTruthy();
    expect(getByText('Select Store')).toBeTruthy();
    expect(getByPlaceholderText('Enter amount to redeem')).toBeTruthy();
  });

  it('shows error when trying to redeem without selecting a store', async () => {
    const { getByText } = renderScreen();
    
    fireEvent.press(getByText('Redeem Credits'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a store');
  });

  it('shows error when trying to redeem with invalid amount', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();
    
    // Select a store
    fireEvent.press(getByText('Checkers Sixty60'));
    
    // Enter invalid amount
    fireEvent.changeText(getByPlaceholderText('Enter amount to redeem'), '-10');
    
    fireEvent.press(getByText('Redeem Credits'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid amount');
  });

  it('shows error when trying to redeem more credits than available', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();
    
    // Select a store
    fireEvent.press(getByText('Checkers Sixty60'));
    
    // Enter amount greater than available credits
    fireEvent.changeText(getByPlaceholderText('Enter amount to redeem'), '100');
    
    fireEvent.press(getByText('Redeem Credits'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Insufficient credits');
  });

  it('successfully redeems credits', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();
    
    // Select a store
    fireEvent.press(getByText('Checkers Sixty60'));
    
    // Enter valid amount
    fireEvent.changeText(getByPlaceholderText('Enter amount to redeem'), '10');
    
    fireEvent.press(getByText('Redeem Credits'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Credits redeemed successfully');
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('triggers haptic feedback on iOS when selecting store', () => {
    const { getByText } = renderScreen();
    
    fireEvent.press(getByText('Checkers Sixty60'));
    
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('triggers haptic feedback on iOS for successful redemption', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();
    
    // Select a store
    fireEvent.press(getByText('Checkers Sixty60'));
    
    // Enter valid amount
    fireEvent.changeText(getByPlaceholderText('Enter amount to redeem'), '10');
    
    fireEvent.press(getByText('Redeem Credits'));
    
    await waitFor(() => {
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });
  });
}); 