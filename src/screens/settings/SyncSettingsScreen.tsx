/**
 * SyncSettingsScreen
 * 
 * Allows users to configure data synchronization settings
 * Features:
 * - Enable/disable background sync
 * - Configure sync frequency
 * - Set network and battery conditions for sync
 * - Data usage options
 * - Manual sync triggers and queue management
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import * as Battery from 'expo-battery';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';
import { Divider } from '@/components/ui/Divider';
import { ListItem } from '@/components/ui/ListItem';
import { Section, SectionHeader } from '@/components/ui/Section';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { useTheme } from '@/hooks/useTheme';
import { BackgroundSyncService, SyncConfiguration, SyncTrigger } from '@/services/BackgroundSyncService';

const SYNC_INTERVALS = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
];

export function SyncSettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { queue, clearQueue } = useSyncQueue();
  
  // Get the background sync service
  const backgroundSyncService = BackgroundSyncService.getInstance();
  
  // State for sync settings
  const [syncConfig, setSyncConfig] = useState<SyncConfiguration>(
    backgroundSyncService.getConfiguration()
  );
  
  // Derived state for UI
  const [hasBatteryApi, setHasBatteryApi] = useState(false);
  
  // Load config and check battery API
  useEffect(() => {
    const checkBatteryApi = async () => {
      try {
        await Battery.getBatteryLevelAsync();
        setHasBatteryApi(true);
      } catch (error) {
        setHasBatteryApi(false);
      }
    };
    
    checkBatteryApi();
  }, []);
  
  // Update the sync configuration
  const updateConfig = useCallback(async (updates: Partial<SyncConfiguration>) => {
    const newConfig = { ...syncConfig, ...updates };
    setSyncConfig(newConfig);
    await backgroundSyncService.updateConfiguration(newConfig);
  }, [syncConfig, backgroundSyncService]);
  
  // Handle manual sync
  const handleManualSync = useCallback(async () => {
    try {
      await backgroundSyncService.triggerSync(SyncTrigger.MANUAL);
    } catch (error) {
      Alert.alert(
        'Sync Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
    }
  }, [backgroundSyncService]);
  
  // Handle clearing the sync queue
  const handleClearQueue = useCallback(async () => {
    Alert.alert(
      'Clear Sync Queue',
      'Are you sure you want to clear all pending sync items? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearQueue();
          },
        },
      ]
    );
  }, [clearQueue]);
  
  // Reset to default settings
  const handleResetSettings = useCallback(async () => {
    Alert.alert(
      'Reset Sync Settings',
      'Are you sure you want to reset all sync settings to their defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await backgroundSyncService.reset();
            setSyncConfig(backgroundSyncService.getConfiguration());
          },
        },
      ]
    );
  }, [backgroundSyncService]);
  
  // Find the current interval label
  const currentIntervalLabel = SYNC_INTERVALS.find(
    interval => interval.value === syncConfig.syncInterval
  )?.label || `${syncConfig.syncInterval} minutes`;
  
  return (
    <ScreenContainer title="Sync Settings">
      <ScrollView style={styles.container}>
        {/* Sync Status Card */}
        <SyncStatusIndicator showLastSyncTime />
        
        {/* Main Toggle */}
        <Section>
          <SectionHeader title="Sync Settings" />
          <View style={styles.enableRow}>
            <View style={styles.textContainer}>
              <Text style={[styles.enableText, { color: theme.colors.text }]}>
                Enable Background Sync
              </Text>
              <Text style={[styles.enableSubtext, { color: theme.colors.textLight }]}>
                Automatically sync data in the background
              </Text>
            </View>
            <Switch
              value={syncConfig.isEnabled}
              onValueChange={value => updateConfig({ isEnabled: value })}
              trackColor={{ 
                false: theme.colors.disabled, 
                true: theme.colors.primary 
              }}
              thumbColor={theme.colors.white}
            />
          </View>
        </Section>
        
        {/* Sync Frequency */}
        <Section>
          <SectionHeader title="Sync Frequency" />
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderValue, { color: theme.colors.text }]}>
              {currentIntervalLabel}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={SYNC_INTERVALS.length - 1}
              step={1}
              value={SYNC_INTERVALS.findIndex(
                interval => interval.value === syncConfig.syncInterval
              )}
              onValueChange={value => {
                const interval = SYNC_INTERVALS[value];
                updateConfig({ syncInterval: interval.value });
              }}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.disabled}
              thumbTintColor={theme.colors.primary}
              disabled={!syncConfig.isEnabled}
            />
            <View style={styles.sliderLabels}>
              <Text style={[
                styles.sliderLabel, 
                { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.textLight }
              ]}>
                More Frequent
              </Text>
              <Text style={[
                styles.sliderLabel, 
                { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.textLight }
              ]}>
                Less Frequent
              </Text>
            </View>
          </View>
        </Section>
        
        {/* Network and Power */}
        <Section>
          <SectionHeader title="Sync Conditions" />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="wifi" 
                size={24} 
                color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
              />
            }
            title="Require Wi-Fi"
            subtitle="Only sync when connected to Wi-Fi"
            trailing={
              <Switch
                value={syncConfig.requireWifi}
                onValueChange={value => updateConfig({ requireWifi: value })}
                trackColor={{ 
                  false: theme.colors.disabled, 
                  true: theme.colors.primary 
                }}
                thumbColor={theme.colors.white}
                disabled={!syncConfig.isEnabled}
              />
            }
          />
          
          <Divider />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="data-usage" 
                size={24} 
                color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
              />
            }
            title="Data Saver Mode"
            subtitle="Avoid sync on metered connections"
            trailing={
              <Switch
                value={syncConfig.dataSaverMode}
                onValueChange={value => updateConfig({ dataSaverMode: value })}
                trackColor={{ 
                  false: theme.colors.disabled, 
                  true: theme.colors.primary 
                }}
                thumbColor={theme.colors.white}
                disabled={!syncConfig.isEnabled}
              />
            }
          />
          
          <Divider />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="cellphone-arrow-down" 
                size={24} 
                color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
              />
            }
            title="Sync When App in Foreground"
            subtitle="Sync when app becomes active"
            trailing={
              <Switch
                value={syncConfig.syncOnForeground}
                onValueChange={value => updateConfig({ syncOnForeground: value })}
                trackColor={{ 
                  false: theme.colors.disabled, 
                  true: theme.colors.primary 
                }}
                thumbColor={theme.colors.white}
                disabled={!syncConfig.isEnabled}
              />
            }
          />
          
          <Divider />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="connection" 
                size={24} 
                color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
              />
            }
            title="Sync on Network Change"
            subtitle="Sync when network connection is restored"
            trailing={
              <Switch
                value={syncConfig.syncOnNetworkChange}
                onValueChange={value => updateConfig({ syncOnNetworkChange: value })}
                trackColor={{ 
                  false: theme.colors.disabled, 
                  true: theme.colors.primary 
                }}
                thumbColor={theme.colors.white}
                disabled={!syncConfig.isEnabled}
              />
            }
          />
          
          {hasBatteryApi && (
            <>
              <Divider />
              
              <ListItem
                leading={
                  <MaterialCommunityIcons 
                    name="battery-charging" 
                    size={24} 
                    color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
                  />
                }
                title="Require Charging"
                subtitle="Only sync when device is charging"
                trailing={
                  <Switch
                    value={syncConfig.requireCharging}
                    onValueChange={value => updateConfig({ requireCharging: value })}
                    trackColor={{ 
                      false: theme.colors.disabled, 
                      true: theme.colors.primary 
                    }}
                    thumbColor={theme.colors.white}
                    disabled={!syncConfig.isEnabled}
                  />
                }
              />
              
              <Divider />
              
              <View style={styles.batterySection}>
                <View style={styles.batteryHeader}>
                  <MaterialCommunityIcons 
                    name="battery-medium" 
                    size={24} 
                    color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
                  />
                  <View style={styles.batteryTextContainer}>
                    <Text style={[
                      styles.batteryTitle, 
                      { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text }
                    ]}>
                      Minimum Battery Level
                    </Text>
                    <Text style={[
                      styles.batterySubtitle, 
                      { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.textLight }
                    ]}>
                      Only sync when battery is above this level
                    </Text>
                  </View>
                  <Text style={[
                    styles.batteryValue, 
                    { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.primary }
                  ]}>
                    {syncConfig.syncWhenBatteryAbove}%
                  </Text>
                </View>
                <Slider
                  style={styles.batterySlider}
                  minimumValue={0}
                  maximumValue={50}
                  step={5}
                  value={syncConfig.syncWhenBatteryAbove}
                  onValueChange={value => updateConfig({ syncWhenBatteryAbove: value })}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.disabled}
                  thumbTintColor={theme.colors.primary}
                  disabled={!syncConfig.isEnabled}
                />
                <View style={styles.sliderLabels}>
                  <Text style={[
                    styles.sliderLabel, 
                    { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.textLight }
                  ]}>
                    0%
                  </Text>
                  <Text style={[
                    styles.sliderLabel, 
                    { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.textLight }
                  ]}>
                    50%
                  </Text>
                </View>
              </View>
            </>
          )}
        </Section>
        
        {/* Advanced Settings */}
        <Section>
          <SectionHeader title="Advanced" />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="priority-high" 
                size={24} 
                color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.text} 
              />
            }
            title="Sync Priority"
            subtitle="Choose which items to sync"
            trailing={
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  Alert.alert(
                    'Sync Priority',
                    'Select which items to sync',
                    [
                      { 
                        text: 'All Items', 
                        onPress: () => updateConfig({ syncPriority: 'all' }),
                        style: syncConfig.syncPriority === 'all' ? 'default' : 'default'
                      },
                      { 
                        text: 'High Priority Only', 
                        onPress: () => updateConfig({ syncPriority: 'high-only' }),
                        style: syncConfig.syncPriority === 'high-only' ? 'default' : 'default'
                      },
                      { 
                        text: 'Cancel', 
                        style: 'cancel'
                      },
                    ]
                  );
                }}
                disabled={!syncConfig.isEnabled}
              >
                <Text style={[
                  styles.selectText, 
                  { color: !syncConfig.isEnabled ? theme.colors.disabled : theme.colors.primary }
                ]}>
                  {syncConfig.syncPriority === 'all' 
                    ? 'All Items' 
                    : syncConfig.syncPriority === 'high-only' 
                      ? 'High Priority Only'
                      : 'Normal Only'}
                </Text>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={!syncConfig.isEnabled ? theme.colors.disabled : theme.colors.primary} 
                />
              </TouchableOpacity>
            }
          />
          
          <Divider />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="sync" 
                size={24} 
                color={theme.colors.text} 
              />
            }
            title="Manual Sync"
            subtitle={`${queue.length} items in queue`}
            trailing={
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  { 
                    backgroundColor: queue.length === 0 
                      ? theme.colors.disabled 
                      : theme.colors.primary 
                  }
                ]}
                onPress={handleManualSync}
                disabled={queue.length === 0}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
                  Sync Now
                </Text>
              </TouchableOpacity>
            }
          />
          
          <Divider />
          
          <ListItem
            leading={
              <MaterialCommunityIcons 
                name="trash-can-outline" 
                size={24} 
                color={queue.length === 0 ? theme.colors.disabled : theme.colors.text} 
              />
            }
            title="Clear Sync Queue"
            subtitle="Remove all pending sync items"
            trailing={
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  { 
                    backgroundColor: queue.length === 0 
                      ? theme.colors.disabled 
                      : theme.colors.error 
                  }
                ]}
                onPress={handleClearQueue}
                disabled={queue.length === 0}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            }
          />
        </Section>
        
        {/* Reset Button */}
        <View style={styles.resetContainer}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: theme.colors.error }]}
            onPress={handleResetSettings}
          >
            <Text style={[styles.resetText, { color: theme.colors.error }]}>
              Reset to Default Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  enableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  enableText: {
    fontSize: 16,
    fontWeight: '500',
  },
  enableSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
  },
  batterySection: {
    paddingVertical: 12,
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  batteryTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  batteryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  batterySubtitle: {
    fontSize: 14,
  },
  batteryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  batterySlider: {
    width: '100%',
    height: 40,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    marginRight: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 