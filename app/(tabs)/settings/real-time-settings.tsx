import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { selectRealtimeEnabled, setRealtimeEnabled } from '@/store/slices/collectionSlice';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { SafeStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// Define the storage key for real-time preferences
const REALTIME_PREFS_STORAGE_KEY = 'ecocart_realtime_preferences';

// Define the type for real-time preferences
interface RealTimePreferences {
  deliveryLocationUpdates: boolean;
  collectionStatusUpdates: boolean;
  personnelAssignmentNotifications: boolean;
  routeChangeNotifications: boolean;
  backgroundUpdates: boolean;
  highAccuracyLocation: boolean;
  batteryOptimizationEnabled: boolean;
  dataUsageOptimization: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: RealTimePreferences = {
  deliveryLocationUpdates: true,
  collectionStatusUpdates: true,
  personnelAssignmentNotifications: true,
  routeChangeNotifications: true,
  backgroundUpdates: false,
  highAccuracyLocation: false,
  batteryOptimizationEnabled: true,
  dataUsageOptimization: true,
};

export default function RealTimeSettingsScreen() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const realtimeEnabled = useSelector(selectRealtimeEnabled);
  const [preferences, setPreferences] = useState<RealTimePreferences>(DEFAULT_PREFERENCES);
  const [batteryLevel, setBatteryLevel] = useState<number>(0);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(Battery.BatteryState.UNKNOWN);
  const [isMeasuringPerformance, setIsMeasuringPerformance] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await SafeStorage.getItem(REALTIME_PREFS_STORAGE_KEY);
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }

        // Get battery info
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        setBatteryLevel(level);
        setBatteryState(state);

        // Start performance monitoring
        PerformanceMonitor.startBenchmark({
          name: 'realtime_settings_load',
          includeMemory: true,
          tags: { component: 'RealTimeSettings' }
        });
      } catch (error) {
        console.error('Failed to load real-time preferences:', error);
      }
    };

    if (isFocused) {
      loadPreferences();
    }

    // End performance monitoring when component unmounts
    return () => {
      PerformanceMonitor.endBenchmark({ name: 'realtime_settings_load' });
    };
  }, [isFocused]);

  // Save preferences when they change
  const savePreferences = async (newPrefs: RealTimePreferences) => {
    try {
      await SafeStorage.setItem(REALTIME_PREFS_STORAGE_KEY, JSON.stringify(newPrefs));
      // Update Redux state for realtime enabled status
      dispatch(setRealtimeEnabled(newPrefs.deliveryLocationUpdates || newPrefs.collectionStatusUpdates));
    } catch (error) {
      console.error('Failed to save real-time preferences:', error);
    }
  };

  // Toggle a preference
  const togglePreference = (key: keyof RealTimePreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  // Handle master toggle for all real-time updates
  const toggleAllRealTimeFeatures = (value: boolean) => {
    const newPreferences = {
      ...preferences,
      deliveryLocationUpdates: value,
      collectionStatusUpdates: value,
      personnelAssignmentNotifications: value,
      routeChangeNotifications: value,
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
    dispatch(setRealtimeEnabled(value));
  };

  // Start a performance test to measure impact of real-time features
  const startPerformanceTest = async () => {
    setIsMeasuringPerformance(true);
    try {
      // Measure baseline performance
      await PerformanceMonitor.startBenchmark({
        name: 'realtime_performance_test',
        includeMemory: true,
        tags: { component: 'RealTimeSettings' }
      });

      // Simulate real-time updates for 5 seconds
      setTimeout(async () => {
        const results = await PerformanceMonitor.endBenchmark({ name: 'realtime_performance_test' });
        setIsMeasuringPerformance(false);
        
        // Show results
        Alert.alert(
          'Performance Test Results',
          `Memory Usage: ${results.memoryUsage?.toFixed(2) || 'N/A'} MB\nCPU Usage: ${results.cpuUsage?.toFixed(2) || 'N/A'}%\nBattery Impact: ${results.batteryDrain?.toFixed(2) || 'N/A'}%`,
          [{ text: 'OK' }]
        );
      }, 5000);
    } catch (error) {
      console.error('Performance test failed:', error);
      setIsMeasuringPerformance(false);
    }
  };

  // Format battery level as percentage
  const formatBatteryLevel = (level: number) => {
    return `${Math.round(level * 100)}%`;
  };

  // Get battery state text
  const getBatteryStateText = (state: Battery.BatteryState) => {
    switch (state) {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['right', 'left']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.text} 
              onPress={() => router.back()} 
            />
            <Text style={[styles.title, { color: colors.text }]}>Real-Time Updates</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage real-time updates and optimize performance
          </Text>
        </View>

        {/* Master toggle */}
        <Card style={styles.section}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Enable Real-Time Updates</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Turn on/off all real-time updates and notifications
              </ThemedText>
            </View>
            <Switch
              value={realtimeEnabled}
              onValueChange={toggleAllRealTimeFeatures}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : realtimeEnabled ? '#10B981' : '#F4F3F4'}
            />
          </View>
        </Card>

        {/* Real-time update preferences */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Update Types</ThemedText>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Delivery Location Updates</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Get real-time updates on delivery personnel location
              </ThemedText>
            </View>
            <Switch
              value={preferences.deliveryLocationUpdates}
              onValueChange={() => togglePreference('deliveryLocationUpdates')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.deliveryLocationUpdates ? '#10B981' : '#F4F3F4'}
              disabled={!realtimeEnabled}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Collection Status Updates</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Get real-time updates on collection status changes
              </ThemedText>
            </View>
            <Switch
              value={preferences.collectionStatusUpdates}
              onValueChange={() => togglePreference('collectionStatusUpdates')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.collectionStatusUpdates ? '#10B981' : '#F4F3F4'}
              disabled={!realtimeEnabled}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Personnel Assignment</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Get notifications when personnel are assigned to your collection
              </ThemedText>
            </View>
            <Switch
              value={preferences.personnelAssignmentNotifications}
              onValueChange={() => togglePreference('personnelAssignmentNotifications')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.personnelAssignmentNotifications ? '#10B981' : '#F4F3F4'}
              disabled={!realtimeEnabled}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Route Changes</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Get notifications when collection routes are changed
              </ThemedText>
            </View>
            <Switch
              value={preferences.routeChangeNotifications}
              onValueChange={() => togglePreference('routeChangeNotifications')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.routeChangeNotifications ? '#10B981' : '#F4F3F4'}
              disabled={!realtimeEnabled}
            />
          </View>
        </Card>

        {/* Performance optimization settings */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Performance Optimization</ThemedText>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Battery Optimization</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Reduce update frequency when battery is low
              </ThemedText>
            </View>
            <Switch
              value={preferences.batteryOptimizationEnabled}
              onValueChange={() => togglePreference('batteryOptimizationEnabled')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.batteryOptimizationEnabled ? '#10B981' : '#F4F3F4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Data Usage Optimization</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Reduce data usage for real-time updates
              </ThemedText>
            </View>
            <Switch
              value={preferences.dataUsageOptimization}
              onValueChange={() => togglePreference('dataUsageOptimization')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.dataUsageOptimization ? '#10B981' : '#F4F3F4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>Background Updates</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Allow updates when app is in background
              </ThemedText>
            </View>
            <Switch
              value={preferences.backgroundUpdates}
              onValueChange={() => togglePreference('backgroundUpdates')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.backgroundUpdates ? '#10B981' : '#F4F3F4'}
              disabled={!realtimeEnabled}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceTextContainer}>
              <ThemedText style={styles.preferenceTitle}>High Accuracy Location</ThemedText>
              <ThemedText style={styles.preferenceDescription}>
                Use high-accuracy GPS (uses more battery)
              </ThemedText>
            </View>
            <Switch
              value={preferences.highAccuracyLocation}
              onValueChange={() => togglePreference('highAccuracyLocation')}
              trackColor={{ false: '#CCCCCC', true: '#34D399' }}
              thumbColor={Platform.OS === 'ios' ? undefined : preferences.highAccuracyLocation ? '#10B981' : '#F4F3F4'}
              disabled={!realtimeEnabled}
            />
          </View>
        </Card>

        {/* Current device status */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Device Status</ThemedText>
          
          <View style={styles.deviceStatusItem}>
            <View style={styles.deviceStatusRow}>
              <Ionicons name="battery-full" size={24} color={colors.primary} />
              <ThemedText style={styles.deviceStatusLabel}>Battery Level:</ThemedText>
              <ThemedText style={styles.deviceStatusValue}>{formatBatteryLevel(batteryLevel)} ({getBatteryStateText(batteryState)})</ThemedText>
            </View>
          </View>

          <View style={styles.deviceStatusItem}>
            <View style={styles.deviceStatusRow}>
              <Ionicons name="hardware-chip" size={24} color={colors.primary} />
              <ThemedText style={styles.deviceStatusLabel}>Device:</ThemedText>
              <ThemedText style={styles.deviceStatusValue}>{Device.deviceName || 'Unknown Device'}</ThemedText>
            </View>
          </View>
        </Card>

        {/* Performance testing */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Performance Analysis</ThemedText>
          
          <View style={styles.analyzeButtonContainer}>
            <Button 
              title={isMeasuringPerformance ? "Running test..." : "Analyze Performance Impact"} 
              onPress={startPerformanceTest}
              disabled={isMeasuringPerformance}
              style={styles.analyzeButton}
            />
            <ThemedText style={styles.analyzeDescription}>
              Measures the impact of real-time updates on your device performance and battery
            </ThemedText>
          </View>
        </Card>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <ThemedText style={styles.infoText}>
            Real-time updates may affect battery life and data usage. Adjusting the settings above can help optimize performance.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  preferenceTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoContainer: {
    margin: 16,
    padding: 12,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  deviceStatusItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceStatusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    width: 120,
  },
  deviceStatusValue: {
    fontSize: 16,
    flex: 1,
  },
  analyzeButtonContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeButton: {
    width: '100%',
    marginBottom: 8,
  },
  analyzeDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
}); 