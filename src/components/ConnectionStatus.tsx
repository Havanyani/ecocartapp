import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';
import syncService, { SyncStats } from '@/services/SyncService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface ConnectionStatusProps {
  onPress?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onPress }) => {
  const { isOnline } = useNetworkStatus();
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];

  // Update sync stats periodically
  useEffect(() => {
    let mounted = true;
    const updateSyncStats = async () => {
      try {
        const stats = await syncService.getSyncStats();
        if (mounted) {
          setSyncStats(stats);
        }
      } catch (error) {
        console.error('Failed to get sync stats:', error);
      }
    };

    updateSyncStats();
    const interval = setInterval(updateSyncStats, 10000); // Every 10 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  // Manually trigger sync
  const handleManualSync = async () => {
    if (isOnline && !isSyncing) {
      setIsSyncing(true);
      await syncService.triggerSync('manual');
      const stats = await syncService.getSyncStats();
      setSyncStats(stats);
      setIsSyncing(false);
    }
  };

  // Calculate stats for display
  const getStatusColor = () => {
    if (!isOnline) return '#e74c3c'; // Red for offline
    if (isSyncing) return '#f39c12'; // Orange for syncing
    if (syncStats?.pendingActions && syncStats.pendingActions > 0) return '#f39c12'; // Orange for pending
    return '#2ecc71'; // Green for all synced
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (syncStats?.pendingActions && syncStats.pendingActions > 0) 
      return `${syncStats.pendingActions} pending ${syncStats.pendingActions === 1 ? 'change' : 'changes'}`;
    return 'All Changes Synced';
  };

  const getLastSyncText = () => {
    if (!syncStats?.lastSyncTimestamp) return 'Never synced';
    const lastSync = new Date(syncStats.lastSyncTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  // Rotate animation for the chevron icon
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Height animation for the details section
  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <View style={[styles.container, { borderColor: '#ccc' }]}>
      <Pressable 
        style={styles.statusBar} 
        onPress={toggleExpanded}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <View style={styles.statusContent}>
          <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {getStatusText()}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons 
            name="chevron-down" 
            size={18} 
            color={theme.colors.text} 
          />
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.details, { maxHeight }]}>
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.colors.text }]}>Last Sync:</Text>
          <Text style={[styles.statsValue, { color: theme.colors.text }]}>{getLastSyncText()}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.colors.text }]}>Success Rate:</Text>
          <Text style={[styles.statsValue, { color: theme.colors.text }]}>
            {syncStats?.totalSyncs ? 
              `${Math.round((syncStats.successfulSyncs / syncStats.totalSyncs) * 100)}%` : 
              'N/A'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.colors.text }]}>Pending:</Text>
          <Text style={[styles.statsValue, { color: theme.colors.text }]}>
            {syncStats?.pendingActions || 0} items
          </Text>
        </View>

        <Pressable 
          style={[
            styles.syncButton, 
            {
              backgroundColor: isOnline ? theme.colors.primary : '#cccccc',
              opacity: isOnline && !isSyncing ? 1 : 0.5
            }
          ]} 
          onPress={handleManualSync}
          disabled={!isOnline || isSyncing}
        >
          <Ionicons 
            name={isSyncing ? "sync-circle" : "sync"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.syncButtonText}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  details: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 14,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  syncButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ConnectionStatus; 