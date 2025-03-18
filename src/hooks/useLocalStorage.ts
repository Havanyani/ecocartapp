/**
 * useLocalStorage.ts
 * 
 * A React hook to simplify working with the LocalStorageService.
 * This hook provides state management and synchronization for stored values,
 * making it easy to use persisted data in components.
 */

import { useCallback, useEffect, useState } from 'react';
import LocalStorageService, { ValidationSchema } from '@/services/LocalStorageService';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface UseLocalStorageOptions<T> {
  /** Default value if none exists in storage */
  defaultValue?: T;
  /** Validation schema for the data */
  schema?: ValidationSchema<T>;
  /** Schema version */
  version?: number;
  /** Time in milliseconds until the data expires */
  expiry?: number;
  /** Whether to synchronize this value with the backend when offline */
  offlineSync?: boolean;
  /** Whether to validate retrieved data */
  validate?: boolean;
}

/**
 * A hook for working with persisted data in LocalStorage
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
) {
  const {
    defaultValue,
    schema,
    version = 1,
    expiry,
    offlineSync = false,
    validate = true
  } = options;

  // Initialize state with defaultValue
  const [value, setValue] = useState<T | null>(defaultValue || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Register schema if provided
  useEffect(() => {
    if (schema) {
      LocalStorageService.registerSchema(key, schema, version);
    }
  }, [key, schema, version]);

  // Load value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure the service is initialized
        await LocalStorageService.initialize();
        
        // Get the value from storage
        const storedValue = await LocalStorageService.getItem<T | null>(key, {
          defaultValue: defaultValue || null,
          validate
        });
        
        setValue(storedValue);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`Failed to load ${key} from storage`);
        PerformanceMonitor.captureError(error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValue();
  }, [key, defaultValue, validate]);
  
  // Update the stored value
  const updateValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      
      // Update state
      setValue(newValue);
      
      // Store in local storage
      await LocalStorageService.setItem(key, newValue, {
        expiry,
        validate,
        offlineSync
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to save ${key} to storage`);
      PerformanceMonitor.captureError(error);
      setError(error);
      throw error;
    }
  }, [key, expiry, validate, offlineSync]);
  
  // Remove the stored value
  const removeValue = useCallback(async () => {
    try {
      setError(null);
      
      // Update state
      setValue(defaultValue || null);
      
      // Remove from storage
      await LocalStorageService.removeItem(key, offlineSync);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to remove ${key} from storage`);
      PerformanceMonitor.captureError(error);
      setError(error);
      throw error;
    }
  }, [key, defaultValue, offlineSync]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error
  };
}

export default useLocalStorage; 