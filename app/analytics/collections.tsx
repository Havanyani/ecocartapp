import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

type TimeRange = 'week' | 'month' | 'year';
type ViewMode = 'overview' | 'trends' | 'materials' | 'locations';

interface CollectionData {
  timeRange: TimeRange;
  summary: {
    totalCollections: number;
    totalWeight: number;
    totalItems: number;
    averageWeightPerCollection: number;
  };
  trends: {
    labels: string[];
    collections: number[];
    weights: number[];
  };
  materials: {
    name: string;
    weight: number;
    percentage: number;
    color: string;
  }[];
  locations: {
    name: string;
    count: number;
    weight: number;
  }[];
}

/**
 * Collection Analytics Dashboard
 * 
 * Provides detailed collection analytics including:
 * - Collection trends over time
 * - Material breakdown
 * - Collection locations
 * - Weight metrics
 */
export default function CollectionAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CollectionData | null>(null);
  
  useEffect(() => {
    loadCollectionData();
  }, [timeRange]);
  
  const loadCollectionData = async () => {
    setIsLoading(true);
    
    // Simulating API call with mock data
    setTimeout(() => {
      // Mock data based on selected time range
      const mockData: CollectionData = {
        timeRange,
        summary: {
          totalCollections: timeRange === 'week' ? 5 : timeRange === 'month' ? 22 : 256,
          totalWeight: timeRange === 'week' ? 12.5 : timeRange === 'month' ? 54.3 : 642.7,
          totalItems: timeRange === 'week' ? 27 : timeRange === 'month' ? 115 : 1342,
          averageWeightPerCollection: timeRange === 'week' ? 2.5 : timeRange === 'month' ? 2.47 : 2.51
        },
        trends: {
          labels: timeRange === 'week' 
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : timeRange === 'month'
              ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
              : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          collections: timeRange === 'week'
            ? [1, 0, 1, 0, 2, 1, 0]
            : timeRange === 'month'
              ? [6, 5, 7, 4]
              : [18, 22, 19, 24, 21, 23, 20, 19, 25, 22, 21, 22],
          weights: timeRange === 'week'
            ? [2.5, 0, 3.2, 0, 4.1, 2.7, 0]
            : timeRange === 'month'
              ? [14.2, 12.8, 16.5, 10.8]
              : [48.2, 52.1, 46.8, 58.4, 51.3, 57.1, 49.7, 47.2, 61.5, 54.7, 52.3, 53.4]
        },
        materials: [
          { name: 'Plastic', weight: timeRange === 'week' ? 6.3 : timeRange === 'month' ? 27.1 : 321.4, percentage: 50, color: '#FF6384' },
          { name: 'Paper', weight: timeRange === 'week' ? 3.2 : timeRange === 'month' ? 13.6 : 160.7, percentage: 25, color: '#36A2EB' },
          { name: 'Glass', weight: timeRange === 'week' ? 1.9 : timeRange === 'month' ? 8.1 : 96.4, percentage: 15, color: '#FFCE56' },
          { name: 'Metal', weight: timeRange === 'week' ? 1.1 : timeRange === 'month' ? 5.5 : 64.2, percentage: 10, color: '#4BC0C0' }
        ],
        locations: [
          { name: 'Home', count: timeRange === 'week' ? 3 : timeRange === 'month' ? 13 : 153, weight: timeRange === 'week' ? 7.5 : timeRange === 'month' ? 32.6 : 385.6 },
          { name: 'Office', count: timeRange === 'week' ? 1 : timeRange === 'month' ? 5 : 61, weight: timeRange === 'week' ? 3.0 : timeRange === 'month' ? 13.0 : 154.2 },
          { name: 'Community Center', count: timeRange === 'week' ? 1 : timeRange === 'month' ? 4 : 42, weight: timeRange === 'week' ? 2.0 : timeRange === 'month' ? 8.7 : 102.9 }
        ]
      };
      
      setData(mockData);
      setIsLoading(false);
    }, 1500);
  };
  
  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeSelector}>
      {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange(range)}
        >
          <Text style={[styles.timeRangeButtonText, timeRange === range && styles.timeRangeButtonTextActive]}>
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.viewModeScroll}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'overview' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('overview')}
        >
          <Ionicons 
            name="stats-chart" 
            size={18} 
            color={viewMode === 'overview' ? '#FFFFFF' : '#007AFF'} 
            style={styles.viewModeIcon} 
          />
          <Text style={[styles.viewModeText, viewMode === 'overview' && styles.viewModeTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'trends' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('trends')}
        >
          <Ionicons 
            name="trending-up" 
            size={18} 
            color={viewMode === 'trends' ? '#FFFFFF' : '#007AFF'} 
            style={styles.viewModeIcon} 
          />
          <Text style={[styles.viewModeText, viewMode === 'trends' && styles.viewModeTextActive]}>
            Trends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'materials' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('materials')}
        >
          <Ionicons 
            name="layers" 
            size={18} 
            color={viewMode === 'materials' ? '#FFFFFF' : '#007AFF'} 
            style={styles.viewModeIcon} 
          />
          <Text style={[styles.viewModeText, viewMode === 'materials' && styles.viewModeTextActive]}>
            Materials
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'locations' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('locations')}
        >
          <Ionicons 
            name="location" 
            size={18} 
            color={viewMode === 'locations' ? '#FFFFFF' : '#007AFF'} 
            style={styles.viewModeIcon} 
          />
          <Text style={[styles.viewModeText, viewMode === 'locations' && styles.viewModeTextActive]}>
            Locations
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
  
  const renderSummaryCards = () => {
    if (!data) return null;
    
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.summaryValue}>{data.summary.totalCollections}</Text>
            <Text style={styles.summaryLabel}>Total Collections</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#2196F3' + '20' }]}>
              <Ionicons name="scale-outline" size={24} color="#2196F3" />
            </View>
            <Text style={styles.summaryValue}>{data.summary.totalWeight.toFixed(1)} kg</Text>
            <Text style={styles.summaryLabel}>Total Weight</Text>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="cube-outline" size={24} color="#FF9800" />
            </View>
            <Text style={styles.summaryValue}>{data.summary.totalItems}</Text>
            <Text style={styles.summaryLabel}>Total Items</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
              <Ionicons name="analytics-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.summaryValue}>{data.summary.averageWeightPerCollection.toFixed(1)} kg</Text>
            <Text style={styles.summaryLabel}>Avg. per Collection</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderTrendsChart = () => {
    if (!data) return null;
    
    const chartData = {
      labels: data.trends.labels,
      datasets: [
        {
          data: data.trends.weights,
          color: () => '#2196F3',
          strokeWidth: 2
        }
      ],
      legend: ['Weight (kg)']
    };
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Collection Weight Trends</Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: () => '#8E8E93',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#2196F3'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };
  
  const renderMaterialsChart = () => {
    if (!data) return null;
    
    const chartData = {
      labels: data.materials.map(m => m.name),
      datasets: [{
        data: data.materials.map(m => m.weight)
      }]
    };
    
    const chartDataPie = {
      labels: data.materials.map(m => m.name),
      data: data.materials.map(m => m.percentage / 100),
      colors: data.materials.map(m => m.color)
    };
    
    return (
      <View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Materials Breakdown</Text>
          <PieChart
            data={chartDataPie}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="data"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
        
        <View style={styles.materialsContainer}>
          {data.materials.map((material, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={[styles.materialColorIndicator, { backgroundColor: material.color }]} />
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{material.name}</Text>
                <Text style={styles.materialWeight}>{material.weight.toFixed(1)} kg</Text>
              </View>
              <Text style={styles.materialPercentage}>{material.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderLocationsChart = () => {
    if (!data) return null;
    
    const chartData = {
      labels: data.locations.map(l => l.name),
      datasets: [
        {
          data: data.locations.map(l => l.weight)
        }
      ]
    };
    
    return (
      <View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Collection Locations</Text>
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
              labelColor: () => '#8E8E93',
              barPercentage: 0.7,
            }}
            style={styles.chart}
          />
        </View>
        
        <View style={styles.locationsContainer}>
          {data.locations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <Ionicons name="location" size={24} color="#9C27B0" style={styles.locationIcon} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationMetrics}>
                  {location.count} collections • {location.weight.toFixed(1)} kg
                </Text>
              </View>
              <Text style={styles.locationPercentage}>
                {Math.round((location.weight / data.summary.totalWeight) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderContent = () => {
    if (!data) return null;
    
    switch (viewMode) {
      case 'overview':
        return (
          <>
            {renderSummaryCards()}
            {renderTrendsChart()}
          </>
        );
      case 'trends':
        return renderTrendsChart();
      case 'materials':
        return renderMaterialsChart();
      case 'locations':
        return renderLocationsChart();
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{
          title: "Collection Analytics",
          headerShown: true,
          headerBackTitle: "Analytics"
        }}
      />
      
      {renderTimeRangeSelector()}
      {renderViewModeSelector()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading collection data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7'
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF'
  },
  timeRangeButtonActive: {
    backgroundColor: '#2196F3'
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#2196F3'
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF'
  },
  viewModeContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  viewModeScroll: {
    paddingHorizontal: 16,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#F2F2F7'
  },
  viewModeButtonActive: {
    backgroundColor: '#007AFF'
  },
  viewModeIcon: {
    marginRight: 6
  },
  viewModeText: {
    fontSize: 14,
    color: '#007AFF'
  },
  viewModeTextActive: {
    color: '#FFFFFF'
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
  scrollView: {
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
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93'
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16
  },
  chart: {
    borderRadius: 16,
    marginLeft: -16
  },
  materialsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden'
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  materialColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12
  },
  materialInfo: {
    flex: 1
  },
  materialName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2
  },
  materialWeight: {
    fontSize: 14,
    color: '#8E8E93'
  },
  materialPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  locationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden'
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  locationIcon: {
    marginRight: 12
  },
  locationInfo: {
    flex: 1
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2
  },
  locationMetrics: {
    fontSize: 14,
    color: '#8E8E93'
  },
  locationPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0'
  }
}); 