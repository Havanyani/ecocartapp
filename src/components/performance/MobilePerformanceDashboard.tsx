/**
 * MobilePerformanceDashboard.tsx
 * 
 * A dashboard component for visualizing mobile-specific performance metrics.
 * Shows frame rates, memory usage, and other critical mobile performance metrics.
 */

import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import React, { useCallback } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useMobileVitals } from './hooks/useMobileVitals';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';

interface MobilePerformanceDashboardProps {
  refreshInterval?: number;
  autoTrackFrames?: boolean;
}

/**
 * Formats values into readable strings with units
 */
const formatValue = (value: number, metric: string): string => {
  if (metric.includes('fps') || metric.includes('frame_rate')) {
    return `${value.toFixed(1)} FPS`;
  }
  if (metric.includes('percentage') || metric.includes('ratio')) {
    return `${value.toFixed(1)}%`;
  }
  if (metric.includes('memory') || metric.includes('heap')) {
    return `${value.toFixed(1)} MB`;
  }
  if (metric.includes('time') || metric.includes('duration')) {
    return value < 1000 ? `${value.toFixed(0)}ms` : `${(value / 1000).toFixed(1)}s`;
  }
  return value.toFixed(1);
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

export function MobilePerformanceDashboard({ 
  refreshInterval = 30000, 
  autoTrackFrames = false 
}: MobilePerformanceDashboardProps): JSX.Element | null {
  const { 
    data, 
    isLoading, 
    error, 
    refresh, 
    startFrameTracking, 
    stopFrameTracking 
  } = useMobileVitals(refreshInterval, autoTrackFrames);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Only show on mobile platforms
  if (Platform.OS === 'web') {
    return null;
  }

  // Set up frame tracking
  const handleTrackFrames = () => {
    startFrameTracking();
    setTimeout(() => {
      stopFrameTracking();
    }, 5000); // Track frames for 5 seconds
  };

  // Prepare memory metrics
  const memoryData = data.memoryMetrics ? {
    jsHeapSize: data.memoryMetrics.jsHeapSize / (1024 * 1024), // Convert to MB
  } : null;

  // Prepare frame metrics
  const frameData = {
    fps: data.frameMetrics.fps,
    jankPercentage: data.frameMetrics.totalFrames > 0 
      ? (data.frameMetrics.jankCount / data.frameMetrics.totalFrames) * 100 
      : 0,
  };

  // Prepare chart data
  const chartData = {
    labels: data.metrics.map(metric => metric.name.replace(/_/g, ' ')).slice(0, 5),
    datasets: [
      {
        data: data.metrics.map(metric => metric.value).slice(0, 5),
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
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
      testID="mobile-performance-dashboard"
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Mobile Performance</ThemedText>
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
          <ThemedText style={styles.errorText}>Error loading mobile performance: {error.message}</ThemedText>
          <HapticTab onPress={refresh} style={styles.retryButton}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </HapticTab>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Frame Rate</ThemedText>
              <HapticTab 
                style={styles.trackButton}
                onPress={handleTrackFrames}
              >
                <ThemedText style={styles.trackButtonText}>Track Now</ThemedText>
              </HapticTab>
            </View>
            <View style={styles.metricsContainer}>
              <PerformanceMetricsCard
                title="Frame Rate"
                value={`${frameData.fps.toFixed(1)} FPS`}
                description="Higher is better"
              />
              <PerformanceMetricsCard
                title="Jank"
                value={`${frameData.jankPercentage.toFixed(1)}%`}
                description="Lower is better"
                trend={frameData.jankPercentage < 5 ? 'up' : 'down'}
                trendValue={frameData.jankPercentage < 5 ? 'Good' : 'Needs Improvement'}
              />
              <PerformanceMetricsCard
                title="Status"
                value={frameData.fps >= 55 ? 'Smooth' : frameData.fps >= 45 ? 'Acceptable' : 'Poor'}
                description="Animation smoothness"
              />
            </View>
          </View>

          {memoryData && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Memory Usage</ThemedText>
              <View style={styles.metricsContainer}>
                <PerformanceMetricsCard
                  title="JS Heap"
                  value={`${memoryData.jsHeapSize.toFixed(1)} MB`}
                  description="Memory used by JavaScript"
                  trend={memoryData.jsHeapSize < 50 ? 'up' : 'down'}
                  trendValue={memoryData.jsHeapSize < 50 ? 'Good' : 'High'}
                />
                <PerformanceMetricsCard
                  title="Status"
                  value={memoryData.jsHeapSize < 50 ? 'Good' : memoryData.jsHeapSize < 100 ? 'Warning' : 'High'}
                  description="Memory usage level"
                />
              </View>
            </View>
          )}

          {data.metrics.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Performance Metrics</ThemedText>
              <View style={styles.metricsList}>
                {data.metrics.map((metric, index) => (
                  <View key={index} style={styles.metricItem}>
                    <View style={styles.metricNameContainer}>
                      <View 
                        style={[
                          styles.metricIndicator, 
                          { backgroundColor: getRatingColor(metric.rating) }
                        ]} 
                      />
                      <ThemedText style={styles.metricName}>
                        {metric.name.replace(/_/g, ' ')}
                      </ThemedText>
                    </View>
                    <ThemedText 
                      style={[
                        styles.metricValue, 
                        { color: getRatingColor(metric.rating) }
                      ]}
                    >
                      {formatValue(metric.value, metric.name)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {data.metrics.length > 0 && (
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trackButton: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  trackButtonText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricsList: {
    marginTop: 8,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  metricName: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
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

export default MobilePerformanceDashboard; 