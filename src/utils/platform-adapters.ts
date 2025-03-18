/**
 * platform-adapters.ts
 *
 * Provides platform-specific adapters and utilities to handle
 * differences between web and native environments.
 */
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// Type guard to check if we're in a web environment
function isWeb(): boolean {
  return Platform.OS === 'web';
}

/**
 * Connection state interface
 */
export interface ConnectionState {
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
}

// Default connection state
const DEFAULT_CONNECTION_STATE: ConnectionState = {
  isConnected: true,
  connectionType: 'unknown',
  isInternetReachable: true,
};

/**
 * A cross-platform network information utility
 * Provides consistent API for network status across web and native
 */
export const NetworkAdapter = {
  /**
   * Get the current connection state
   * @returns Promise with connection state
   */
  getConnectionInfo: async (): Promise<ConnectionState> => {
    try {
      if (isWeb()) {
        // Safe access to web APIs with type checking
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
          return {
            isConnected: navigator.onLine,
            connectionType: navigator.onLine ? 'wifi' : 'none',
            isInternetReachable: navigator.onLine,
          };
        }
        return DEFAULT_CONNECTION_STATE;
      }

      const state = await NetInfo.fetch();
      return {
        isConnected: !!state.isConnected,
        connectionType: state.type,
        isInternetReachable: !!state.isInternetReachable,
      };
    } catch (error) {
      console.warn('Error getting connection info:', error);
      return DEFAULT_CONNECTION_STATE;
    }
  },

  /**
   * Add an event listener for network state changes
   * @param listener Function to call when network state changes
   * @returns Function to remove the listener
   */
  addEventListener: (
    listener: (state: ConnectionState) => void,
  ): (() => void) => {
    if (isWeb()) {
      const handleOnline = () => {
        listener({
          isConnected: true,
          connectionType: 'wifi',
          isInternetReachable: true,
        });
      };

      const handleOffline = () => {
        listener({
          isConnected: false,
          connectionType: 'none',
          isInternetReachable: false,
        });
      };

      // Safe access to web APIs with type checking
      if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }

      // Fallback for non-browser environments
      return () => {};
    }

    return NetInfo.addEventListener((state) => {
      listener({
        isConnected: !!state.isConnected,
        connectionType: state.type,
        isInternetReachable: !!state.isInternetReachable,
      });
    });
  },
};
