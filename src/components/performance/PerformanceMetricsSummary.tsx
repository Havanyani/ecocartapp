import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

interface MetricItem {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
}

interface Props {
  metrics: MetricItem[];
  timeframe: string;
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsSummary({
  metrics,
  timeframe,
  title = 'Performance Overview',
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
        <ThemedText style={styles.timeframe}>{timeframe}</ThemedText>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <IconSymbol name={metric.icon} size={24} color="#2e7d32" />
            <ThemedText style={styles.metricValue}>
              {metric.value} {metric.unit}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
          </View>
        ))}
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timeframe: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
    textAlign: 'center',
  },
}); 