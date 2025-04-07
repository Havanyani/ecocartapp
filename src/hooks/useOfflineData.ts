/**
 * useOfflineData.ts
 * 
 * A React hook for working with offline data in components.
 * Provides access to offline status, synchronization functions, 
 * and tools for executing operations with offline support.
 */

import { useCallback, useEffect, useState } from 'react';
import { EntityType, offlineManager, OfflineStatus, OperationType } from '../services/OfflineManager';
import { syncService } from '../services/SyncService';
import useNetworkStatus from './useNetworkStatus';

/**
 * Type for the return value of the useOfflineData hook
 */
interface UseOfflineDataReturn {
  // Status information
  offlineStatus: OfflineStatus;
  isSyncing: boolean;
  isOffline: boolean;
  isOnline: boolean;
  
  // Data for pending operations
  pendingOperationsCount: number;
  pendingOperationsByType: Record<string, number>;
  
  // Functions for offline data management
  executeOperation: <T>(params: {
    entityType: EntityType;
    operation: OperationType;
    data: T;
    entityId?: string;
    apiCall?: () => Promise<T>;
  }) => Promise<T>;
  
  forceSyncData: () => Promise<boolean>;
  clearCache: () => Promise<void>;
  cacheExpired: (lastUpdated: number | null, ttl?: number) => boolean;
}

/**
 * Hook for working with offline data in components
 */
export function useOfflineData(): UseOfflineDataReturn {
  // Initialize the OfflineManager if not already initialized
  useEffect(() => {
    offlineManager.initialize();
    syncService.initialize();
  }, []);
  
  // Get network status
  const { isOnline: networkIsOnline } = useNetworkStatus();
  
  // Track offline status
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>(offlineManager.getStatus());
  
  // Track sync status
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Track pending operations
  const [pendingStats, setPendingStats] = useState(() => {
    const stats = offlineManager.getQueueStats();
    return {
      count: stats.totalItems,
      byType: stats.byEntityType,
    };
  });
  
  // Subscribe to offline status changes
  useEffect(() => {
    const unsubscribe = offlineManager.subscribeToStatusChanges((status) => {
      setOfflineStatus(status);
    });
    
    return unsubscribe;
  }, []);
  
  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = syncService.subscribeSyncStatus((isActive) => {
      setIsSyncing(isActive);
    });
    
    return unsubscribe;
  }, []);
  
  // Update pending operations stats when offline status changes
  useEffect(() => {
    const stats = offlineManager.getQueueStats();
    setPendingStats({
      count: stats.totalItems,
      byType: stats.byEntityType,
    });
  }, [offlineStatus, isSyncing]);
  
  // Function to execute an operation with offline support
  const executeOperation = useCallback(async <T>(params: {
    entityType: EntityType;
    operation: OperationType;
    data: T;
    entityId?: string;
    apiCall?: () => Promise<T>;
  }): Promise<T> => {
    return offlineManager.executeWithOfflineHandling(params);
  }, []);
  
  // Function to force a sync
  const forceSyncData = useCallback(async (): Promise<boolean> => {
    return offlineManager.forceSyncData();
  }, []);
  
  // Function to clear cache
  const clearCache = useCallback(async (): Promise<void> => {
    return offlineManager.clearCache();
  }, []);
  
  // Helper function to check if cached data is expired
  const cacheExpired = useCallback((lastUpdated: number | null, ttl = 30 * 60 * 1000): boolean => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > ttl;
  }, []);
  
  return {
    offlineStatus,
    isSyncing,
    isOffline: offlineStatus === 'offline',
    isOnline: offlineStatus === 'online',
    pendingOperationsCount: pendingStats.count,
    pendingOperationsByType: pendingStats.byType,
    executeOperation,
    forceSyncData,
    clearCache,
    cacheExpired,
  };
}

export default useOfflineData; 