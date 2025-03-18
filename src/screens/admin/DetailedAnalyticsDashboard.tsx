import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define time range and metric type
type TimeRange = 'day' | 'week' | 'month' | 'year';
type MetricType = 'users' | 'collections' | 'deliveries';

// Define interfaces for the analytics data
interface AnalyticsMetrics {
  totalPlastic: number;
  totalCredits: number;
  activeUsers: number;
  completedCollections: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface AnalyticsData {
  metrics: AnalyticsMetrics;
  plasticByDay: TimeSeriesData[];
  collectionsByRegion: Array<{
    region: string;
    collections: number;
  }>;
  userGrowth: TimeSeriesData[];
}

export default function DetailedAnalyticsDashboard(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalPlastic: 0,
    totalCredits: 0,
    activeUsers: 0,
    completedCollections: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demo purposes
      const mockData: AnalyticsData = {
        metrics: {
          totalPlastic: 1250,
          totalCredits: 12500,
          activeUsers: 423,
          completedCollections: 587,
        },
        plasticByDay: [
          { date: '2023-01-01', value: 45 },
          { date: '2023-01-02', value: 52 },
          { date: '2023-01-03', value: 48 },
          { date: '2023-01-04', value: 70 },
          { date: '2023-01-05', value: 61 },
          { date: '2023-01-06', value: 65 },
          { date: '2023-01-07', value: 75 },
        ],
        collectionsByRegion: [
          { region: 'North', collections: 145 },
          { region: 'South', collections: 126 },
          { region: 'East', collections: 187 },
          { region: 'West', collections: 129 },
        ],
        userGrowth: [
          { date: '2022-12-01', value: 320 },
          { date: '2023-01-01', value: 350 },
          { date: '2023-02-01', value: 385 },
          { date: '2023-03-01', value: 423 },
        ]
      };
      
      setMetrics(mockData.metrics);
      setAnalyticsData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: TimeRange): void => {
    setTimeRange(range);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchAnalytics}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
      </View>

      <View style={styles.timeRangeContainer}>
        {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.activeTimeRangeButton
            ]}
            onPress={() => handleTimeRangeChange(range)}
          >
            <Text 
              style={[
                styles.timeRangeButtonText,
                timeRange === range && styles.activeTimeRangeButtonText
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalPlastic}kg</Text>
          <Text style={styles.metricLabel}>Total Plastic Collected</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalCredits} pts</Text>
          <Text style={styles.metricLabel}>Credits Issued</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.activeUsers}</Text>
          <Text style={styles.metricLabel}>Active Users</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.completedCollections}</Text>
          <Text style={styles.metricLabel}>Collections</Text>
        </View>
      </View>

      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Plastic Collection Trends</Text>
        {analyticsData && (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Collection Trend Chart</Text>
          </View>
        )}
      </View>

      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Collections by Region</Text>
        {analyticsData && (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Regional Distribution Chart</Text>
          </View>
        )}
      </View>

      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>User Growth</Text>
        {analyticsData && (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>User Growth Chart</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  timeRangeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeTimeRangeButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2e7d32',
  },
  activeTimeRangeButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  metricCard: {
    width: '50%',
    padding: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
}); 