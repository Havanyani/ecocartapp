/**
 * AnalyticsDashboard.tsx
 * 
 * Dashboard displaying recycling metrics and impact data with charts.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import useNetworkStatus from '@/hooks/useNetworkStatus';

const screenWidth = Dimensions.get('window').width;

type TimeRange = 'week' | 'month' | 'year';
type MetricType = 'weight' | 'items' | 'co2' | 'water';

interface AnalyticsData {
  summary: {
    totalItems: number;
    totalWeight: number;
    co2Saved: number;
    waterSaved: number;
  };
  trends: {
    [key in TimeRange]: {
      labels: string[];
      datasets: {
        [key in MetricType]: number[];
      };
    };
  };
  materials: {
    name: string;
    count: number;
    weight: number;
  }[];
}

interface AnalyticsDashboardProps {
  navigation: any;
}

export default function AnalyticsDashboard({ navigation }: AnalyticsDashboardProps) {
  const { isOnline } = useNetworkStatus();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [metricType, setMetricType] = useState<MetricType>('weight');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // Simulate API call with timeout
      setTimeout(() => {
        const mockData: AnalyticsData = {
          summary: {
            totalItems: 87,
            totalWeight: 32.5,
            co2Saved: 12.8,
            waterSaved: 560
          },
          trends: {
            week: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: {
                weight: [2.1, 1.5, 3.2, 0, 2.7, 1.9, 3.8],
                items: [5, 3, 7, 0, 6, 4, 8],
                co2: [0.8, 0.6, 1.2, 0, 1.0, 0.7, 1.4],
                water: [40, 30, 60, 0, 50, 35, 70]
              }
            },
            month: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              datasets: {
                weight: [7.5, 9.2, 8.1, 7.7],
                items: [16, 22, 19, 18],
                co2: [2.8, 3.4, 3.0, 2.9],
                water: [140, 170, 150, 145]
              }
            },
            year: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: {
                weight: [20.5, 22.1, 25.6, 28.4, 30.2, 32.5],
                items: [45, 48, 55, 62, 70, 87],
                co2: [7.6, 8.2, 9.5, 10.5, 11.2, 12.8],
                water: [320, 350, 400, 450, 500, 560]
              }
            }
          },
          materials: [
            { name: 'Plastic', count: 32, weight: 12.5 },
            { name: 'Paper', count: 25, weight: 8.2 },
            { name: 'Glass', count: 15, weight: 9.7 },
            { name: 'Metal', count: 10, weight: 2.1 }
          ]
        };
        
        setData(mockData);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      setIsLoading(false);
    }
  };
  
  const getMetricLabel = (metric: MetricType): string => {
    switch (metric) {
      case 'weight':
        return 'kg';
      case 'items':
        return 'items';
      case 'co2':
        return 'kg CO₂';
      case 'water':
        return 'L water';
      default:
        return '';
    }
  };
  
  const getTimeRangeTitle = (range: TimeRange): string => {
    switch (range) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return '';
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchAnalyticsData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  if (!data) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Impact</Text>
          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="trash-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{data.summary.totalItems}</Text>
              <Text style={styles.summaryLabel}>Items Recycled</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="scale-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{data.summary.totalWeight} kg</Text>
              <Text style={styles.summaryLabel}>Total Weight</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="leaf-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{data.summary.co2Saved} kg</Text>
              <Text style={styles.summaryLabel}>CO₂ Saved</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="water-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{data.summary.waterSaved} L</Text>
              <Text style={styles.summaryLabel}>Water Saved</Text>
            </View>
          </View>
        </View>
        
        {/* Time Range Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recycling Trends</Text>
          <View style={styles.timeRangeSelector}>
            <TouchableOpacity 
              style={[
                styles.timeRangeButton,
                timeRange === 'week' && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange('week')}
            >
              <Text 
                style={[
                  styles.timeRangeButtonText,
                  timeRange === 'week' && styles.timeRangeButtonTextActive
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeRangeButton,
                timeRange === 'month' && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange('month')}
            >
              <Text 
                style={[
                  styles.timeRangeButtonText,
                  timeRange === 'month' && styles.timeRangeButtonTextActive
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeRangeButton,
                timeRange === 'year' && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange('year')}
            >
              <Text 
                style={[
                  styles.timeRangeButtonText,
                  timeRange === 'year' && styles.timeRangeButtonTextActive
                ]}
              >
                Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Metric Selector */}
        <View style={styles.metricSelector}>
          <TouchableOpacity 
            style={[
              styles.metricButton,
              metricType === 'weight' && styles.metricButtonActive
            ]}
            onPress={() => setMetricType('weight')}
          >
            <Text 
              style={[
                styles.metricButtonText,
                metricType === 'weight' && styles.metricButtonTextActive
              ]}
            >
              Weight
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.metricButton,
              metricType === 'items' && styles.metricButtonActive
            ]}
            onPress={() => setMetricType('items')}
          >
            <Text 
              style={[
                styles.metricButtonText,
                metricType === 'items' && styles.metricButtonTextActive
              ]}
            >
              Items
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.metricButton,
              metricType === 'co2' && styles.metricButtonActive
            ]}
            onPress={() => setMetricType('co2')}
          >
            <Text 
              style={[
                styles.metricButtonText,
                metricType === 'co2' && styles.metricButtonTextActive
              ]}
            >
              CO₂
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.metricButton,
              metricType === 'water' && styles.metricButtonActive
            ]}
            onPress={() => setMetricType('water')}
          >
            <Text 
              style={[
                styles.metricButtonText,
                metricType === 'water' && styles.metricButtonTextActive
              ]}
            >
              Water
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Line Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {getTimeRangeTitle(timeRange)} • {getMetricLabel(metricType)}
          </Text>
          <LineChart
            data={{
              labels: data.trends[timeRange].labels,
              datasets: [
                {
                  data: data.trends[timeRange].datasets[metricType]
                }
              ]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: metricType === 'items' ? 0 : 1,
              color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#34C759'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
        
        {/* Materials Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials Breakdown</Text>
          <View style={styles.materialsContainer}>
            {data.materials.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialMetrics}>
                    {material.count} items • {material.weight} kg
                  </Text>
                </View>
                <View style={styles.materialPercentage}>
                  <Text style={styles.percentageText}>
                    {Math.round((material.weight / data.summary.totalWeight) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Materials by Weight (kg)</Text>
          <BarChart
            data={{
              labels: data.materials.map(m => m.name),
              datasets: [
                {
                  data: data.materials.map(m => m.weight)
                }
              ]
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              style: {
                borderRadius: 16
              },
              barPercentage: 0.7
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
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
  container: {
    flex: 1,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24
  },
  retryButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4
  },
  summaryContainer: {
    marginBottom: 24
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3FFF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center'
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  timeRangeButtonTextActive: {
    color: '#2C3E50',
    fontWeight: '600'
  },
  metricSelector: {
    flexDirection: 'row',
    marginBottom: 16
  },
  metricButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8
  },
  metricButtonActive: {
    backgroundColor: '#E3FFF1'
  },
  metricButtonText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  metricButtonTextActive: {
    color: '#34C759',
    fontWeight: '600'
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  materialsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden'
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  materialInfo: {
    flex: 1
  },
  materialName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4
  },
  materialMetrics: {
    fontSize: 14,
    color: '#8E8E93'
  },
  materialPercentage: {
    backgroundColor: '#E3FFF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759'
  }
}); 