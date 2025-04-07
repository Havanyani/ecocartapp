import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { SmartHomeStackParamList } from '@/navigation/types';
import { SmartHomeService } from '@/services/smart-home/SmartHomeService';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

type EnergyHistoryScreenProps = {
  route: RouteProp<SmartHomeStackParamList, 'EnergyHistory'>;
  navigation: StackNavigationProp<SmartHomeStackParamList, 'EnergyHistory'>;
};

interface EnergyData {
  date: string;
  value: number;
  comparison?: number;
}

interface DeviceSummary {
  id: string;
  name: string;
  consumption: number;
  percentage: number;
}

export default function EnergyHistoryScreen({ route, navigation }: EnergyHistoryScreenProps) {
  const { deviceId } = route.params || {}; // deviceId is optional, if not provided show all devices
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [deviceSummaries, setDeviceSummaries] = useState<DeviceSummary[]>([]);
  const [totalUsage, setTotalUsage] = useState<number>(0);
  const [comparisonPercentage, setComparisonPercentage] = useState<number>(0);
  const [device, setDevice] = useState<any>(null);
  
  const screenWidth = Dimensions.get('window').width;
  
  useEffect(() => {
    loadEnergyData();
  }, [deviceId, selectedTimeframe]);
  
  const loadEnergyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const smartHomeService = SmartHomeService.getInstance();
      
      // If deviceId is provided, load data for specific device
      if (deviceId) {
        const deviceData = await smartHomeService.getDeviceById(deviceId);
        setDevice(deviceData);
        
        const energyHistory = await smartHomeService.getDeviceEnergyHistory(
          deviceId, 
          selectedTimeframe
        );
        setEnergyData(energyHistory.data);
        setTotalUsage(energyHistory.totalUsage);
        setComparisonPercentage(energyHistory.comparisonPercentage);
      } 
      // Otherwise load aggregate data for all devices
      else {
        const energyHistory = await smartHomeService.getHomeEnergyHistory(selectedTimeframe);
        setEnergyData(energyHistory.data);
        setTotalUsage(energyHistory.totalUsage);
        setComparisonPercentage(energyHistory.comparisonPercentage);
        
        // Get device-specific summaries
        const deviceData = await smartHomeService.getDeviceEnergySummaries(selectedTimeframe);
        setDeviceSummaries(deviceData);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load energy history');
      setIsLoading(false);
    }
  };
  
  const getChartData = () => {
    const labels = energyData.map(data => data.date);
    const data = energyData.map(data => data.value);
    const comparisonData = energyData.map(data => data.comparison || 0);
    
    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => theme.colors.primary, 
          strokeWidth: 2
        },
        {
          data: comparisonData,
          color: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`, 
          strokeWidth: 2,
          strokeDashArray: [5, 5] // dashed line for comparison
        }
      ],
      legend: ['Current', 'Previous']
    };
  };
  
  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return '';
    }
  };
  
  const formatEnergyValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} kWh`;
    }
    return `${value.toFixed(1)} Wh`;
  };
  
  const getComparisonLabel = () => {
    const timeframe = selectedTimeframe === 'day' ? 'yesterday' : 
                      selectedTimeframe === 'week' ? 'last week' :
                      selectedTimeframe === 'month' ? 'last month' : 'last year';
                      
    return comparisonPercentage >= 0 
      ? `${comparisonPercentage}% more than ${timeframe}` 
      : `${Math.abs(comparisonPercentage)}% less than ${timeframe}`;
  };
  
  if (isLoading) {
    return <LoadingView message="Loading energy history..." />;
  }
  
  if (error) {
    return <ErrorView message={error} onRetry={loadEnergyData} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {device ? device.name : 'Home'} Energy History
        </Text>
      </View>
      
      <View style={styles.timeframeTabs}>
        {['day', 'week', 'month', 'year'].map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeTab,
              selectedTimeframe === timeframe && { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary
              }
            ]}
            onPress={() => setSelectedTimeframe(timeframe as any)}
          >
            <Text 
              style={{ 
                color: selectedTimeframe === timeframe ? theme.colors.white : theme.colors.text 
              }}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
            {getTimeframeLabel()} Usage
          </Text>
          <Text style={[styles.usageValue, { color: theme.colors.primary }]}>
            {formatEnergyValue(totalUsage)}
          </Text>
          <Text 
            style={[
              styles.comparisonText, 
              { 
                color: comparisonPercentage > 0 ? theme.colors.error : theme.colors.success 
              }
            ]}
          >
            {getComparisonLabel()}
          </Text>
        </View>
        
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Energy Consumption
          </Text>
          
          {energyData.length > 0 ? (
            <LineChart
              data={getChartData()}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons 
                name="analytics-outline" 
                size={48} 
                color={theme.colors.secondaryText} 
              />
              <Text style={{ color: theme.colors.secondaryText, marginTop: 8 }}>
                No energy data available for this timeframe
              </Text>
            </View>
          )}
        </View>
        
        {!deviceId && deviceSummaries.length > 0 && (
          <View style={styles.devicesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Devices
            </Text>
            
            {deviceSummaries.map(device => (
              <TouchableOpacity
                key={device.id}
                style={[styles.deviceItem, { backgroundColor: theme.colors.card }]}
                onPress={() => navigation.navigate('EnergyHistory', { deviceId: device.id })}
              >
                <View style={styles.deviceInfo}>
                  <Text style={[styles.deviceName, { color: theme.colors.text }]}>
                    {device.name}
                  </Text>
                  <Text style={{ color: theme.colors.secondaryText }}>
                    {formatEnergyValue(device.consumption)}
                  </Text>
                </View>
                
                <View style={styles.deviceUsage}>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          backgroundColor: theme.colors.primary,
                          width: `${device.percentage}%`
                        }
                      ]}
                    />
                  </View>
                  <Text style={{ color: theme.colors.secondaryText }}>
                    {device.percentage}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {deviceId && (
          <TouchableOpacity
            style={[styles.tipCard, { backgroundColor: theme.colors.success + '20' }]}
            onPress={() => navigation.navigate('EnergySavingTips')}
          >
            <Ionicons 
              name="bulb-outline" 
              size={24} 
              color={theme.colors.success} 
              style={styles.tipIcon}
            />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: theme.colors.success }]}>
                Energy Saving Tips
              </Text>
              <Text style={{ color: theme.colors.text }}>
                Get tips on how to reduce energy consumption for this device
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeframeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  timeframeTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  usageValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 14,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    padding: 8,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  devicesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deviceItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deviceName: {
    fontWeight: '500',
  },
  deviceUsage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
}); 