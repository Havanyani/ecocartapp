import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import type { RootStackParamList } from '@/navigation/types';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { PerformanceAlerts } from '@components/performance/PerformanceAlerts';
import { PerformanceDashboard } from '@components/performance/PerformanceDashboard';
import { PerformanceReport } from '@components/performance/PerformanceReport';
import { PerformanceTrends } from '@components/performance/PerformanceTrends';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

type PerformanceMonitorScreenProps = NativeStackScreenProps<RootStackParamList, 'PerformanceMonitor'>;

interface PerformanceMetrics {
  averageLatency: number;
  throughput: number;
  averageCompressionRatio: number;
  totalMetrics: {
    messages: number;
    failed: number;
  };
  chartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

export function PerformanceMonitorScreen({ navigation }: PerformanceMonitorScreenProps): JSX.Element {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = WebSocketPerformance.getMetricsSummary();
      setMetrics(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load metrics');
      setError(error);
      PerformanceMonitor.captureError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]} testID="performance-monitor-loading">
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]} testID="performance-monitor-error">
        <ThemedText style={styles.errorText}>{error.message}</ThemedText>
        <HapticTab 
          style={styles.retryButton}
          onPress={() => void loadMetrics()}
          accessibilityLabel="Retry loading metrics"
        >
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </HapticTab>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.container, styles.centered]} testID="performance-monitor-empty">
        <ThemedText>No metrics available</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="performance-monitor-screen">
      <PerformanceAlerts />
      <ScrollView>
        <PerformanceDashboard metrics={metrics} />
        <PerformanceReport />
        <PerformanceTrends />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
}); 