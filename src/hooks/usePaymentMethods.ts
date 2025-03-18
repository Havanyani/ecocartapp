import { useCallback, useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account';
  last4: string;
  expiryDate?: string;
  bankName?: string;
  accountType?: string;
  isDefault: boolean;
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addPaymentMethod = useCallback(async () => {
    // TODO: Implement actual API call
  }, []);

  const removePaymentMethod = useCallback(async (id: string) => {
    // TODO: Implement actual API call
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    // TODO: Implement actual API call
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  }, []);

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
} 