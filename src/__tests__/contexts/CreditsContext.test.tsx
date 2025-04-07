import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { CreditsProvider, useCredits } from '../../contexts/CreditsContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('CreditsContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CreditsProvider>{children}</CreditsProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
  });

  it('initializes with zero credits', () => {
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    expect(result.current.credits).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads credits from AsyncStorage on getCredits', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('100');
    
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.getCredits();
    });
    
    expect(result.current.credits).toBe(100);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userCredits');
  });

  it('handles error when loading credits', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.getCredits();
    });
    
    expect(result.current.error).toBe('Failed to fetch credits');
  });

  it('adds credits successfully', async () => {
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.addCredits(50);
    });
    
    expect(result.current.credits).toBe(50);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userCredits', '50');
  });

  it('handles error when adding credits', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.addCredits(50);
    });
    
    expect(result.current.error).toBe('Failed to add credits');
  });

  it('redeems credits successfully', async () => {
    // First add some credits
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('100');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
    
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.getCredits();
    });
    
    await act(async () => {
      await result.current.redeemCredits(30, 'Test Store');
    });
    
    expect(result.current.credits).toBe(70);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userCredits', '70');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'redemptionHistory',
      expect.stringContaining('Test Store')
    );
  });

  it('prevents redeeming more credits than available', async () => {
    // First add some credits
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('50');
    
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.getCredits();
    });
    
    await expect(
      result.current.redeemCredits(100, 'Test Store')
    ).rejects.toThrow('Insufficient credits');
    
    expect(result.current.credits).toBe(50);
  });

  it('handles error when redeeming credits', async () => {
    // First add some credits
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('100');
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    
    const { result } = renderHook(() => useCredits(), { wrapper });
    
    await act(async () => {
      await result.current.getCredits();
    });
    
    await expect(
      result.current.redeemCredits(30, 'Test Store')
    ).rejects.toThrow('Failed to redeem credits');
  });
}); 