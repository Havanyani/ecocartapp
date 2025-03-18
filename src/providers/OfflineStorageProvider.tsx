/**
 * OfflineStorageProvider.tsx
 * 
 * A context provider that manages the application's offline storage capabilities.
 * This provider initializes storage services and makes them available
 * throughout the application via React Context.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import useSyncQueue from '@/hooks/useSyncQueue';
import LocalStorageService from '@/services/LocalStorageService';

// Define the shape of the context
interface OfflineStorageContextType {
  isStorageReady: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  triggerSync: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

// Create the context with a default value
const OfflineStorageContext = createContext<OfflineStorageContextType>({
  isStorageReady: false,
  isOnline: true,
  pendingSyncCount: 0,
  triggerSync: async () => {},
  clearAllData: async () => {}
});

// Export the hook for consuming the context
export const useOfflineStorage = () => useContext(OfflineStorageContext);

// Props for the provider component
interface OfflineStorageProviderProps {
  children: React.ReactNode;
}

export function OfflineStorageProvider({ children }: OfflineStorageProviderProps) {
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<Error | null>(null);
  
  // Get network status
  const { isOnline, checkConnection } = useNetworkStatus();
  
  // Get sync queue status
  const { stats, synchronize, clearQueue } = useSyncQueue();
  
  // Initialize local storage service
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Check network connectivity
        await checkConnection();
        
        // Initialize the storage service
        await LocalStorageService.initialize();
        
        // Set storage as ready
        setIsStorageReady(true);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to initialize storage');
        setStorageError(err);
        
        // Alert the user about the storage initialization failure
        Alert.alert(
          'Storage Error',
          'Failed to initialize the app storage. Some features may not work correctly.',
          [{ text: 'OK' }]
        );
      }
    };
    
    initializeStorage();
  }, [checkConnection]);
  
  // Clear all stored data - useful for debugging or "logout" functionality
  const clearAllData = async () => {
    try {
      // Confirm with the user
      return new Promise<void>((resolve, reject) => {
        Alert.alert(
          'Clear All Data',
          'Are you sure you want to clear all locally stored data? This action cannot be undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => reject(new Error('User cancelled'))
            },
            {
              text: 'Clear',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Clear sync queue first
                  await clearQueue();
                  
                  // Clear all stored data
                  await LocalStorageService.clearAll();
                  
                  Alert.alert('Success', 'All data has been cleared successfully.');
                  resolve();
                } catch (err) {
                  const error = err instanceof Error ? err : new Error('Failed to clear data');
                  Alert.alert('Error', `Failed to clear data: ${error.message}`);
                  reject(error);
                }
              }
            }
          ]
        );
      });
    } catch (error) {
      // This catch will handle the "User cancelled" error, which is expected
      if (error instanceof Error && error.message !== 'User cancelled') {
        console.error('Error clearing data:', error);
      }
    }
  };
  
  // If storage isn't ready, show a loading screen
  if (!isStorageReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C76E5" />
        <Text style={styles.loadingText}>
          {storageError ? 'Error initializing storage' : 'Initializing storage...'}
        </Text>
        {storageError && (
          <Text style={styles.errorText}>{storageError.message}</Text>
        )}
      </View>
    );
  }
  
  // Provide the context value
  const contextValue: OfflineStorageContextType = {
    isStorageReady,
    isOnline,
    pendingSyncCount: stats.total,
    triggerSync: synchronize,
    clearAllData
  };
  
  return (
    <OfflineStorageContext.Provider value={contextValue}>
      {children}
    </OfflineStorageContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000000'
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginHorizontal: 32
  }
});

export default OfflineStorageProvider; 