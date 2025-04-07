/**
 * SecureStorage.ts
 * 
 * Utility for securely storing sensitive data with Expo's SecureStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * SecureStorage class for handling secure data storage
 * Falls back to AsyncStorage on platforms where SecureStore is not available
 */
class SecureStorage {
  /**
   * Store a value securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // SecureStore is not available on web, use AsyncStorage with a prefix
        await AsyncStorage.setItem(`secure_${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error storing secure value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a securely stored value
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // SecureStore is not available on web, use AsyncStorage with a prefix
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error retrieving secure value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a securely stored value
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // SecureStore is not available on web, use AsyncStorage with a prefix
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing secure value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in secure storage
   */
  async hasKey(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }
}

export const secureStorage = new SecureStorage();
export default secureStorage; 