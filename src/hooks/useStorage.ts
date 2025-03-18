/**
 * useStorage.ts
 * 
 * A simplified wrapper around the LocalStorageService that provides
 * basic storage operations with a cleaner API. This is intended for
 * components that need basic storage without the full state management
 * functionality of useLocalStorage.
 */

import LocalStorageService from '@/services/LocalStorageService';

/**
 * A hook that provides simplified storage operations
 */
export function useStorage() {
  /**
   * Get an item from storage
   * 
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  const getItem = async <T>(key: string): Promise<T | null> => {
    await LocalStorageService.initialize();
    return LocalStorageService.getItem<T>(key, { validate: false });
  };
  
  /**
   * Store an item in storage
   * 
   * @param key The key to store under
   * @param value The value to store
   */
  const setItem = async <T>(key: string, value: T): Promise<void> => {
    await LocalStorageService.initialize();
    return LocalStorageService.setItem(key, value, { validate: false });
  };
  
  /**
   * Remove an item from storage
   * 
   * @param key The key to remove
   */
  const removeItem = async (key: string): Promise<void> => {
    await LocalStorageService.initialize();
    return LocalStorageService.removeItem(key);
  };
  
  return {
    getItem,
    setItem,
    removeItem
  };
}

export default useStorage; 