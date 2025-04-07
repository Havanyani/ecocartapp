/**
 * WebPerformanceDashboard.tsx
 * 
 * A dashboard component for visualizing web-specific performance metrics.
 * Shows Core Web Vitals, navigation timing, and performance recommendations.
 */

import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import React, { useCallback } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useWebVitals } from './hooks/useWebVitals';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';

interface WebPerformanceDashboardProps {
  refreshInterval?: number;
}

/**
 * Formats milliseconds into a readable string
 */
const formatMs = (ms: number): string => {
  if (ms < 1) return '< 1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

/**
 * Get color for performance rating
 */
const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'good':
      return '#4caf50';
    case 'needs-improvement':
      return '#ff9800';
    case 'poor':
      return '#f44336';
    default:
      return '#757575';
  }
};

export function WebPerformanceDashboard({ refreshInterval = 30000 }: WebPerformanceDashboardProps): JSX.Element | null {
  const { data, isLoading, error, refresh } = useWebVitals(refreshInterval);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Only show on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  // Prepare chart data
  const chartData = {
    labels: data.webVitals.map(vital => vital.name),
    datasets: [
      {
        data: data.webVitals.map(vital => vital.value),
        color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      testID="web-performance-dashboard"
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Web Performance</ThemedText>
        <View style={styles.scoreContainer}>
          <ThemedText style={styles.scoreText}>Score</ThemedText>
          <View 
            style={[
              styles.scoreCircle, 
              { 
                backgroundColor: 
                  data.performanceScore >= 90 ? '#4caf50' : 
                  data.performanceScore >= 50 ? '#ff9800' : '#f44336' 
              }
            ]}
          >
            <ThemedText style={styles.score}>{data.performanceScore}</ThemedText>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error loading web vitals: {error.message}</ThemedText>
          <HapticTab onPress={refresh} style={styles.retryButton}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </HapticTab>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Core Web Vitals</ThemedText>
            <View style={styles.vitalsGrid}>
              {data.webVitals.map((vital) => (
                <View key={vital.name} style={styles.vitalCard}>
                  <ThemedText style={styles.vitalName}>{vital.name}</ThemedText>
                  <ThemedText style={[styles.vitalValue, { color: getRatingColor(vital.rating) }]}>
                    {formatMs(vital.value)}
                  </ThemedText>
                  <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(vital.rating) }]}>
                    <ThemedText style={styles.ratingText}>{vital.rating}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {data.navigationTiming && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Navigation Timing</ThemedText>
              <View style={styles.timingContainer}>
                <PerformanceMetricsCard
                  title="Server Response"
                  value={formatMs(data.navigationTiming.ttfb)}
                  description="Time to First Byte"
                />
                <PerformanceMetricsCard
                  title="Network"
                  value={formatMs(data.navigationTiming.dns + data.navigationTiming.tcp)}
                  description="DNS + TCP Connection"
                />
                <PerformanceMetricsCard
                  title="DOM Ready"
                  value={formatMs(data.navigationTiming.domComplete)}
                  description="DOM Fully Loaded"
                />
              </View>
            </View>
          )}

          {data.webVitals.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Performance Chart</ThemedText>
              <PerformanceMetricsChart data={chartData} />
            </View>
          )}

          {data.recommendations.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Recommendations</ThemedText>
              {data.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendation}>
                  <View style={styles.recommendationBullet} />
                  <ThemedText style={styles.recommendationText}>{recommendation}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  vitalName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  timingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9800',
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: '#424242',
    fontWeight: 'bold',
  },
});

export default WebPerformanceDashboard; 