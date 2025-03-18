import { PerformanceMonitorService } from '@/services/PerformanceMonitorService';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

type TimeRange = 'week' | 'month' | 'year';

/**
 * Performance Monitoring Dashboard
 * 
 * Visualizes app performance metrics including API response times,
 * screen load times, error rates, and battery usage with historical trends.
 */
export default function PerformanceDashboardScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  
  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);
  
  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      const currentMetrics = await PerformanceMonitorService.getPerformanceMetrics();
      const history = await PerformanceMonitorService.getPerformanceHistory(timeRange);
      const performanceAnalysis = await PerformanceMonitorService.getPerformanceAnalysis();
      
      setMetrics(currentMetrics);
      setHistoryData(history);
      setAnalysis(performanceAnalysis);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
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
  
  const renderMetricCards = () => {
    if (!metrics) return null;
    
    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#007AFF' + '20' }]}>
              <Ionicons name="timer-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.metricValue}>{metrics.avgApiResponseTimeMs.toFixed(0)} ms</Text>
            <Text style={styles.metricLabel}>API Response Time</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#5AC8FA' + '20' }]}>
              <Ionicons name="layers-outline" size={24} color="#5AC8FA" />
            </View>
            <Text style={styles.metricValue}>{metrics.avgScreenLoadTimeMs.toFixed(0)} ms</Text>
            <Text style={styles.metricLabel}>Screen Load Time</Text>
          </View>
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#FF3B30' + '20' }]}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
            </View>
            <Text style={styles.metricValue}>{metrics.appCrashRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Crash Rate</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#FF9500' + '20' }]}>
              <Ionicons name="battery-half-outline" size={24} color="#FF9500" />
            </View>
            <Text style={styles.metricValue}>{metrics.batteryUsagePercentage.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Battery Usage</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderApiResponseTimeChart = () => {
    if (!historyData) return null;
    
    const chartData = {
      labels: historyData.labels,
      datasets: [
        {
          data: historyData.apiResponseTimes,
          color: () => '#007AFF',
          strokeWidth: 2
        }
      ],
      legend: ['API Response Time (ms)']
    };
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>API Response Time</Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => '#8E8E93',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#007AFF'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };
  
  const renderScreenLoadTimeChart = () => {
    if (!historyData) return null;
    
    const chartData = {
      labels: historyData.labels,
      datasets: [
        {
          data: historyData.screenLoadTimes,
          color: () => '#5AC8FA',
          strokeWidth: 2
        }
      ],
      legend: ['Screen Load Time (ms)']
    };
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Screen Load Time</Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(90, 200, 250, ${opacity})`,
            labelColor: () => '#8E8E93',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#5AC8FA'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };
  
  const renderAnalysis = () => {
    if (!analysis) return null;
    
    return (
      <View style={styles.analysisContainer}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Performance Analysis</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{analysis.score}</Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>
        </View>
        
        <Text style={styles.analysisSummary}>{analysis.summary}</Text>
        
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Issues Found</Text>
          
          {analysis.issues.map((issue: any, index: number) => (
            <View key={index} style={styles.issueItem}>
              <View style={[
                styles.issueSeverityIndicator, 
                issue.severity === 'high' ? styles.highSeverity : 
                issue.severity === 'medium' ? styles.mediumSeverity : 
                styles.lowSeverity
              ]} />
              <Text style={styles.issueText}>{issue.description}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          
          {analysis.recommendations.map((recommendation: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={18} color="#34C759" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{
          title: "Performance Monitoring",
          headerShown: true,
          headerBackTitle: "Analytics"
        }}
      />
      
      {renderTimeRangeSelector()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading performance data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderMetricCards()}
          {renderApiResponseTimeChart()}
          {renderScreenLoadTimeChart()}
          {renderAnalysis()}
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
    backgroundColor: '#007AFF'
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#007AFF'
  },
  timeRangeButtonTextActive: {
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
  metricsContainer: {
    marginBottom: 24
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricCard: {
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
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  metricLabel: {
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
  analysisContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759'
  },
  scoreLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 2
  },
  analysisSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: '#8E8E93'
  },
  issuesContainer: {
    marginBottom: 16
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  issueSeverityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  highSeverity: {
    backgroundColor: '#FF3B30'
  },
  mediumSeverity: {
    backgroundColor: '#FF9500'
  },
  lowSeverity: {
    backgroundColor: '#FFCC00'
  },
  issueText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1
  },
  recommendationsContainer: {
    marginTop: 8
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1
  }
}); 