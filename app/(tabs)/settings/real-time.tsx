import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { ThemedText } from '@/components/ui/ThemedText';
import { useBatteryOptimizedUpdates } from '@/hooks/useBatteryOptimizedUpdates';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useTheme } from '@/hooks/useTheme';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface ThemeContextType {
  colors: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
  };
}

interface UseRealTimeUpdatesReturn {
  isEnabled: boolean;
  isConnected: boolean;
  enableRealTimeUpdates: () => Promise<void>;
  disableRealTimeUpdates: () => Promise<void>;
  subscribeToCollection: (id: string) => void;
  unsubscribeFromCollection: (id: string) => void;
}

export default function RealTimeSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme() as ThemeContextType;
  const [deviceBatteryLevel, setDeviceBatteryLevel] = useState<number | null>(null);
  const [deviceBatteryState, setDeviceBatteryState] = useState<Battery.BatteryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<{
    brand: string;
    model: string;
    osVersion: string;
  } | null>(null);

  const {
    isEnabled: isBatteryOptimizationEnabled,
    batteryState,
    updateInterval,
    toggleOptimization,
    setHighAccuracyMode,
    setBackgroundUpdates,
    locationAccuracySettings,
  } = useBatteryOptimizedUpdates();

  const {
    isEnabled: isRealTimeEnabled,
    isConnected,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
  } = useRealTimeUpdates() as UseRealTimeUpdatesReturn;

  const [notificationSettings, setNotificationSettings] = useState({
    deliveryStatusUpdates: true,
    locationUpdates: true,
    collectionUpdates: true,
    routeChanges: true,
  });

  const [lastPerformanceRating, setLastPerformanceRating] = useState<{
    score: number;
    messagesSent: number;
    messagesReceived: number;
    averageLatency: number;
    timestamp: Date;
  } | null>(null);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        setIsLoading(true);
        
        const benchmark = PerformanceMonitor.startBenchmark({
          name: 'settings_screen_load',
          includeMemory: true,
          tags: { component: 'RealTimeSettings' }
        });
        
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const batteryState = await Battery.getBatteryStateAsync();
        
        setDeviceBatteryLevel(batteryLevel * 100);
        setDeviceBatteryState(batteryState);
        
        const brand = Device.brand || 'Unknown';
        const modelName = Device.modelName || 'Unknown Device';
        const osVersion = `${Platform.OS} ${Platform.Version}`;
        
        setDeviceInfo({
          brand,
          model: modelName,
          osVersion,
        });
        
        setLastPerformanceRating({
          score: 87,
          messagesSent: 245,
          messagesReceived: 231,
          averageLatency: 324,
          timestamp: new Date(),
        });
        
        PerformanceMonitor.endBenchmark(benchmark, {
          name: 'settings_screen_load',
          includeMemory: true,
          tags: { component: 'RealTimeSettings' }
        });
      } catch (error) {
        console.error('Error loading device info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeviceInfo();
    
    const batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }: { batteryLevel: number }) => {
      setDeviceBatteryLevel(batteryLevel * 100);
    });
    
    const batteryStateSubscription = Battery.addBatteryStateListener(({ batteryState }: { batteryState: Battery.BatteryState }) => {
      setDeviceBatteryState(batteryState);
    });
    
    return () => {
      batterySubscription.remove();
      batteryStateSubscription.remove();
    };
  }, []);

  const handleToggleRealTimeUpdates = async (value: boolean) => {
    if (value) {
      await enableRealTimeUpdates();
    } else {
      await disableRealTimeUpdates();
    }
  };

  const handleToggleBatteryOptimization = async (value: boolean) => {
    await toggleOptimization(value);
  };

  const handleToggleHighAccuracy = async (value: boolean) => {
    await setHighAccuracyMode(value);
  };

  const handleToggleBackgroundUpdates = async (value: boolean) => {
    await setBackgroundUpdates(value);
  };

  const handleToggleNotificationSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const getBatteryIcon = () => {
    if (deviceBatteryState === Battery.BatteryState.CHARGING) {
      return { name: 'battery-charging', color: '#4CAF50' };
    }
    
    if (deviceBatteryLevel === null) return { name: 'battery-unknown', color: '#9E9E9E' };
    
    if (deviceBatteryLevel <= 20) return { name: 'battery-dead', color: '#F44336' };
    if (deviceBatteryLevel <= 30) return { name: 'battery-full', color: '#FF9800' };
    return { name: 'battery-full', color: '#4CAF50' };
  };

  const formatUpdateInterval = (interval: number) => {
    if (interval < 1000) return `${interval}ms`;
    return `${(interval / 1000).toFixed(1)}s`;
  };

  const getBatteryStateText = (state: Battery.BatteryState | null) => {
    switch (state) {
      case Battery.BatteryState.UNKNOWN:
        return 'Unknown';
      case Battery.BatteryState.UNPLUGGED:
        return 'Not Charging';
      case Battery.BatteryState.CHARGING:
        return 'Charging';
      case Battery.BatteryState.FULL:
        return 'Fully Charged';
      default:
        return 'Unknown';
    }
  };

  const getAccuracyText = (accuracy: number) => {
    switch (accuracy) {
      case 1:
        return 'Low Power';
      case 2:
        return 'Low';
      case 3:
        return 'Balanced Low';
      case 4:
        return 'Balanced';
      case 5:
        return 'Balanced High';
      case 6:
        return 'High';
      default:
        return 'Unknown';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const batteryIcon = getBatteryIcon();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerText}>Real-Time Settings</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="phone-portrait" size={22} color={colors.primary} />
            <ThemedText style={styles.cardTitle}>Device Information</ThemedText>
          </View>

          <View style={styles.deviceInfoContainer}>
            {deviceInfo && (
              <>
                <View style={styles.deviceInfoRow}>
                  <ThemedText style={styles.deviceInfoLabel}>Device:</ThemedText>
                  <ThemedText style={styles.deviceInfoValue}>
                    {deviceInfo.brand} {deviceInfo.model}
                  </ThemedText>
                </View>
                <View style={styles.deviceInfoRow}>
                  <ThemedText style={styles.deviceInfoLabel}>OS:</ThemedText>
                  <ThemedText style={styles.deviceInfoValue}>{deviceInfo.osVersion}</ThemedText>
                </View>
              </>
            )}
            <View style={styles.deviceInfoRow}>
              <ThemedText style={styles.deviceInfoLabel}>Battery:</ThemedText>
              <View style={styles.batteryContainer}>
                <Ionicons name={batteryIcon.name as any} size={18} color={batteryIcon.color} />
                <ThemedText style={[styles.deviceInfoValue, { color: batteryIcon.color }]}>
                  {deviceBatteryLevel !== null ? `${Math.round(deviceBatteryLevel)}%` : 'Unknown'}
                </ThemedText>
                <ThemedText style={styles.batteryState}>
                  ({getBatteryStateText(deviceBatteryState)})
                </ThemedText>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sync" size={22} color={colors.primary} />
            <ThemedText style={styles.cardTitle}>Real-Time Updates</ThemedText>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Enable Real-Time Updates</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Receive live updates for collections and deliveries
              </ThemedText>
            </View>
            <Switch
              value={isRealTimeEnabled}
              onValueChange={handleToggleRealTimeUpdates}
            />
          </View>

          {isRealTimeEnabled && (
            <>
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
                  <ThemedText style={styles.statusText}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </ThemedText>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="time-outline" size={16} color={colors.text} />
                  <ThemedText style={styles.statusText}>
                    Update interval: {formatUpdateInterval(updateInterval)}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingLabel}>Battery Optimization</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Adjust update frequency based on battery level
                  </ThemedText>
                </View>
                <Switch 
                  value={isBatteryOptimizationEnabled} 
                  onValueChange={handleToggleBatteryOptimization} 
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingLabel}>High Accuracy Mode</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Use more precise location tracking (higher battery usage)
                  </ThemedText>
                </View>
                <Switch 
                  value={locationAccuracySettings.accuracy > 4} 
                  onValueChange={handleToggleHighAccuracy} 
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingLabel}>Background Updates</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Continue receiving updates when app is in background
                  </ThemedText>
                </View>
                <Switch 
                  value={false} 
                  onValueChange={handleToggleBackgroundUpdates} 
                />
              </View>
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
            <ThemedText style={styles.cardTitle}>Notification Settings</ThemedText>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Delivery Status Updates</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Notifications when delivery status changes
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings.deliveryStatusUpdates}
              onValueChange={() => handleToggleNotificationSetting('deliveryStatusUpdates')}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Location Updates</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Notifications for delivery personnel location changes
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings.locationUpdates}
              onValueChange={() => handleToggleNotificationSetting('locationUpdates')}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Collection Updates</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Notifications for collection status changes
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings.collectionUpdates}
              onValueChange={() => handleToggleNotificationSetting('collectionUpdates')}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Route Changes</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Notifications when delivery routes are updated
              </ThemedText>
            </View>
            <Switch
              value={notificationSettings.routeChanges}
              onValueChange={() => handleToggleNotificationSetting('routeChanges')}
            />
          </View>
        </Card>

        {lastPerformanceRating && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={22} color={colors.primary} />
              <ThemedText style={styles.cardTitle}>Performance Analysis</ThemedText>
            </View>
            
            <View style={styles.performanceContainer}>
              <View style={styles.performanceScoreContainer}>
                <View 
                  style={[
                    styles.performanceScoreCircle, 
                    { borderColor: getPerformanceColor(lastPerformanceRating.score) }
                  ]}
                >
                  <ThemedText 
                    style={[
                      styles.performanceScoreText, 
                      { color: getPerformanceColor(lastPerformanceRating.score) }
                    ]}
                  >
                    {lastPerformanceRating.score}
                  </ThemedText>
                </View>
                <ThemedText style={styles.performanceLabel}>Performance Score</ThemedText>
              </View>
              
              <View style={styles.performanceMetrics}>
                <View style={styles.performanceMetricRow}>
                  <ThemedText style={styles.performanceMetricLabel}>Messages Sent:</ThemedText>
                  <ThemedText style={styles.performanceMetricValue}>
                    {lastPerformanceRating.messagesSent}
                  </ThemedText>
                </View>
                
                <View style={styles.performanceMetricRow}>
                  <ThemedText style={styles.performanceMetricLabel}>Messages Received:</ThemedText>
                  <ThemedText style={styles.performanceMetricValue}>
                    {lastPerformanceRating.messagesReceived}
                  </ThemedText>
                </View>
                
                <View style={styles.performanceMetricRow}>
                  <ThemedText style={styles.performanceMetricLabel}>Average Latency:</ThemedText>
                  <ThemedText style={styles.performanceMetricValue}>
                    {lastPerformanceRating.averageLatency}ms
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.analyzeButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/settings/performance')}
            >
              <ThemedText style={styles.analyzeButtonText}>Run Detailed Analysis</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </Card>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
            onPress={() => router.push('/notifications/history')}
          >
            <Ionicons name="list" size={20} color={colors.primary} />
            <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
              Notification History
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
            onPress={() => router.push('/settings/data-usage')}
          >
            <Ionicons name="cellular" size={20} color={colors.primary} />
            <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
              Data Usage
            </ThemedText>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  deviceInfoContainer: {
    marginBottom: 8,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deviceInfoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryState: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.7,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceScoreContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  performanceScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  performanceScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  performanceLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  performanceMetrics: {
    flex: 1,
  },
  performanceMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  performanceMetricLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  performanceMetricValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 