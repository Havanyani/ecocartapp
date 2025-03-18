import { OfflineManager, OfflineStatus } from '@/services/OfflineManager';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OfflineScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<OfflineStatus>('online');
  const [syncStats, setSyncStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  
  useEffect(() => {
    const initialize = async () => {
      // Get network info
      const netInfo = await NetInfo.fetch();
      setNetworkInfo(netInfo);
      
      // Initialize OfflineManager
      const offlineManager = OfflineManager.getInstance();
      
      // Subscribe to status changes
      const unsubscribe = offlineManager.subscribeToStatusChanges((newStatus) => {
        setStatus(newStatus);
        if (newStatus !== 'syncing') {
          setIsSyncing(false);
          loadSyncStats();
        } else {
          setIsSyncing(true);
        }
      });
      
      // Get initial status
      setStatus(offlineManager.getStatus());
      
      // Load sync stats
      await loadSyncStats();
      
      return () => {
        unsubscribe();
      };
    };
    
    initialize();
    
    // Set up network listener
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      setNetworkInfo(state);
    });
    
    return () => {
      unsubscribeNet();
    };
  }, []);
  
  const loadSyncStats = async () => {
    try {
      setIsLoading(true);
      const offlineManager = OfflineManager.getInstance();
      const stats = await offlineManager.getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading sync stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSyncStats();
  };
  
  const handleSync = async () => {
    if (!networkInfo.isConnected) {
      Alert.alert(
        'Offline Mode',
        'Cannot sync while offline. Please connect to the internet and try again.'
      );
      return;
    }
    
    setIsSyncing(true);
    try {
      const offlineManager = OfflineManager.getInstance();
      const success = await offlineManager.forceSyncData();
      
      if (success) {
        Alert.alert('Sync Complete', 'Data successfully synchronized with the server.');
      } else {
        Alert.alert('Sync Failed', 'Some items failed to sync. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Sync Error', 'An error occurred during synchronization.');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      await loadSyncStats();
    }
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Clear Offline Data',
      'This will clear all cached data and pending operations. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              const offlineManager = OfflineManager.getInstance();
              await offlineManager.clearOfflineData();
              await loadSyncStats();
              Alert.alert('Success', 'Offline data cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear offline data.');
              console.error('Clear data error:', error);
            }
          }
        }
      ]
    );
  };
  
  const renderStatusIndicator = () => {
    let color = '#34C759'; // Green for online
    let statusText = 'Online';
    let icon = 'cloud-done-outline';
    
    if (status === 'offline') {
      color = '#FF3B30'; // Red for offline
      statusText = 'Offline';
      icon = 'cloud-offline-outline';
    } else if (status === 'syncing') {
      color = '#FF9500'; // Orange for syncing
      statusText = 'Syncing...';
      icon = 'sync-outline';
    }
    
    return (
      <View style={styles.statusCard}>
        <View style={[styles.statusIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={[styles.statusText, { color }]}>{statusText}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.refreshButton, isSyncing && styles.refreshButtonDisabled]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="sync" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderNetworkInfo = () => {
    if (!networkInfo) return null;
    
    return (
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Network Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Connection Type:</Text>
          <Text style={styles.infoValue}>
            {networkInfo.type === 'unknown' ? 'Unknown' : networkInfo.type}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Connected:</Text>
          <View style={styles.connectionStatus}>
            <View 
              style={[
                styles.connectionIndicator, 
                { backgroundColor: networkInfo.isConnected ? '#34C759' : '#FF3B30' }
              ]} 
            />
            <Text style={styles.infoValue}>
              {networkInfo.isConnected ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
        {networkInfo.type === 'cellular' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cellular Network:</Text>
            <Text style={styles.infoValue}>
              {networkInfo.details?.cellularGeneration || 'Unknown'}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expensive Connection:</Text>
          <Text style={styles.infoValue}>
            {networkInfo.details?.isConnectionExpensive ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderSyncStats = () => {
    if (isLoading || !syncStats) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading sync statistics...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Sync Statistics</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pending Actions:</Text>
          <Text style={styles.infoValue}>{syncStats.pendingActions}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Sync:</Text>
          <Text style={styles.infoValue}>
            {syncStats.lastSync 
              ? new Date(syncStats.lastSync).toLocaleString() 
              : 'Never'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Sync Status:</Text>
          <View style={styles.connectionStatus}>
            <View 
              style={[
                styles.connectionIndicator, 
                { backgroundColor: syncStats.syncSuccess ? '#34C759' : '#FF3B30' }
              ]} 
            />
            <Text style={styles.infoValue}>
              {syncStats.syncSuccess ? 'Success' : 'Failed'}
            </Text>
          </View>
        </View>
        
        {syncStats.pendingActions > 0 && (
          <View style={styles.pendingActionsContainer}>
            <Text style={styles.subCardTitle}>Pending Actions by Type</Text>
            {Object.entries(syncStats.byEntityType).map(([entityType, count]) => {
              if (count === 0) return null;
              return (
                <View key={entityType} style={styles.pendingActionRow}>
                  <Text style={styles.entityTypeText}>{entityType}</Text>
                  <View style={styles.pendingCountContainer}>
                    <Text style={styles.pendingCountText}>{count}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{
          title: "Offline Support",
          headerShown: true,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStatusIndicator()}
        {renderNetworkInfo()}
        {renderSyncStats()}
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" style={styles.actionIcon} />
                <Text style={styles.actionText}>Refresh Stats</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.destructiveButton]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionText}>Clear Offline Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pendingActionsContainer: {
    marginTop: 16,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  pendingActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  entityTypeText: {
    fontSize: 14,
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  pendingCountContainer: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
}); 