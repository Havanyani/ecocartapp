/**
 * useSyncStatus.ts
 * 
 * Custom hook to track sync status and provide real-time feedback
 */

import { BackgroundSyncService, SyncTrigger } from '@/services/BackgroundSyncService';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useSyncQueue } from './useSyncQueue';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncErrors: any[];
  pendingItems: number;
  backgroundSyncEnabled: boolean;
  syncProgress: {
    total: number;
    processed: number;
    errors: number;
  };
}

export interface SyncControls {
  triggerSync: () => Promise<boolean>;
  clearErrors: () => void;
  toggleBackgroundSync: (enabled: boolean) => Promise<void>;
}

/**
 * Custom hook to track sync status and provide controls
 */
export function useSyncStatus(): [SyncStatus, SyncControls] {
  // Get dependencies
  const { isOnline } = useNetworkStatus();
  const syncQueue = useSyncQueue();
  const backgroundSyncService = useMemo(() => BackgroundSyncService.getInstance(), []);
  
  // Status state
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncErrors, setSyncErrors] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState({
    total: 0,
    processed: 0,
    errors: 0,
  });
  
  // Config state
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState<boolean>(
    backgroundSyncService.getConfiguration().isEnabled
  );
  
  // Set up event listeners for background sync
  useEffect(() => {
    // Sync started event
    const handleSyncStarted = () => {
      setIsSyncing(true);
      setSyncProgress({
        total: syncQueue.queue.length,
        processed: 0,
        errors: 0,
      });
      setSyncErrors([]);
    };

    // Sync progress event
    const handleSyncProgress = (data: any) => {
      setSyncProgress({
        total: data.total,
        processed: data.processed,
        errors: data.errors?.length || 0,
      });
    };

    // Sync completed event
    const handleSyncCompleted = (data: any) => {
      setIsSyncing(false);
      setLastSyncTime(Date.now());
      
      if (data.errors?.length > 0) {
        setSyncErrors(data.errors);
      }
    };

    // Sync error event
    const handleSyncError = (data: any) => {
      setIsSyncing(false);
      setSyncErrors(prev => [...prev, data.error]);
    };

    // Register event listeners
    backgroundSyncService.addEventListener('syncStarted', handleSyncStarted);
    backgroundSyncService.addEventListener('syncProgress', handleSyncProgress);
    backgroundSyncService.addEventListener('syncCompleted', handleSyncCompleted);
    backgroundSyncService.addEventListener('syncError', handleSyncError);

    // Clean up event listeners on unmount
    return () => {
      backgroundSyncService.removeEventListener('syncStarted', handleSyncStarted);
      backgroundSyncService.removeEventListener('syncProgress', handleSyncProgress);
      backgroundSyncService.removeEventListener('syncCompleted', handleSyncCompleted);
      backgroundSyncService.removeEventListener('syncError', handleSyncError);
    };
  }, [backgroundSyncService, syncQueue]);
  
  // Trigger manual sync
  const triggerSync = useCallback(async (): Promise<boolean> => {
    if (!isOnline) {
      setSyncErrors(prev => [...prev, new Error('No internet connection')]);
      return false;
    }

    try {
      return await backgroundSyncService.triggerSync(SyncTrigger.MANUAL);
    } catch (error) {
      setSyncErrors(prev => [...prev, error]);
      return false;
    }
  }, [backgroundSyncService, isOnline]);
  
  // Clear sync errors
  const clearErrors = useCallback(() => {
    setSyncErrors([]);
  }, []);
  
  // Toggle background sync
  const toggleBackgroundSync = useCallback(async (enabled: boolean) => {
    const config = backgroundSyncService.getConfiguration();
    await backgroundSyncService.updateConfiguration({
      ...config,
      isEnabled: enabled,
    });
    setBackgroundSyncEnabled(enabled);
  }, [backgroundSyncService]);
  
  // Combine all status into a single object
  const status: SyncStatus = {
    isOnline,
    isSyncing: isSyncing || syncQueue.isSyncing,
    lastSyncTime,
    syncErrors: [...syncErrors, ...(syncQueue.syncErrors || [])],
    pendingItems: syncQueue.queue.length,
    backgroundSyncEnabled,
    syncProgress,
  };
  
  // Combine all controls into a single object
  const controls: SyncControls = {
    triggerSync,
    clearErrors,
    toggleBackgroundSync,
  };
  
  return [status, controls];
} 