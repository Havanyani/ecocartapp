import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

type EnergyUsageScreenProps = {
  navigation: StackNavigationProp<SmartHomeStackParamList, 'EnergyUsage'>;
};

interface DeviceEnergyData {
  id: string;
  name: string;
  currentUsage: number;
  isOn: boolean;
  usageTrend: 'up' | 'down' | 'stable';
  type: string;
}

export default function EnergyUsageScreen({ navigation }: EnergyUsageScreenProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCurrentUsage, setTotalCurrentUsage] = useState<number>(0);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(10000); // 10 kWh as default
  const [devices, setDevices] = useState<DeviceEnergyData[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // For real-time updates
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    loadEnergyData();
    
    // Set up polling for real-time updates
    refreshInterval.current = setInterval(() => {
      updateRealTimeData();
    }, 10000); // Update every 10 seconds
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);
  
  const loadEnergyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const smartHomeService = SmartHomeService.getInstance();
      
      // Get current energy usage
      const usageData = await smartHomeService.getCurrentEnergyUsage();
      setTotalCurrentUsage(usageData.totalCurrentUsage);
      setDailyUsage(usageData.dailyUsage);
      setDailyLimit(usageData.dailyLimit || 10000);
      
      // Get device-specific data
      const deviceData = await smartHomeService.getDeviceEnergyUsage();
      setDevices(deviceData);
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load energy usage data');
      setIsLoading(false);
    }
  };
  
  const updateRealTimeData = async () => {
    try {
      const smartHomeService = SmartHomeService.getInstance();
      
      // Update just the current values without full loading state
      const usageData = await smartHomeService.getCurrentEnergyUsage();
      setTotalCurrentUsage(usageData.totalCurrentUsage);
      setDailyUsage(usageData.dailyUsage);
      
      // Update device-specific data
      const deviceData = await smartHomeService.getDeviceEnergyUsage();
      setDevices(deviceData);
    } catch (err) {
      // Silent fail for background updates
      console.error('Failed to update real-time data:', err);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEnergyData();
    setRefreshing(false);
  };
  
  const formatPower = (watts: number) => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(1)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };
  
  const formatEnergy = (wattHours: number) => {
    if (wattHours >= 1000) {
      return `${(wattHours / 1000).toFixed(1)} kWh`;
    }
    return `${wattHours.toFixed(0)} Wh`;
  };
  
  const getDailyUsagePercentage = () => {
    return Math.min(100, Math.round((dailyUsage / dailyLimit) * 100));
  };
  
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return theme.colors.error;
    if (percentage > 70) return theme.colors.warning;
    return theme.colors.success;
  };
  
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': 
        return <Ionicons name="arrow-up" size={16} color={theme.colors.error} />;
      case 'down': 
        return <Ionicons name="arrow-down" size={16} color={theme.colors.success} />;
      case 'stable': 
        return <Ionicons name="remove" size={16} color={theme.colors.info} />;
    }
  };
  
  if (isLoading) {
    return <LoadingView message="Loading energy usage data..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadEnergyData} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.overviewCard}>
          <View style={styles.currentUsageSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.secondaryText }]}>
              Current Usage
            </Text>
            <View style={styles.currentUsageValue}>
              <Text style={[styles.powerValue, { color: theme.colors.primary }]}>
                {formatPower(totalCurrentUsage)}
              </Text>
              <Text style={[styles.realTimeLabel, { color: theme.colors.secondaryText }]}>
                REAL-TIME
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.dailyUsageSection}>
            <View style={styles.dailyUsageHeader}>
              <Text style={[styles.sectionLabel, { color: theme.colors.secondaryText }]}>
                Today's Usage
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('EnergyHistory')}
              >
                <Text style={{ color: theme.colors.primary }}>
                  View History
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <AnimatedCircularProgress
                size={120}
                width={12}
                fill={getDailyUsagePercentage()}
                tintColor={getProgressColor(getDailyUsagePercentage())}
                backgroundColor={theme.colors.border}
                rotation={0}
                lineCap="round"
              >
                {(fill) => (
                  <View style={styles.progressTextContainer}>
                    <Text style={[styles.progressPercentage, { color: theme.colors.text }]}>
                      {Math.round(fill)}%
                    </Text>
                    <Text style={{ color: theme.colors.secondaryText, fontSize: 12 }}>
                      of limit
                    </Text>
                  </View>
                )}
              </AnimatedCircularProgress>
              
              <View style={styles.dailyUsageDetails}>
                <View style={styles.usageDetail}>
                  <Text style={{ color: theme.colors.secondaryText }}>
                    Used
                  </Text>
                  <Text style={[styles.usageValue, { color: theme.colors.text }]}>
                    {formatEnergy(dailyUsage)}
                  </Text>
                </View>
                
                <View style={styles.usageDetail}>
                  <Text style={{ color: theme.colors.secondaryText }}>
                    Limit
                  </Text>
                  <Text style={[styles.usageValue, { color: theme.colors.text }]}>
                    {formatEnergy(dailyLimit)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.deviceSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Device Usage
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('EnergySavingTips')}
              style={[styles.tipsButton, { backgroundColor: theme.colors.primaryLight }]}
            >
              <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, marginLeft: 4 }}>
                Saving Tips
              </Text>
            </TouchableOpacity>
          </View>
          
          {devices.map(device => (
            <TouchableOpacity
              key={device.id}
              style={[styles.deviceCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('DeviceDetails', { deviceId: device.id })}
            >
              <View style={styles.deviceInfo}>
                <View style={styles.deviceNameRow}>
                  <Text 
                    style={[
                      styles.deviceName, 
                      { color: device.isOn ? theme.colors.text : theme.colors.secondaryText }
                    ]}
                  >
                    {device.name}
                  </Text>
                  <View 
                    style={[
                      styles.statusIndicator, 
                      { backgroundColor: device.isOn ? theme.colors.success : theme.colors.border }
                    ]} 
                  />
                </View>
                
                <Text style={{ color: theme.colors.secondaryText }}>
                  {device.type}
                </Text>
              </View>
              
              <View style={styles.deviceUsage}>
                <View style={styles.usageTrend}>
                  {getTrendIcon(device.usageTrend)}
                </View>
                <Text 
                  style={[
                    styles.deviceUsageValue,
                    { 
                      color: device.isOn ? 
                        (device.usageTrend === 'up' ? theme.colors.error : theme.colors.text) : 
                        theme.colors.secondaryText 
                    }
                  ]}
                >
                  {formatPower(device.currentUsage)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.automationButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AutomationRules')}
        >
          <Ionicons name="flash-outline" size={20} color={theme.colors.white} />
          <Text style={[styles.automationButtonText, { color: theme.colors.white }]}>
            Create Energy Saving Automation
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  overviewCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    marginBottom: 20,
  },
  currentUsageSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentUsageValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  powerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  realTimeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 16,
  },
  dailyUsageSection: {
    
  },
  dailyUsageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyUsageDetails: {
    marginLeft: 20,
    flex: 1,
  },
  usageDetail: {
    marginBottom: 8,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceUsage: {
    alignItems: 'flex-end',
  },
  usageTrend: {
    marginBottom: 4,
  },
  deviceUsageValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  automationButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  automationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 