/**
 * OfflineStorageScreen.tsx
 *
 * A settings screen for managing offline storage options and viewing sync status.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import useSyncQueue from '@/hooks/useSyncQueue';
import { useOfflineStorage } from '@/providers/OfflineStorageProvider';
import ConflictResolution, { ResolutionStrategy } from '@/services/ConflictResolution';
import LocalStorageService from '@/services/LocalStorageService';
import NetworkTester, { NetworkCondition } from '@/utils/NetworkTesting';

export default function OfflineStorageScreen({ navigation }: any) {
  // Access offline storage context
  const { isStorageReady, isOnline, pendingSyncCount, triggerSync, clearAllData } = useOfflineStorage();

  // Get more detailed sync information
  const { queue, stats, isSyncing } = useSyncQueue();

  // Get network details
  const { networkDetails, checkConnection } = useNetworkStatus();

  // State for settings
  const [settings, setSettings] = useState({
    autoSync: true,
    offlineEditing: true,
    storeDrafts: true,
    conflictStrategy: ResolutionStrategy.LATEST_WINS,
    networkSimulation: NetworkCondition.ONLINE,
    testingEnabled: false
  });

  // Function to update a setting
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply setting changes
    switch (key) {
      case 'conflictStrategy':
        ConflictResolution.setDefaultStrategy(value);
        break;
      case 'testingEnabled':
        if (value) {
          NetworkTester.enable(settings.networkSimulation);
        } else {
          NetworkTester.disable();
        }
        break;
      case 'networkSimulation':
        if (settings.testingEnabled) {
          NetworkTester.setCondition(value);
        }
        break;
    }
  };

  // Function to clear all cached data
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will delete all cached data except pending sync items. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalStorageService.clearExpired();
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          }
        }
      ]
    );
  };

  // Function to clear all data
  const handleClearAllData = async () => {
    try {
      await clearAllData();
    } catch (error) {
      // User cancelled or other error
      console.error('Failed to clear all data', error);
    }
  };

  // If storage is not ready, show loading
  if (!isStorageReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading storage settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Storage</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Network Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusIndicator, 
                    isOnline ? styles.statusOnline : styles.statusOffline
                  ]} 
                />
                <Text style={styles.statusText}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Connection Type:</Text>
              <Text style={styles.infoValue}>
                {networkDetails?.type || 'Unknown'}
                {networkDetails?.isWifi ? ' (WiFi)' : ''}
                {networkDetails?.isCellular ? ' (Cellular)' : ''}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={checkConnection}
            >
              <Text style={styles.actionButtonText}>Check Connection</Text>
              <Ionicons name="refresh" size={18} color="#2C76E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronization</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pending Items:</Text>
              <Text style={styles.infoValue}>{pendingSyncCount}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Completed:</Text>
              <Text style={styles.infoValue}>{stats.completed}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Failed Items:</Text>
              <Text style={[styles.infoValue, stats.failed > 0 && styles.errorText]}>
                {stats.failed}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={triggerSync}
              disabled={!isOnline || isSyncing || pendingSyncCount === 0}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#2C76E5" />
              ) : (
                <>
                  <Text style={[
                    styles.actionButtonText,
                    (!isOnline || pendingSyncCount === 0) && styles.disabledText
                  ]}>
                    Sync Now
                  </Text>
                  <Ionicons 
                    name="sync" 
                    size={18} 
                    color={!isOnline || pendingSyncCount === 0 ? '#8E8E93' : '#2C76E5'} 
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Auto-Sync When Online</Text>
                <Text style={styles.settingDescription}>
                  Automatically sync data when connection is restored
                </Text>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting('autoSync', value)}
                trackColor={{ false: '#D1D1D6', true: '#8FDF9F' }}
                thumbColor={settings.autoSync ? '#34C759' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Allow Offline Editing</Text>
                <Text style={styles.settingDescription}>
                  Enable editing data while offline
                </Text>
              </View>
              <Switch
                value={settings.offlineEditing}
                onValueChange={(value) => updateSetting('offlineEditing', value)}
                trackColor={{ false: '#D1D1D6', true: '#8FDF9F' }}
                thumbColor={settings.offlineEditing ? '#34C759' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Store Form Drafts</Text>
                <Text style={styles.settingDescription}>
                  Save draft versions of forms
                </Text>
              </View>
              <Switch
                value={settings.storeDrafts}
                onValueChange={(value) => updateSetting('storeDrafts', value)}
                trackColor={{ false: '#D1D1D6', true: '#8FDF9F' }}
                thumbColor={settings.storeDrafts ? '#34C759' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Conflict Resolution Strategy</Text>
                <Text style={styles.settingDescription}>
                  How to resolve conflicts between local and server data
                </Text>
              </View>
            </View>
            
            <View style={styles.pickerContainer}>
              {Object.values(ResolutionStrategy).map((strategy) => (
                <TouchableOpacity
                  key={strategy}
                  style={[
                    styles.pickerItem,
                    settings.conflictStrategy === strategy && styles.pickerItemSelected
                  ]}
                  onPress={() => updateSetting('conflictStrategy', strategy)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    settings.conflictStrategy === strategy && styles.pickerItemTextSelected
                  ]}>
                    {strategy.replace('_', ' ')}
                  </Text>
                  {settings.conflictStrategy === strategy && (
                    <Ionicons name="checkmark" size={18} color="#34C759" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Testing</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Enable Network Simulation</Text>
                <Text style={styles.settingDescription}>
                  Simulate different network conditions for testing
                </Text>
              </View>
              <Switch
                value={settings.testingEnabled}
                onValueChange={(value) => updateSetting('testingEnabled', value)}
                trackColor={{ false: '#D1D1D6', true: '#8FDF9F' }}
                thumbColor={settings.testingEnabled ? '#34C759' : '#FFFFFF'}
              />
            </View>
            
            {settings.testingEnabled && (
              <>
                <View style={styles.divider} />
                
                <View style={styles.settingRow}>
                  <View style={styles.settingLabelContainer}>
                    <Text style={styles.settingLabel}>Network Condition</Text>
                    <Text style={styles.settingDescription}>
                      Select a condition to simulate
                    </Text>
                  </View>
                </View>
                
                <View style={styles.pickerContainer}>
                  {Object.values(NetworkCondition).map((condition) => (
                    <TouchableOpacity
                      key={condition}
                      style={[
                        styles.pickerItem,
                        settings.networkSimulation === condition && styles.pickerItemSelected
                      ]}
                      onPress={() => updateSetting('networkSimulation', condition)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        settings.networkSimulation === condition && styles.pickerItemTextSelected
                      ]}>
                        {condition.toUpperCase()}
                      </Text>
                      {settings.networkSimulation === condition && (
                        <Ionicons name="checkmark" size={18} color="#34C759" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
        
        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearCache}
            >
              <Ionicons name="trash-bin-outline" size={20} color="#FF3B30" />
              <Text style={styles.dangerButtonText}>Clear Cache</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearAllData}
            >
              <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" />
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8
  },
  container: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000'
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 16,
    color: '#3C3C43'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  errorText: {
    color: '#FF3B30'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6
  },
  statusOnline: {
    backgroundColor: '#34C759'
  },
  statusOffline: {
    backgroundColor: '#FF9500'
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C76E5',
    marginRight: 8
  },
  disabledText: {
    color: '#8E8E93'
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 16
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA'
  },
  pickerContainer: {
    padding: 8
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  pickerItemSelected: {
    backgroundColor: '#F2F2F7'
  },
  pickerItemText: {
    fontSize: 16,
    color: '#000000'
  },
  pickerItemTextSelected: {
    color: '#34C759',
    fontWeight: '500'
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 8
  }
}); 