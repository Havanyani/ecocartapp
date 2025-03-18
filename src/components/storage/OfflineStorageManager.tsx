/**
 * OfflineStorageManager is responsible for managing offline data persistence and synchronization
 * in the EcoCart application. It handles data caching, storage optimization, and sync strategies.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <OfflineStorageManager
 *   syncInterval={300000}
 *   maxStorageSize="500MB"
 *   onSyncComplete={handleSyncComplete}
 * />
 * 
 * // With custom configuration
 * <OfflineStorageManager
 *   syncInterval={600000}
 *   maxStorageSize="1GB"
 *   onSyncComplete={handleSyncComplete}
 *   priorityItems={['rewards', 'points']}
 *   compressionLevel="high"
 * />
 * ```
 * 
 * @features
 * - Automatic background synchronization
 * - Storage space management
 * - Data compression and optimization
 * - Priority-based sync scheduling
 * - Conflict resolution handling
 * 
 * @performance
 * - Implements efficient data compression
 * - Uses batch operations for sync
 * - Optimizes storage usage
 * - Manages background tasks
 * - Implements retry mechanisms
 * 
 * @security
 * - Encrypts sensitive data
 * - Implements secure storage
 * - Validates data integrity
 * - Manages access control
 * - Handles secure deletion
 */

import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '../../hooks/useStorage';
import type { SyncResult } from '../../types/storage';
import { StorageMetrics } from './StorageMetrics';
import { SyncStatus } from './SyncStatus';

/**
 * Props for the OfflineStorageManager component
 * @interface
 */
interface OfflineStorageManagerProps {
  /** Interval for sync operations in milliseconds */
  syncInterval?: number;
  /** Maximum storage size limit */
  maxStorageSize?: string;
  /** Callback when sync completes */
  onSyncComplete?: (result: SyncResult) => void;
  /** Priority items for sync */
  priorityItems?: string[];
  /** Compression level for stored data */
  compressionLevel?: 'low' | 'medium' | 'high';
}

/**
 * OfflineStorageManager component implementation
 * @param {OfflineStorageManagerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const OfflineStorageManager: React.FC<OfflineStorageManagerProps> = ({
  syncInterval = 300000,
  maxStorageSize = '500MB',
  onSyncComplete,
  priorityItems = [],
  compressionLevel = 'medium',
}) => {
  // Theme and styles
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Network status
  const netInfo = useNetInfo();

  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Custom hooks
  const { storage, initStorage, optimizeStorage } = useStorage();

  /**
   * Handles storage initialization
   * @returns {Promise<void>}
   */
  const handleInitialization = useCallback(async () => {
    try {
      await initStorage({
        maxSize: maxStorageSize,
        compression: compressionLevel,
        priorities: priorityItems,
      });
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
    }
  }, [initStorage, maxStorageSize, compressionLevel, priorityItems]);

  /**
   * Manages sync operations
   * @returns {Promise<void>}
   */
  const handleSync = useCallback(async () => {
    if (!netInfo.isConnected) return;

    try {
      const result = await storage.sync();
      onSyncComplete?.(result);
    } catch (err) {
      setError(err as Error);
    }
  }, [netInfo.isConnected, storage, onSyncComplete]);

  // Initialize storage
  useEffect(() => {
    handleInitialization();
  }, [handleInitialization]);

  // Setup sync interval
  useEffect(() => {
    if (!isInitialized) return;

    const syncTimer = setInterval(handleSync, syncInterval);
    return () => clearInterval(syncTimer);
  }, [isInitialized, handleSync, syncInterval]);

  // Handle error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Storage metrics */}
      <StorageMetrics
        usage={storage.metrics}
        maxSize={maxStorageSize}
        onOptimize={optimizeStorage}
      />

      {/* Sync status */}
      <SyncStatus
        isOnline={netInfo.isConnected ?? false}
        lastSync={storage.lastSyncTime}
        nextSync={storage.nextSyncTime}
      />
    </SafeAreaView>
  );
};

/**
 * Styles for the OfflineStorageManager component
 * @param {object} colors - Theme colors
 * @returns {StyleSheet} Component styles
 */
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
}); 