import { useTheme } from '@/theme';
import { ChartData, MaterialData, MetricType, TimeFrame } from '@/types/analytics';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

// Component props interface
interface RecyclingDashboardProps {
  userData: {
    totalWeight: number;
    totalCollections: number;
    co2Saved: number;
    waterSaved: number;
    treesEquivalent: number;
    materialBreakdown: MaterialData[];
    historyData: {
      [key in TimeFrame]: ChartData;
    };
  };
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
  onMetricChange?: (metric: MetricType) => void;
  onExportData?: () => void;
}

export function RecyclingDashboard({
  userData,
  onTimeFrameChange,
  onMetricChange,
  onExportData
}: RecyclingDashboardProps) {
  const theme = useTheme()()();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [metric, setMetric] = useState<MetricType>('weight');
  const screenWidth = Dimensions.get('window').width - 32; // Adjust for padding

  // Handle time frame change
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    if (onTimeFrameChange) {
      onTimeFrameChange(newTimeFrame);
    }
  };

  // Handle metric change
  const handleMetricChange = (newMetric: MetricType) => {
    setMetric(newMetric);
    if (onMetricChange) {
      onMetricChange(newMetric);
    }
  };
  
  // Format numbers for display
  const formatNumber = (value: number, unit: string): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ${unit}`;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  // Get appropriate data based on selected time frame and metric
  const chartData = userData.historyData[timeFrame];
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => theme.colors.primary + (opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.colors.text + (opacity * 255).toString(16).padStart(2, '0'),
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16
    }
  };
  
  // Prepare pie chart data for material breakdown
  const pieChartData = userData.materialBreakdown.map((material, index) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];
    
    return {
      name: material.name,
      weight: material.value,
      color: colors[index % colors.length],
      legendFontColor: theme.colors.text,
      legendFontSize: 12
    };
  });

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="scale-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {formatNumber(userData.totalWeight, 'kg')}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text + '99' }]}>
            Total Recycled
          </Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {userData.totalCollections}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text + '99' }]}>
            Collections
          </Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="leaf-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {userData.treesEquivalent.toFixed(1)}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text + '99' }]}>
            Trees Saved
          </Text>
        </View>
      </View>
      
      {/* Environmental Impact Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Environmental Impact
          </Text>
          {onExportData && (
            <TouchableOpacity 
              style={styles.exportButton} 
              onPress={onExportData}
            >
              <Ionicons name="download-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.exportText, { color: theme.colors.primary }]}>Export</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.impactCardsContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.impactCard}>
            <Ionicons name="cloud-outline" size={24} color={theme.colors.success} />
            <Text style={[styles.impactValue, { color: theme.colors.text }]}>
              {formatNumber(userData.co2Saved, 'kg')}
            </Text>
            <Text style={[styles.impactLabel, { color: theme.colors.text + '99' }]}>
              CO₂ Saved
            </Text>
          </View>
          
          <View style={styles.impactCard}>
            <Ionicons name="water-outline" size={24} color="#36A2EB" />
            <Text style={[styles.impactValue, { color: theme.colors.text }]}>
              {formatNumber(userData.waterSaved, 'L')}
            </Text>
            <Text style={[styles.impactLabel, { color: theme.colors.text + '99' }]}>
              Water Saved
            </Text>
          </View>
          
          <View style={styles.impactCard}>
            <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
            <Text style={[styles.impactValue, { color: theme.colors.text }]}>
              {userData.treesEquivalent.toFixed(1)}
            </Text>
            <Text style={[styles.impactLabel, { color: theme.colors.text + '99' }]}>
              Trees Equivalent
            </Text>
          </View>
        </View>
      </View>
      
      {/* Time-based Recycling Trends */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recycling Trends
          </Text>
        </View>
        
        <View style={styles.timeFrameButtons}>
          <TouchableOpacity
            style={[
              styles.timeFrameButton,
              timeFrame === 'week' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleTimeFrameChange('week')}
          >
            <Text 
              style={[
                styles.timeFrameButtonText, 
                { color: timeFrame === 'week' ? theme.colors.primary : theme.colors.text + '99' }
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeFrameButton,
              timeFrame === 'month' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleTimeFrameChange('month')}
          >
            <Text 
              style={[
                styles.timeFrameButtonText, 
                { color: timeFrame === 'month' ? theme.colors.primary : theme.colors.text + '99' }
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeFrameButton,
              timeFrame === 'year' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleTimeFrameChange('year')}
          >
            <Text 
              style={[
                styles.timeFrameButtonText, 
                { color: timeFrame === 'year' ? theme.colors.primary : theme.colors.text + '99' }
              ]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricButtons}>
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'weight' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleMetricChange('weight')}
          >
            <Text 
              style={[
                styles.metricButtonText, 
                { color: metric === 'weight' ? theme.colors.primary : theme.colors.text + '99' }
              ]}
            >
              Weight
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'collections' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleMetricChange('collections')}
          >
            <Text 
              style={[
                styles.metricButtonText, 
                { color: metric === 'collections' ? theme.colors.primary : theme.colors.text + '99' }
              ]}
            >
              Collections
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'impact' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => handleMetricChange('impact')}
          >
            <Text 
              style={[
                styles.metricButtonText, 
                { color: metric === 'impact' ? theme.colors.primary : theme.colors.text + '99' }
              ]}
            >
              Impact
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
      
      {/* Material Breakdown */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Material Breakdown
          </Text>
        </View>
        
        <View style={styles.chartContainer}>
          <PieChart
            data={pieChartData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="weight"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
        
        <View style={styles.materialBarChart}>
          <BarChart
            data={{
              labels: userData.materialBreakdown.map(m => m.name),
              datasets: [
                {
                  data: userData.materialBreakdown.map(m => m.value)
                }
              ]
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="kg"
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 3
  },
  summaryIconContainer: {
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center'
  },
  sectionContainer: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  exportText: {
    marginLeft: 4,
    fontSize: 14
  },
  impactCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3
  },
  impactCard: {
    alignItems: 'center',
    flex: 1
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4
  },
  impactLabel: {
    fontSize: 12
  },
  timeFrameButtons: {
    flexDirection: 'row',
    marginBottom: 12
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8
  },
  timeFrameButtonText: {
    fontSize: 14
  },
  metricButtons: {
    flexDirection: 'row',
    marginBottom: 16
  },
  metricButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8
  },
  metricButtonText: {
    fontSize: 14
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 3
  },
  chart: {
    borderRadius: 16
  },
  materialBarChart: {
    alignItems: 'center',
    marginTop: 16
  }
}); 