import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Memory fallback for web environments
const memoryStorage = new Map<string, string>();

/**
 * Platform-safe storage utility that handles web environments gracefully
 * by falling back to memory storage when AsyncStorage is not available
 */
export const SafeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        // In web, use memoryStorage as fallback
        return memoryStorage.get(key) || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('SafeStorage getItem error:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // In web, use memoryStorage as fallback
        memoryStorage.set(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('SafeStorage setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // In web, use memoryStorage as fallback
        memoryStorage.delete(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('SafeStorage removeItem error:', error);
    }
  },

  multiGet: async (
    keys: string[],
  ): Promise<readonly [string, string | null][]> => {
    try {
      if (Platform.OS === 'web') {
        // In web, use memoryStorage as fallback
        return keys.map((key) => [key, memoryStorage.get(key) || null]);
      }
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.warn('SafeStorage multiGet error:', error);
      return keys.map((key) => [key, null]);
    }
  },

  clear: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // In web, use memoryStorage as fallback
        memoryStorage.clear();
        return;
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('SafeStorage clear error:', error);
    }
  },
};
