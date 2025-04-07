import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for using AsyncStorage with automatic JSON serialization/deserialization
 * @param key Storage key
 * @param initialValue Default value to use if the key doesn't exist in storage
 * @returns [value, setValue, isLoading, error, removeItem]
 */
export function useAsyncStorage<T>(
  key: string,
  initialValue: T
): [
  T, 
  (value: T | ((currentValue: T) => T)) => Promise<void>,
  boolean,
  Error | null,
  () => Promise<void>
] {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedValue = await AsyncStorage.getItem(key);
        
        if (storedValue !== null) {
          setValue(JSON.parse(storedValue));
        }
      } catch (err) {
        console.error(`Error loading value for key "${key}":`, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValue();
  }, [key]);

  // Update value in state and storage
  const updateValue = useCallback(
    async (newValue: T | ((currentValue: T) => T)) => {
      try {
        setError(null);
        
        // Allow functional updates (like setValue(prev => prev + 1))
        const valueToStore = 
          newValue instanceof Function ? newValue(value) : newValue;
        
        // Update state
        setValue(valueToStore);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error(`Error storing value for key "${key}":`, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [key, value]
  );

  // Remove item from storage
  const removeItem = useCallback(async () => {
    try {
      setError(null);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(key);
      
      // Reset to initial value
      setValue(initialValue);
    } catch (err) {
      console.error(`Error removing key "${key}":`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [key, initialValue]);

  return [value, updateValue, isLoading, error, removeItem];
}

/**
 * Hook for working with multiple AsyncStorage items at once
 * @param keys Object of storage keys and their initial values
 * @returns [values, setValues, isLoading, errors, removeAll]
 */
export function useMultiAsyncStorage<T extends Record<string, any>>(
  keys: T
): [
  T,
  <K extends keyof T>(key: K, value: T[K] | ((currentValue: T[K]) => T[K])) => Promise<void>,
  boolean,
  Record<keyof T, Error | null>,
  () => Promise<void>
] {
  const [values, setValues] = useState<T>({ ...keys });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<keyof T, Error | null>>(() => {
    return Object.keys(keys).reduce((acc, key) => {
      acc[key as keyof T] = null;
      return acc;
    }, {} as Record<keyof T, Error | null>);
  });

  // Load all values from storage
  useEffect(() => {
    const loadValues = async () => {
      try {
        setIsLoading(true);
        
        const allKeys = Object.keys(keys);
        const loadedItems = await AsyncStorage.multiGet(allKeys);
        
        const newValues = { ...keys };
        const newErrors = { ...errors };
        
        loadedItems.forEach(([key, value]) => {
          const typedKey = key as keyof T;
          
          if (value !== null) {
            try {
              newValues[typedKey] = JSON.parse(value);
              newErrors[typedKey] = null;
            } catch (err) {
              console.error(`Error parsing value for key "${key}":`, err);
              newErrors[typedKey] = err instanceof Error ? err : new Error('Parse error');
            }
          }
        });
        
        setValues(newValues);
        setErrors(newErrors);
      } catch (err) {
        console.error('Error loading multiple storage items:', err);
        
        // Set error for all keys
        const newErrors = { ...errors };
        Object.keys(keys).forEach(key => {
          newErrors[key as keyof T] = err instanceof Error ? err : new Error('Unknown error');
        });
        
        setErrors(newErrors);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadValues();
  }, []);

  // Update a single value
  const setValue = useCallback(
    async <K extends keyof T>(
      key: K, 
      newValue: T[K] | ((currentValue: T[K]) => T[K])
    ) => {
      try {
        // Update errors
        setErrors(prev => ({ 
          ...prev, 
          [key]: null 
        }));
        
        // Allow functional updates
        const valueToStore = 
          newValue instanceof Function ? newValue(values[key]) : newValue;
        
        // Update state
        setValues(prev => ({
          ...prev,
          [key]: valueToStore,
        }));
        
        // Store in AsyncStorage - Explicitly convert key to string
        await AsyncStorage.setItem(
          String(key), 
          JSON.stringify(valueToStore)
        );
      } catch (err) {
        console.error(`Error storing value for key "${String(key)}":`, err);
        
        // Update errors
        setErrors(prev => ({ 
          ...prev, 
          [key]: err instanceof Error ? err : new Error('Unknown error')
        }));
      }
    },
    [values]
  );

  // Remove all items
  const removeAll = useCallback(async () => {
    try {
      const allKeys = Object.keys(keys);
      
      // Remove all from AsyncStorage
      await AsyncStorage.multiRemove(allKeys);
      
      // Reset to initial values
      setValues({ ...keys });
      
      // Clear errors
      const newErrors = { ...errors };
      Object.keys(keys).forEach(key => {
        newErrors[key as keyof T] = null;
      });
      
      setErrors(newErrors);
    } catch (err) {
      console.error('Error removing multiple keys:', err);
      
      // Set error for all keys
      const newErrors = { ...errors };
      Object.keys(keys).forEach(key => {
        newErrors[key as keyof T] = err instanceof Error ? err : new Error('Unknown error');
      });
      
      setErrors(newErrors);
    }
  }, [keys]);

  return [values, setValue, isLoading, errors, removeAll];
} 