import { useBatteryOptimizedUpdates } from '@/hooks/useBatteryOptimizedUpdates';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useTheme } from '@/hooks/useTheme';
import { LocationAccuracySettings } from '@/utils/BatteryOptimizer';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Real-Time Settings Screen
 * 
 * This screen allows users to configure real-time update settings,
 * including battery optimization, location accuracy, and background updates.
 */
export default function RealTimeSettingsScreen() {
  const theme = useTheme();
  const [deviceInfo, setDeviceInfo] = useState<{
    deviceName: string;
    osName: string;
    osVersion: string;
  }>({
    deviceName: 'Unknown',
    osName: 'Unknown',
    osVersion: 'Unknown',
  });
  
  // Get real-time hooks
  const { 
    isEnabled: isBatteryOptimizationEnabled,
    batteryState,
    batteryLevel,
    batteryLevelCategory,
    updateInterval,
    locationAccuracy,
    toggleOptimization,
    setLocationAccuracy,
    toggleBackgroundUpdates,
    isBackgroundUpdatesEnabled,
  } = useBatteryOptimizedUpdates();
  
  const {
    isEnabled: isRealTimeEnabled,
    isConnected,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
  } = useRealTimeUpdates();
  
  // Load device info
  useEffect(() => {
    const loadDeviceInfo = async () => {
      const deviceName = await Device.getDeviceNameAsync() || 'Unknown Device';
      const osName = Device.osName || 'Unknown OS';
      const osVersion = Device.osVersion || 'Unknown Version';
      
      setDeviceInfo({
        deviceName,
        osName,
        osVersion,
      });
    };
    
    loadDeviceInfo();
  }, []);
  
  // Format battery state text
  const getBatteryStateText = () => {
    switch (batteryState) {
      case Battery.BatteryState.CHARGING:
        return 'Charging';
      case Battery.BatteryState.FULL:
        return 'Full';
      case Battery.BatteryState.UNPLUGGED:
        return 'Unplugged';
      default:
        return 'Unknown';
    }
  };
  
  // Format battery level text
  const getBatteryLevelText = () => {
    return `${Math.round(batteryLevel * 100)}%`;
  };
  
  // Format update interval text
  const getUpdateIntervalText = () => {
    if (updateInterval < 1000) {
      return `${updateInterval}ms`;
    } else if (updateInterval < 60000) {
      return `${updateInterval / 1000}s`;
    } else {
      return `${updateInterval / 60000}m`;
    }
  };
  
  // Toggle real-time updates
  const handleToggleRealTime = async () => {
    if (isRealTimeEnabled) {
      await disableRealTimeUpdates();
    } else {
      await enableRealTimeUpdates();
    }
  };
  
  // Toggle battery optimization
  const handleToggleBatteryOptimization = async () => {
    await toggleOptimization();
  };
  
  // Toggle background updates
  const handleToggleBackgroundUpdates = async () => {
    await toggleBackgroundUpdates();
  };
  
  // Set location accuracy
  const handleSetLocationAccuracy = async (accuracy: LocationAccuracySettings) => {
    await setLocationAccuracy(accuracy);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Real-Time Settings
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Device Info Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Device Information
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Device</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
              {deviceInfo.deviceName}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>OS</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
              {deviceInfo.osName} {deviceInfo.osVersion}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Battery</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
              {getBatteryLevelText()} ({getBatteryStateText()})
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Update Interval</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
              {getUpdateIntervalText()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>Connection</Text>
            <View style={styles.connectionStatus}>
              <View style={[
                styles.connectionIndicator, 
                { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
              ]} />
              <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Real-Time Settings Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Real-Time Settings
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                Enable Real-Time Updates
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                Receive live updates about collections and notifications
              </Text>
            </View>
            <Switch
              value={isRealTimeEnabled}
              onValueChange={handleToggleRealTime}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : isRealTimeEnabled ? theme.colors.card : theme.colors.background}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                Battery Optimization
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                Adjust update frequency based on battery level
              </Text>
            </View>
            <Switch
              value={isBatteryOptimizationEnabled}
              onValueChange={handleToggleBatteryOptimization}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : isBatteryOptimizationEnabled ? theme.colors.card : theme.colors.background}
              disabled={!isRealTimeEnabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                Background Updates
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                Continue receiving updates when app is in background
              </Text>
            </View>
            <Switch
              value={isBackgroundUpdatesEnabled}
              onValueChange={handleToggleBackgroundUpdates}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : isBackgroundUpdatesEnabled ? theme.colors.card : theme.colors.background}
              disabled={!isRealTimeEnabled}
            />
          </View>
        </View>
        
        {/* Location Accuracy Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Location Accuracy
          </Text>
          
          <TouchableOpacity
            style={[
              styles.accuracyOption,
              locationAccuracy === LocationAccuracySettings.HIGH && styles.selectedAccuracy,
              locationAccuracy === LocationAccuracySettings.HIGH && { borderColor: theme.colors.primary }
            ]}
            onPress={() => handleSetLocationAccuracy(LocationAccuracySettings.HIGH)}
            disabled={!isRealTimeEnabled}
          >
            <View style={styles.accuracyIconContainer}>
              <Ionicons 
                name="location" 
                size={24} 
                color={locationAccuracy === LocationAccuracySettings.HIGH ? theme.colors.primary : theme.colors.text.secondary} 
              />
            </View>
            <View style={styles.accuracyTextContainer}>
              <Text style={[
                styles.accuracyTitle, 
                { color: locationAccuracy === LocationAccuracySettings.HIGH ? theme.colors.primary : theme.colors.text.primary }
              ]}>
                High Accuracy
              </Text>
              <Text style={[styles.accuracyDescription, { color: theme.colors.text.secondary }]}>
                Most precise location updates (higher battery usage)
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.accuracyOption,
              locationAccuracy === LocationAccuracySettings.MEDIUM && styles.selectedAccuracy,
              locationAccuracy === LocationAccuracySettings.MEDIUM && { borderColor: theme.colors.primary }
            ]}
            onPress={() => handleSetLocationAccuracy(LocationAccuracySettings.MEDIUM)}
            disabled={!isRealTimeEnabled}
          >
            <View style={styles.accuracyIconContainer}>
              <Ionicons 
                name="navigate" 
                size={24} 
                color={locationAccuracy === LocationAccuracySettings.MEDIUM ? theme.colors.primary : theme.colors.text.secondary} 
              />
            </View>
            <View style={styles.accuracyTextContainer}>
              <Text style={[
                styles.accuracyTitle, 
                { color: locationAccuracy === LocationAccuracySettings.MEDIUM ? theme.colors.primary : theme.colors.text.primary }
              ]}>
                Balanced
              </Text>
              <Text style={[styles.accuracyDescription, { color: theme.colors.text.secondary }]}>
                Good accuracy with moderate battery usage
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.accuracyOption,
              locationAccuracy === LocationAccuracySettings.LOW && styles.selectedAccuracy,
              locationAccuracy === LocationAccuracySettings.LOW && { borderColor: theme.colors.primary }
            ]}
            onPress={() => handleSetLocationAccuracy(LocationAccuracySettings.LOW)}
            disabled={!isRealTimeEnabled}
          >
            <View style={styles.accuracyIconContainer}>
              <Ionicons 
                name="compass" 
                size={24} 
                color={locationAccuracy === LocationAccuracySettings.LOW ? theme.colors.primary : theme.colors.text.secondary} 
              />
            </View>
            <View style={styles.accuracyTextContainer}>
              <Text style={[
                styles.accuracyTitle, 
                { color: locationAccuracy === LocationAccuracySettings.LOW ? theme.colors.primary : theme.colors.text.primary }
              ]}>
                Low Power
              </Text>
              <Text style={[styles.accuracyDescription, { color: theme.colors.text.secondary }]}>
                Less frequent and less accurate updates (saves battery)
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Info Text */}
        <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
          Battery optimization automatically adjusts update frequency based on your battery level and charging status.
          When your battery is low, updates will be less frequent to conserve power.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  accuracyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectedAccuracy: {
    borderWidth: 2,
  },
  accuracyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accuracyTextContainer: {
    flex: 1,
  },
  accuracyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  accuracyDescription: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
}); 