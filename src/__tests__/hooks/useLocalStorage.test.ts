/**
 * useLocalStorage.test.ts
 * 
 * Unit tests for the useLocalStorage hook
 */

import { act, renderHook } from '@testing-library/react-hooks';
import useLocalStorage from '../../hooks/useLocalStorage';
import LocalStorageService from '../../services/LocalStorageService';

// Mock LocalStorageService
jest.mock('../../services/LocalStorageService', () => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  registerSchema: jest.fn(),
}));

// Mock PerformanceMonitor
jest.mock('../../utils/PerformanceMonitoring', () => ({
  PerformanceMonitor: {
    captureError: jest.fn()
  }
}));

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful initialization
    (LocalStorageService.initialize as jest.Mock).mockResolvedValue(undefined);
  });

  test('should initialize with default value', async () => {
    const defaultValue = { test: 'value' };
    
    // Mock getItem to return null (no stored value)
    (LocalStorageService.getItem as jest.Mock).mockResolvedValue(null);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey', { defaultValue })
    );
    
    // Initial state should be loading with defaultValue
    expect(result.current.isLoading).toBe(true);
    expect(result.current.value).toEqual(defaultValue);
    
    await waitForNextUpdate();
    
    // After loading, value should still be defaultValue
    expect(result.current.isLoading).toBe(false);
    expect(result.current.value).toEqual(defaultValue);
    expect(LocalStorageService.initialize).toHaveBeenCalled();
    expect(LocalStorageService.getItem).toHaveBeenCalledWith('testKey', expect.anything());
  });
  
  test('should load value from storage', async () => {
    const storedValue = { stored: 'data' };
    
    // Mock getItem to return stored value
    (LocalStorageService.getItem as jest.Mock).mockResolvedValue(storedValue);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey', { defaultValue: null })
    );
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // After loading, value should be the stored value
    expect(result.current.isLoading).toBe(false);
    expect(result.current.value).toEqual(storedValue);
  });
  
  test('should update value in storage', async () => {
    const initialValue = { test: 'initial' };
    const newValue = { test: 'updated' };
    
    // Mock getItem to return initial value
    (LocalStorageService.getItem as jest.Mock).mockResolvedValue(initialValue);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey')
    );
    
    await waitForNextUpdate();
    
    // Value should be loaded from storage
    expect(result.current.value).toEqual(initialValue);
    
    // Update the value
    await act(async () => {
      await result.current.setValue(newValue);
    });
    
    // Value should be updated
    expect(result.current.value).toEqual(newValue);
    expect(LocalStorageService.setItem).toHaveBeenCalledWith(
      'testKey', 
      newValue, 
      expect.anything()
    );
  });
  
  test('should remove value from storage', async () => {
    const initialValue = { test: 'value' };
    
    // Mock getItem to return initial value
    (LocalStorageService.getItem as jest.Mock).mockResolvedValue(initialValue);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey', { defaultValue: null })
    );
    
    await waitForNextUpdate();
    
    // Remove the value
    await act(async () => {
      await result.current.removeValue();
    });
    
    // Value should be reset to default (null)
    expect(result.current.value).toBeNull();
    expect(LocalStorageService.removeItem).toHaveBeenCalledWith('testKey', false);
  });
  
  test('should handle error when loading', async () => {
    const error = new Error('Failed to load data');
    
    // Mock getItem to throw error
    (LocalStorageService.getItem as jest.Mock).mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey', { defaultValue: null })
    );
    
    await waitForNextUpdate();
    
    // Hook should expose the error
    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
  });
  
  test('should handle error when updating', async () => {
    const initialValue = { test: 'value' };
    const error = new Error('Failed to save data');
    
    // Mock getItem to return initial value
    (LocalStorageService.getItem as jest.Mock).mockResolvedValue(initialValue);
    
    // Mock setItem to throw error
    (LocalStorageService.setItem as jest.Mock).mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey')
    );
    
    await waitForNextUpdate();
    
    // Try to update value
    await expect(
      act(async () => {
        await result.current.setValue({ test: 'new' });
      })
    ).rejects.toThrow('Failed to save');
    
    // Error should be exposed in the hook
    expect(result.current.error).toEqual(error);
  });
  
  test('should register schema if provided', async () => {
    const schema = (value: any): value is any => true;
    
    // Mock getItem to return null
    (LocalStorageService.getItem as jest.Mock).mockResolvedValue(null);
    
    renderHook(() => 
      useLocalStorage('testKey', { 
        defaultValue: null,
        schema,
        version: 2
      })
    );
    
    expect(LocalStorageService.registerSchema).toHaveBeenCalledWith('testKey', schema, 2);
  });
  
  test('should handle different option combinations', async () => {
    // Test with all options specified
    const { result, waitForNextUpdate } = renderHook(() => 
      useLocalStorage('testKey', {
        defaultValue: { default: 'value' },
        validate: true,
        expiry: 1000,
        offlineSync: true
      })
    );
    
    await waitForNextUpdate();
    
    // Update with options
    await act(async () => {
      await result.current.setValue({ new: 'value' });
    });
    
    expect(LocalStorageService.setItem).toHaveBeenCalledWith(
      'testKey',
      { new: 'value' },
      expect.objectContaining({
        validate: true,
        expiry: 1000,
        offlineSync: true
      })
    );
  });
}); 