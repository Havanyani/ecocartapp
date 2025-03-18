/**
 * useNetworkStatus.ts
 * 
 * A React hook to monitor network connectivity status.
 * This hook provides real-time information about the device's network state
 * and offers methods to check if online operations can be performed.
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

export interface NetworkDetails {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  isExpensive: boolean | null;
  details: any;
}

interface UseNetworkStatusReturn {
  isOnline: boolean;
  networkDetails: NetworkDetails | null;
  lastOnlineAt: Date | null;
  checkConnection: () => Promise<boolean>;
  canPerformOperation: (requiredBandwidth?: 'low' | 'medium' | 'high') => boolean;
}

/**
 * Hook to monitor network connectivity status
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [networkDetails, setNetworkDetails] = useState<NetworkDetails | null>(null);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());

  // Convert NetInfoState to our NetworkDetails format
  const mapNetInfoToDetails = (state: NetInfoState): NetworkDetails => ({
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
    isWifi: state.type === 'wifi',
    isCellular: state.type === 'cellular',
    isExpensive: state.details?.isConnectionExpensive ?? null,
    details: state.details
  });

  // Update network status when it changes
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const details = mapNetInfoToDetails(state);
    setNetworkDetails(details);
    setIsOnline(details.isConnected && details.isInternetReachable !== false);
    
    // Update last online timestamp if we're online
    if (details.isConnected && details.isInternetReachable !== false) {
      setLastOnlineAt(new Date());
    }

    // Log network status changes for debugging
    console.log('[Network Status Change]', {
      isOnline: details.isConnected && details.isInternetReachable !== false,
      connectionType: details.type
    });
  }, []);

  // Subscribe to network status changes
  useEffect(() => {
    // Check immediately on mount
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to ongoing updates
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(handleNetworkChange);
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [handleNetworkChange]);

  // Force a manual connection check
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      handleNetworkChange(state);
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error('Failed to check network connection')
      );
      return false;
    }
  }, [handleNetworkChange]);

  // Check if a network operation can be performed based on required bandwidth
  const canPerformOperation = useCallback((requiredBandwidth: 'low' | 'medium' | 'high' = 'low'): boolean => {
    // If offline, no operations can be performed
    if (!isOnline) return false;
    
    // For low bandwidth requirements, any connection is fine
    if (requiredBandwidth === 'low') return true;
    
    // Medium bandwidth operations require wifi or good cellular
    if (requiredBandwidth === 'medium') {
      if (networkDetails?.isWifi) return true;
      if (networkDetails?.isCellular && networkDetails.details?.cellularGeneration === '4g') return true;
      return false;
    }
    
    // High bandwidth operations require wifi or excellent cellular
    if (requiredBandwidth === 'high') {
      return networkDetails?.isWifi === true;
    }
    
    return isOnline;
  }, [isOnline, networkDetails]);

  return {
    isOnline,
    networkDetails,
    lastOnlineAt,
    checkConnection,
    canPerformOperation
  };
}

export default useNetworkStatus; 