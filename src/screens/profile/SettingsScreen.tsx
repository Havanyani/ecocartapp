/**
 * SettingsScreen.tsx
 * 
 * Screen for configuring app settings and preferences.
 */

import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { isOnline } = useNetworkStatus();
  const { theme, toggleTheme } = useTheme();
  
  // Toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [dataUsage, setDataUsage] = useState(true);
  
  // Handle toggle change
  const handleToggleChange = (setting: string, value: boolean) => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Settings changes will be applied when you\'re back online.',
        [{ text: 'OK' }]
      );
    }
    
    switch (setting) {
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'locationServices':
        setLocationServices(value);
        break;
      case 'dataUsage':
        setDataUsage(value);
        break;
      default:
        break;
    }
  };
  
  // Handle clearing cache
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  // Add navigation options for performance tools
  const navigateToPerformanceMonitor = () => {
    navigation.navigate('AIPerformanceMonitorScreen');
  };

  const navigateToBenchmark = () => {
    navigation.navigate('AIBenchmarkScreen');
  };

  const navigateToBundleOptimization = () => {
    navigation.navigate('BundleOptimization');
  };
  
  const navigateToTreeShaking = () => {
    navigation.navigate('TreeShaking');
  };
  
  const navigateToSyncSettings = () => {
    navigation.navigate('SyncSettings');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
          <Text style={styles.offlineText}>
            You're currently offline. Settings changes will be synced when you're back online.
          </Text>
        </View>
      )}
      
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive alerts on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => handleToggleChange('pushNotifications', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates via email</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => handleToggleChange('emailNotifications', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
      
      {/* Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Synchronization</Text>
        <View style={styles.settingsCard}>
          {/* Mini sync status indicator */}
          <View style={styles.syncStatusContainer}>
            <SyncStatusIndicator minimal showLastSyncTime={false} />
            <View style={styles.syncInfo}>
              <Text style={styles.settingTitle}>Sync Status</Text>
              <Text style={styles.settingDescription}>
                {isOnline ? 'Connected and ready to sync' : 'Offline - changes saved locally'}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={navigateToSyncSettings}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Sync Settings</Text>
              <Text style={styles.actionDescription}>Configure sync preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>Allow app to access your location</Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={(value) => handleToggleChange('locationServices', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Usage</Text>
              <Text style={styles.settingDescription}>Allow data collection for app improvement</Text>
            </View>
            <Switch
              value={dataUsage}
              onValueChange={(value) => handleToggleChange('dataUsage', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
      
      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={handleClearCache}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Clear Cache</Text>
              <Text style={styles.actionDescription}>Free up storage space</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Version</Text>
              <Text style={styles.actionDescription}>1.0.0</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Licenses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Developer Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer Tools</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={navigateToPerformanceMonitor}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>AI Performance Monitor</Text>
              <Text style={styles.actionDescription}>View AI assistant performance metrics</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={navigateToBenchmark}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>AI Benchmark Tool</Text>
              <Text style={styles.actionDescription}>Run performance benchmarks</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={navigateToBundleOptimization}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Bundle Optimization</Text>
              <Text style={styles.actionDescription}>Analyze and optimize app bundle size</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={navigateToTreeShaking}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Tree Shaking</Text>
              <Text style={styles.actionDescription}>View tree shaking optimization</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  offlineBanner: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  offlineText: {
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#8E8E93',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  syncInfo: {
    flex: 1,
    marginLeft: 12,
  },
}); 