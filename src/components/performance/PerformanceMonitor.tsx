import { PerformanceMonitor as PerformanceUtil } from '@/utils/PerformanceMonitoring';
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebSocketPerformance } from '@/utils/WebSocketPerformance';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

type MetricsSummary = ReturnType<typeof WebSocketPerformance.getMetricsSummary>;

interface Props {
  refreshInterval?: number;
  showLatency?: boolean;
  showThroughput?: boolean;
  showCompression?: boolean;
}

export function PerformanceMonitor({
  refreshInterval = 5000,
  showLatency = true,
  showThroughput = true,
  showCompression = true
}: Props) {
  const [metrics, setMetrics] = useState<MetricsSummary>(WebSocketPerformance.getMetricsSummary());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(WebSocketPerformance.getMetricsSummary());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Performance Metrics</ThemedText>

      <View style={styles.metricsGrid}>
        {showLatency && (
          <View style={styles.metricCard}>
            <IconSymbol name="timer" size={24} color="#2e7d32" />
            <ThemedText style={styles.metricValue}>
              {metrics.averageLatency.toFixed(1)}ms
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Avg Latency</ThemedText>
          </View>
        )}

        {showThroughput && (
          <View style={styles.metricCard}>
            <IconSymbol name="chart-line-variant" size={24} color="#2e7d32" />
            <ThemedText style={styles.metricValue}>
              {metrics.averageProcessingTime.toFixed(1)}ms
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Processing Time</ThemedText>
          </View>
        )}

        {showCompression && (
          <View style={styles.metricCard}>
            <IconSymbol name="zip-box" size={24} color="#2e7d32" />
            <ThemedText style={styles.metricValue}>
              {(metrics.averageCompressionRatio * 100).toFixed(1)}%
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Compression Ratio</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
});
