import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface CreditsContextType {
  credits: number;
  isLoading: boolean;
  error: string | null;
  redeemCredits: (amount: number, store: string) => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
  getCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedCredits = await AsyncStorage.getItem('userCredits');
      if (storedCredits) {
        setCredits(parseFloat(storedCredits));
      }
    } catch (err) {
      setError('Failed to fetch credits');
      console.error('Error fetching credits:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCredits = useCallback(async (amount: number) => {
    try {
      setIsLoading(true);
      const newCredits = credits + amount;
      await AsyncStorage.setItem('userCredits', newCredits.toString());
      setCredits(newCredits);
    } catch (err) {
      setError('Failed to add credits');
      console.error('Error adding credits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [credits]);

  const redeemCredits = useCallback(async (amount: number, store: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (amount > credits) {
        throw new Error('Insufficient credits');
      }

      // Here you would typically make an API call to your backend
      // to process the redemption with the store
      // For now, we'll just update the local state
      const newCredits = credits - amount;
      await AsyncStorage.setItem('userCredits', newCredits.toString());
      setCredits(newCredits);

      // Store redemption history
      const redemptionHistory = await AsyncStorage.getItem('redemptionHistory') || '[]';
      const history = JSON.parse(redemptionHistory);
      history.push({
        amount,
        store,
        date: new Date().toISOString(),
      });
      await AsyncStorage.setItem('redemptionHistory', JSON.stringify(history));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem credits');
      console.error('Error redeeming credits:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [credits]);

  const value = {
    credits,
    isLoading,
    error,
    redeemCredits,
    addCredits,
    getCredits,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}; 