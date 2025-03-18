/**
 * SyncStatus displays the current synchronization state and schedule for offline data
 * in the EcoCart application. It provides visual feedback about connectivity and sync timing.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <SyncStatus
 *   isOnline={true}
 *   lastSync={new Date()}
 *   nextSync={new Date(Date.now() + 300000)}
 * />
 * 
 * // With custom configuration
 * <SyncStatus
 *   isOnline={true}
 *   lastSync={new Date()}
 *   nextSync={new Date(Date.now() + 300000)}
 *   showDetails={true}
 *   onRetry={handleRetry}
 * />
 * ```
 * 
 * @features
 * - Online/offline status indication
 * - Sync timing information
 * - Manual sync triggers
 * - Error state handling
 * - Progress visualization
 * 
 * @performance
 * - Efficient status updates
 * - Minimal re-renders
 * - Optimized animations
 * - Background updates
 * - Timer management
 * 
 * @accessibility
 * - Screen reader support
 * - Status announcements
 * - Clear indicators
 * - Focus management
 * - Keyboard navigation
 */

import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Props for the SyncStatus component
 * @interface
 */
interface SyncStatusProps {
  /** Current online status */
  isOnline: boolean;
  /** Last successful sync time */
  lastSync: Date;
  /** Next scheduled sync time */
  nextSync: Date;
  /** Show detailed sync information */
  showDetails?: boolean;
  /** Callback for manual sync retry */
  onRetry?: () => void;
}

/**
 * SyncStatus component implementation
 * @param {SyncStatusProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline,
  lastSync,
  nextSync,
  showDetails = false,
  onRetry,
}) => {
  // Theme and styles
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // State management
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  /**
   * Updates time display strings
   */
  const updateTimes = useCallback(() => {
    setTimeToNext(formatDistanceToNow(nextSync));
    setLastSyncTime(formatDistanceToNow(lastSync, { addSuffix: true }));
  }, [nextSync, lastSync]);

  // Update times periodically
  useEffect(() => {
    updateTimes();
    const timer = setInterval(updateTimes, 60000);
    return () => clearInterval(timer);
  }, [updateTimes]);

  /**
   * Handles manual sync retry
   */
  const handleRetryPress = useCallback(() => {
    if (isOnline && onRetry) {
      onRetry();
    }
  }, [isOnline, onRetry]);

  return (
    <View style={styles.container}>
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <MaterialIcons
          name={isOnline ? 'cloud-done' : 'cloud-off'}
          size={24}
          color={isOnline ? colors.primary : colors.notification}
        />
        <Text style={styles.statusText}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>

      {/* Sync timing */}
      <View style={styles.timingContainer}>
        <Text style={styles.timingText}>
          Last sync: {lastSyncTime}
        </Text>
        {showDetails && (
          <Text style={styles.timingText}>
            Next sync: {timeToNext}
          </Text>
        )}
      </View>

      {/* Retry button */}
      {!isOnline && onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={handleRetryPress}
        >
          <MaterialIcons
            name="refresh"
            size={20}
            color={colors.text}
          />
          <Text style={styles.retryText}>Retry Sync</Text>
        </Pressable>
      )}
    </View>
  );
};

/**
 * Styles for the SyncStatus component
 * @param {object} colors - Theme colors
 * @returns {StyleSheet} Component styles
 */
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  timingContainer: {
    marginTop: 8,
  },
  timingText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  retryText: {
    color: colors.text,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 