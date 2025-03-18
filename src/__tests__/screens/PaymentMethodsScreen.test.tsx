import { useCredits } from '@/hooks/useCredits';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { PaymentMethodsScreen } from '@/screens/PaymentMethodsScreen';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

// Mock hooks
jest.mock('@/hooks/usePaymentMethods', () => ({
  usePaymentMethods: jest.fn()
}));

jest.mock('@/hooks/useCredits', () => ({
  useCredits: jest.fn()
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit_card',
    last4: '4242',
    expiryDate: '12/24',
    isDefault: true
  },
  {
    id: '2',
    type: 'bank_account',
    last4: '1234',
    bankName: 'Test Bank',
    accountType: 'checking',
    isDefault: false
  }
];

const mockCredits = {
  available: 100,
  pending: 25,
  lifetimeEarned: 500
};

describe('PaymentMethodsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePaymentMethods as jest.Mock).mockReturnValue({
      paymentMethods: mockPaymentMethods,
      isLoading: false,
      error: null,
      addPaymentMethod: jest.fn(),
      removePaymentMethod: jest.fn(),
      setDefaultPaymentMethod: jest.fn()
    });
    (useCredits as jest.Mock).mockReturnValue({
      credits: mockCredits,
      redeemCredits: jest.fn()
    });
  });

  it('renders payment methods correctly', () => {
    const { getByText, getAllByTestId } = render(<PaymentMethodsScreen />);

    expect(getByText('•••• 4242')).toBeTruthy();
    expect(getByText('Test Bank')).toBeTruthy();
    expect(getByText('Expires 12/24')).toBeTruthy();
  });

  it('displays credit information correctly', () => {
    const { getByText } = render(<PaymentMethodsScreen />);

    expect(getByText('100')).toBeTruthy(); // Available credits
    expect(getByText('25')).toBeTruthy(); // Pending credits
    expect(getByText('500')).toBeTruthy(); // Lifetime earned
  });

  it('handles adding new payment method', async () => {
    const mockAddPaymentMethod = jest.fn();
    (usePaymentMethods as jest.Mock).mockReturnValue({
      ...usePaymentMethods(),
      addPaymentMethod: mockAddPaymentMethod
    });

    const { getByTestId } = render(<PaymentMethodsScreen />);
    fireEvent.press(getByTestId('add-payment-button'));

    expect(mockAddPaymentMethod).toHaveBeenCalled();
  });

  it('handles removing payment method', async () => {
    const mockRemovePaymentMethod = jest.fn();
    (usePaymentMethods as jest.Mock).mockReturnValue({
      ...usePaymentMethods(),
      removePaymentMethod: mockRemovePaymentMethod
    });

    const { getByTestId } = render(<PaymentMethodsScreen />);
    fireEvent.press(getByTestId('remove-payment-1'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      expect.any(Array)
    );
  });
}); 