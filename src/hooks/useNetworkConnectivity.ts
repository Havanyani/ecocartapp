import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface NetworkInfo {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string | null;
    strength?: number | null;
  };
}

export interface UseNetworkConnectivityReturn {
  /**
   * Current network connection info
   */
  networkInfo: NetworkInfo;
  
  /**
   * Whether the device has internet connectivity
   */
  isOnline: boolean;
  
  /**
   * Whether the connection info is still being determined
   */
  isLoading: boolean;
  
  /**
   * Manually refresh the connection status
   */
  checkConnection: () => Promise<NetInfoState>;
  
  /**
   * Time elapsed since last connection check (ms)
   */
  lastCheckedAt: number | null;
}

/**
 * Hook for monitoring and managing network connectivity
 */
export function useNetworkConnectivity(): UseNetworkConnectivityReturn {
  // Default network state with offline status
  const defaultNetworkInfo: NetworkInfo = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
    details: {},
  };
  
  // State
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(defaultNetworkInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  
  // Check if online
  const isOnline = Boolean(networkInfo.isConnected && networkInfo.isInternetReachable);
  
  /**
   * Transform NetInfo state into our NetworkInfo format
   */
  const processNetworkState = (state: NetInfoState): NetworkInfo => {
    // Safe access to cellular generation with type handling
    let cellularGeneration: string | null = null;
    if (state.type === 'cellular' && state.details && state.details.cellularGeneration) {
      cellularGeneration = state.details.cellularGeneration as string;
    }

    return {
      isConnected: state.isConnected !== null ? state.isConnected : false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      details: {
        isConnectionExpensive: state.details?.isConnectionExpensive || false,
        cellularGeneration,
        // Strength is only available on Android and for WiFi/Cellular
        strength: Platform.OS === 'android' ? 
          ('strength' in (state.details || {}) ? (state.details as any).strength : null) : 
          null,
      },
    };
  };
  
  /**
   * Manually check the connection status
   */
  const checkConnection = useCallback(async (): Promise<NetInfoState> => {
    try {
      setIsLoading(true);
      
      const state = await NetInfo.fetch();
      const processedInfo = processNetworkState(state);
      
      setNetworkInfo(processedInfo);
      setLastCheckedAt(Date.now());
      
      return state;
    } catch (err) {
      console.error('Error checking network connection:', err);
      // Create a safe fallback state with proper type
      const fallbackState: NetInfoState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      };
      return fallbackState;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial check and set up listener
  useEffect(() => {
    let unsubscribe: NetInfoSubscription | undefined;
    
    const initNetworkMonitoring = async () => {
      // Initial check
      await checkConnection();
      
      // Subscribe to network changes
      unsubscribe = NetInfo.addEventListener(state => {
        const processedInfo = processNetworkState(state);
        setNetworkInfo(processedInfo);
        setLastCheckedAt(Date.now());
        setIsLoading(false);
      });
    };
    
    initNetworkMonitoring();
    
    // Clean up subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [checkConnection]);
  
  return {
    networkInfo,
    isOnline,
    isLoading,
    checkConnection,
    lastCheckedAt,
  };
} 