import useNetworkStatus from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';
import { PerformanceMonitorService } from '@/services/PerformanceMonitorService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

type TimeRange = 'week' | 'month' | 'year';
type MetricType = 'weight' | 'items' | 'co2' | 'water';

/**
 * Analytics Dashboard Screen
 * Provides insights on collection analytics, environmental impact,
 * user engagement, and performance monitoring with visual charts
 */
export default function AnalyticsDashboardScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [metricType, setMetricType] = useState<MetricType>('weight');
  const [environmentalData, setEnvironmentalData] = useState({
    summary: {
      totalItems: 0,
      totalWeight: 0,
      co2Saved: 0,
      waterSaved: 0
    },
    trends: {
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: {
          weight: [0, 0, 0, 0, 0, 0, 0],
          items: [0, 0, 0, 0, 0, 0, 0],
          co2: [0, 0, 0, 0, 0, 0, 0],
          water: [0, 0, 0, 0, 0, 0, 0]
        }
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: {
          weight: [0, 0, 0, 0],
          items: [0, 0, 0, 0],
          co2: [0, 0, 0, 0],
          water: [0, 0, 0, 0]
        }
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: {
          weight: [0, 0, 0, 0, 0, 0],
          items: [0, 0, 0, 0, 0, 0],
          co2: [0, 0, 0, 0, 0, 0],
          water: [0, 0, 0, 0, 0, 0]
        }
      }
    },
    materials: [
      { name: 'Plastic', count: 0, weight: 0 },
      { name: 'Paper', count: 0, weight: 0 },
      { name: 'Glass', count: 0, weight: 0 },
      { name: 'Metal', count: 0, weight: 0 }
    ]
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    appCrashRate: 0,
    avgApiResponseTimeMs: 0,
    avgScreenLoadTimeMs: 0,
    networkErrorRate: 0,
    batteryUsagePercentage: 0
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch environmental impact data - mock data until real service is implemented
      const impact = {
        summary: {
          totalItems: 145,
          totalWeight: 78.5,
          co2Saved: 156.2,
          waterSaved: 3420
        },
        trends: {
          week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: {
              weight: [5.2, 4.8, 6.1, 3.9, 7.2, 8.4, 6.7],
              items: [10, 8, 12, 7, 15, 18, 14],
              co2: [12.4, 11.5, 14.6, 9.3, 17.2, 20.1, 16.0],
              water: [240, 220, 280, 180, 330, 390, 310]
            }
          },
          month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: {
              weight: [32.5, 28.7, 35.6, 40.2],
              items: [65, 57, 71, 80],
              co2: [77.8, 68.8, 85.3, 96.2],
              water: [1500, 1320, 1640, 1850]
            }
          },
          year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: {
              weight: [120, 135, 110, 142, 156, 145],
              items: [240, 270, 220, 284, 312, 290],
              co2: [288, 324, 264, 341, 374, 348],
              water: [5500, 6200, 5100, 6500, 7200, 6700]
            }
          }
        },
        materials: [
          { name: 'Plastic', count: 78, weight: 32.5 },
          { name: 'Paper', count: 42, weight: 18.7 },
          { name: 'Glass', count: 15, weight: 21.3 },
          { name: 'Metal', count: 10, weight: 6.0 }
        ]
      };
      setEnvironmentalData(impact);
      
      // Fetch performance metrics
      const performance = await PerformanceMonitorService.getPerformanceMetrics();
      setPerformanceMetrics(performance);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics & Reports</Text>
        {!isOnline && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/analytics/reports')}
        >
          <Ionicons name="document-text-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
      
      {/* Analytics Navigation Cards */}
      <View style={styles.analyticsNavContainer}>
        <TouchableOpacity 
          style={styles.analyticsNavCard}
          onPress={() => router.push('/analytics/eco-impact')}
        >
          <View style={[styles.analyticsNavIcon, { backgroundColor: '#34C759' + '20' }]}>
            <Ionicons name="leaf-outline" size={28} color="#34C759" />
          </View>
          <Text style={styles.analyticsNavTitle}>Environmental Impact</Text>
          <Text style={styles.analyticsNavDescription}>
            Track your carbon footprint, water savings, and material impact
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.analyticsNavCard}
          onPress={() => router.push('/analytics/collections')}
        >
          <View style={[styles.analyticsNavIcon, { backgroundColor: '#2196F3' + '20' }]}>
            <Ionicons name="cube-outline" size={28} color="#2196F3" />
          </View>
          <Text style={styles.analyticsNavTitle}>Collection Analytics</Text>
          <Text style={styles.analyticsNavDescription}>
            Analyze collection trends, materials, and locations
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.analyticsNavCard}
          onPress={() => router.push('/analytics/engagement')}
        >
          <View style={[styles.analyticsNavIcon, { backgroundColor: '#007AFF' + '20' }]}>
            <Ionicons name="people-outline" size={28} color="#007AFF" />
          </View>
          <Text style={styles.analyticsNavTitle}>User Engagement</Text>
          <Text style={styles.analyticsNavDescription}>
            Analyze user activity, retention, and feature usage
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.analyticsNavCard}
          onPress={() => router.push('/analytics/performance')}
        >
          <View style={[styles.analyticsNavIcon, { backgroundColor: '#FF9800' + '20' }]}>
            <Ionicons name="speedometer-outline" size={28} color="#FF9800" />
          </View>
          <Text style={styles.analyticsNavTitle}>Performance Monitoring</Text>
          <Text style={styles.analyticsNavDescription}>
            Monitor app performance and optimize experience
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="trash-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{environmentalData.summary.totalItems}</Text>
              <Text style={styles.summaryLabel}>Items Recycled</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="scale-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{environmentalData.summary.totalWeight} kg</Text>
              <Text style={styles.summaryLabel}>Total Weight</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="leaf-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{environmentalData.summary.co2Saved} kg</Text>
              <Text style={styles.summaryLabel}>CO₂ Saved</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="water-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.summaryValue}>{environmentalData.summary.waterSaved} L</Text>
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
              labels: environmentalData.trends[timeRange].labels,
              datasets: [
                {
                  data: environmentalData.trends[timeRange].datasets[metricType]
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
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#34C759'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
        
        {/* Materials Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials Breakdown</Text>
          <View style={styles.materialsContainer}>
            {environmentalData.materials.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialMetrics}>
                    {material.count} items • {material.weight} kg
                  </Text>
                </View>
                <View style={styles.materialPercentage}>
                  <Text style={styles.percentageText}>
                    {Math.round((material.weight / environmentalData.summary.totalWeight) * 100 || 0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Environmental Impact Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Impact</Text>
          <Text style={styles.impactText}>
            Your recycling efforts have saved the equivalent of:
          </Text>
          <View style={styles.impactStats}>
            <View style={styles.impactItem}>
              <View style={styles.impactIconContainer}>
                <Ionicons name="leaf" size={24} color="#34C759" />
              </View>
              <Text style={styles.impactValue}>
                {Math.round(environmentalData.summary.co2Saved * 2.5)} kg
              </Text>
              <Text style={styles.impactLabel}>CO₂ Emissions</Text>
            </View>
            
            <View style={styles.impactItem}>
              <View style={styles.impactIconContainer}>
                <Ionicons name="water" size={24} color="#34C759" />
              </View>
              <Text style={styles.impactValue}>
                {Math.round(environmentalData.summary.waterSaved * 3.2)} L
              </Text>
              <Text style={styles.impactLabel}>Water Usage</Text>
            </View>
            
            <View style={styles.impactItem}>
              <View style={styles.impactIconContainer}>
                <Ionicons name="flash" size={24} color="#34C759" />
              </View>
              <Text style={styles.impactValue}>
                {Math.round(environmentalData.summary.totalWeight * 4.1)} kWh
              </Text>
              <Text style={styles.impactLabel}>Energy Saved</Text>
            </View>
          </View>
        </View>
        
        {/* Performance Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Monitoring</Text>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => router.push('/analytics/performance')}
            >
              <Text style={styles.moreButtonText}>More</Text>
              <Ionicons name="chevron-forward" size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.metricsCard}>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{performanceMetrics.appCrashRate}%</Text>
                <Text style={styles.metricLabel}>Crash Rate</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{performanceMetrics.avgApiResponseTimeMs} ms</Text>
                <Text style={styles.metricLabel}>API Response</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{performanceMetrics.avgScreenLoadTimeMs} ms</Text>
                <Text style={styles.metricLabel}>Screen Load</Text>
              </View>
            </View>
            
            <View style={styles.metricsDivider} />
            
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{performanceMetrics.networkErrorRate}%</Text>
                <Text style={styles.metricLabel}>Network Errors</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{performanceMetrics.batteryUsagePercentage}%</Text>
                <Text style={styles.metricLabel}>Battery Usage</Text>
              </View>
              
              <View style={styles.metricItem}>
                <TouchableOpacity 
                  style={styles.optimizeButton}
                  onPress={() => router.push('/analytics/optimize')}
                >
                  <Text style={styles.optimizeButtonText}>Optimize</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1
  },
  headerButton: {
    padding: 8
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4
  },
  content: {
    flex: 1,
    padding: 16
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
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
  },
  impactText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#8E8E93'
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  impactItem: {
    flex: 1,
    alignItems: 'center'
  },
  impactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3FFF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  impactLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center'
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
    marginRight: 4
  },
  metricsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93'
  },
  metricsDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16
  },
  optimizeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  optimizeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  analyticsNavContainer: {
    padding: 16,
    marginBottom: 8
  },
  analyticsNavCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  analyticsNavIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  analyticsNavTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  analyticsNavDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    width: '100%',
    marginLeft: 64,
    marginBottom: 8
  }
}); 