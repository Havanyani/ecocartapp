import { PaymentMethod } from '@/services/PaymentService';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    addPaymentMethod,
    clearError,
    confirmPayment,
    createPaymentIntent,
    fetchCreditBalance,
    fetchPaymentHistory,
    fetchPaymentMethods,
    redeemCredits,
    removePaymentMethod,
    setDefaultPaymentMethod,
} from '@/store/slices/paymentSlice';
import { useCallback } from 'react';

export function usePayment() {
  const dispatch = useAppDispatch();
  const {
    paymentMethods,
    creditBalance,
    paymentHistory,
    isLoading,
    error,
  } = useAppSelector((state) => state.payment);

  const loadPaymentMethods = useCallback(async () => {
    await dispatch(fetchPaymentMethods());
  }, [dispatch]);

  const loadCreditBalance = useCallback(async () => {
    await dispatch(fetchCreditBalance());
  }, [dispatch]);

  const loadPaymentHistory = useCallback(async () => {
    await dispatch(fetchPaymentHistory());
  }, [dispatch]);

  const handleAddPaymentMethod = useCallback(
    async (paymentMethodData: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
      await dispatch(addPaymentMethod(paymentMethodData));
    },
    [dispatch]
  );

  const handleRemovePaymentMethod = useCallback(
    async (id: string) => {
      await dispatch(removePaymentMethod(id));
    },
    [dispatch]
  );

  const handleSetDefaultPaymentMethod = useCallback(
    async (id: string) => {
      await dispatch(setDefaultPaymentMethod(id));
    },
    [dispatch]
  );

  const handleRedeemCredits = useCallback(
    async (amount: number) => {
      await dispatch(redeemCredits(amount));
    },
    [dispatch]
  );

  const handleCreatePaymentIntent = useCallback(
    async (amount: number, currency: string = 'USD') => {
      await dispatch(createPaymentIntent({ amount, currency }));
    },
    [dispatch]
  );

  const handleConfirmPayment = useCallback(
    async (paymentIntentId: string, paymentMethodId: string) => {
      await dispatch(confirmPayment({ paymentIntentId, paymentMethodId }));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    paymentMethods,
    creditBalance,
    paymentHistory,
    isLoading,
    error,
    loadPaymentMethods,
    loadCreditBalance,
    loadPaymentHistory,
    addPaymentMethod: handleAddPaymentMethod,
    removePaymentMethod: handleRemovePaymentMethod,
    setDefaultPaymentMethod: handleSetDefaultPaymentMethod,
    redeemCredits: handleRedeemCredits,
    createPaymentIntent: handleCreatePaymentIntent,
    confirmPayment: handleConfirmPayment,
    clearError: handleClearError,
  };
} 