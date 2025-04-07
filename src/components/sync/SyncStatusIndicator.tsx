/**
 * SyncStatusIndicator Component
 * 
 * Displays the current sync status and allows users to initiate manual sync.
 * Features:
 * - Visual indicator of sync status (idle, in progress, error)
 * - Last sync time display
 * - Progress details during sync
 * - Manual sync trigger
 * - Sync error display with retry option
 */

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { useTheme } from '@/hooks/useTheme';
import { BackgroundSyncService, SyncTrigger } from '@/services/BackgroundSyncService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SyncStatusIndicatorProps {
  minimal?: boolean;
  showLastSyncTime?: boolean;
  onSyncComplete?: () => void;
}

export function SyncStatusIndicator({
  minimal = false,
  showLastSyncTime = true,
  onSyncComplete,
}: SyncStatusIndicatorProps) {
  const theme = useTheme();
  const { isOnline } = useNetworkStatus();
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncProgress, setSyncProgress] = useState({
    total: 0,
    processed: 0,
    errors: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get sync queue state
  const { isSyncing, sync, syncErrors, queue } = useSyncQueue();
  
  // Initialize the background sync service
  const backgroundSyncService = BackgroundSyncService.getInstance();

  // Format the last sync time
  const formattedLastSyncTime = lastSyncTime 
    ? formatDistanceToNow(lastSyncTime, { addSuffix: true })
    : 'Never';

  // Update status based on queue state
  useEffect(() => {
    if (isSyncing) {
      setSyncState('syncing');
      setSyncProgress({
        total: queue.length,
        processed: 0,
        errors: 0,
      });
      setErrorMessage(null);
    } else if (syncErrors && syncErrors.length > 0) {
      setSyncState('error');
      setErrorMessage(`Failed to sync ${syncErrors.length} items`);
    } else {
      setSyncState('idle');
    }
  }, [isSyncing, syncErrors, queue]);

  // Set up event listeners for background sync
  useEffect(() => {
    // Sync started event
    const handleSyncStarted = () => {
      setSyncState('syncing');
      setSyncProgress({
        total: queue.length,
        processed: 0,
        errors: 0,
      });
      setErrorMessage(null);
    };

    // Sync progress event
    const handleSyncProgress = (data: any) => {
      setSyncProgress({
        total: data.total,
        processed: data.processed,
        errors: data.errors || 0,
      });
    };

    // Sync completed event
    const handleSyncCompleted = (data: any) => {
      setSyncState('idle');
      setLastSyncTime(Date.now());
      
      if (data.errors?.length > 0) {
        setSyncState('error');
        setErrorMessage(`Failed to sync ${data.errors.length} items`);
      }
      
      // Notify parent component if needed
      if (onSyncComplete) {
        onSyncComplete();
      }
    };

    // Sync error event
    const handleSyncError = (data: any) => {
      setSyncState('error');
      setErrorMessage(data.error?.message || 'Unknown error during sync');
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
  }, [onSyncComplete, queue]);

  // Trigger manual sync
  const handleManualSync = useCallback(async () => {
    if (!isOnline) {
      setErrorMessage('No internet connection');
      setSyncState('error');
      return;
    }

    try {
      // Trigger manual sync
      await backgroundSyncService.triggerSync(SyncTrigger.MANUAL);
    } catch (error) {
      setSyncState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start sync');
    }
  }, [isOnline]);

  // Reset error state
  const handleResetError = useCallback(() => {
    setSyncState('idle');
    setErrorMessage(null);
  }, []);

  // Render minimal version (icon only)
  if (minimal) {
    return (
      <TouchableOpacity
        style={styles.minimalContainer}
        onPress={handleManualSync}
        disabled={syncState === 'syncing' || !isOnline}
      >
        {syncState === 'syncing' ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : syncState === 'error' ? (
          <MaterialCommunityIcons name="sync-alert" size={24} color={theme.colors.error} />
        ) : (
          <MaterialCommunityIcons 
            name="sync" 
            size={24} 
            color={isOnline ? theme.colors.primary : theme.colors.disabled} 
          />
        )}
      </TouchableOpacity>
    );
  }

  // Render full component
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Status header */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          {syncState === 'syncing' ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.icon} />
              <Text style={[styles.statusText, { color: theme.colors.primary }]}>
                Syncing...
              </Text>
            </>
          ) : syncState === 'error' ? (
            <>
              <MaterialCommunityIcons 
                name="sync-alert" 
                size={24} 
                color={theme.colors.error} 
                style={styles.icon}
              />
              <Text style={[styles.statusText, { color: theme.colors.error }]}>
                Sync Error
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons 
                name="check-circle-outline" 
                size={24} 
                color={theme.colors.success} 
                style={styles.icon}
              />
              <Text style={[styles.statusText, { color: theme.colors.text }]}>
                Sync Status
              </Text>
            </>
          )}
        </View>

        {/* Action button */}
        {syncState === 'syncing' ? (
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {syncProgress.processed}/{syncProgress.total}
          </Text>
        ) : syncState === 'error' ? (
          <TouchableOpacity onPress={handleResetError}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleManualSync}
            disabled={!isOnline || queue.length === 0}
          >
            <MaterialCommunityIcons 
              name="sync" 
              size={24} 
              color={isOnline && queue.length > 0 ? theme.colors.primary : theme.colors.disabled} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Details section */}
      {showLastSyncTime && syncState !== 'syncing' && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailsText, { color: theme.colors.textLight }]}>
            Last synced: {formattedLastSyncTime}
          </Text>
          
          {queue.length > 0 && (
            <Text style={[styles.detailsText, { color: theme.colors.textLight }]}>
              {queue.length} {queue.length === 1 ? 'item' : 'items'} pending
            </Text>
          )}
        </View>
      )}

      {/* Progress bar during sync */}
      {syncState === 'syncing' && syncProgress.total > 0 && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: theme.colors.primary,
                width: `${(syncProgress.processed / syncProgress.total) * 100}%`
              }
            ]} 
          />
        </View>
      )}

      {/* Error message */}
      {syncState === 'error' && errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errorMessage}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleManualSync}
            disabled={!isOnline}
          >
            <Text style={[styles.retryText, { color: theme.colors.white }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  minimalContainer: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  errorContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 