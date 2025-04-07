import { MetricData } from '@/types/PerformanceMonitoring';
import { MetricsChart } from '@components/MetricsChart';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import { useTheme } from '@contexts/ThemeContext';
import { AnimatedThemeProvider } from '@theme/AnimatedThemeProvider';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface MetricSummary {
  name: string;
  average: number;
  min: number;
  max: number;
  count: number;
}

interface MetricItem {
  value: number;
  timestamp: number;
}

interface TimeSeriesMetrics {
  [timestamp: number]: MetricItem;
}

type MetricKey = keyof MetricData;

export function PerformanceMetricsView() {
  const themeFunc = useTheme();
const theme = themeFunc();
  const [metrics, setMetrics] = useState<TimeSeriesMetrics>({});

  useEffect(() => {
    const intervalId = setInterval(updateMetrics, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const updateMetrics = () => {
    const summary = performanceMetrics.getMetricsSummary();
    const timestamp = Date.now();
    
    setMetrics(prev => ({
      ...prev,
      [timestamp]: {
        value: summary.average,
        timestamp
      }
    }));
  };

  return (
    <AnimatedThemeProvider>
      <ThemedView>
        <ThemedText>Performance Metrics</ThemedText>
        <IconSymbol name="chart-line" size={24} />
        <ScrollView style={styles.container}>
          {Object.values(metrics).map((metric) => (
            <MetricCard key={metric.timestamp} metric={metric} />
          ))}

          <View style={styles.chartContainer}>
            <MetricsChart
              data={metrics}
              metric={'value' as MetricKey}
              title="Average Response Time"
              color="#2e7d32"
            />
          </View>
        </ScrollView>
      </ThemedView>
    </AnimatedThemeProvider>
  );
}

interface MetricCardProps {
  metric: MetricItem;
}

function MetricCard({ metric }: MetricCardProps) {
  const themeFunc = useTheme();
const theme = themeFunc();
  
  return (
    <ThemedView style={[styles.card]}>
      <ThemedText style={[styles.cardTitle]}>
        {new Date(metric.timestamp).toLocaleTimeString()}
      </ThemedText>
      
      <View style={styles.metricsGrid}>
        <MetricItem
          label="Value"
          value={`${metric.value.toFixed(2)}ms`}
          color="#666"
        />
      </View>
    </ThemedView>
  );
}

interface MetricItemProps {
  label: string;
  value: string;
  color: string;
}

function MetricItem({ label, value, color }: MetricItemProps) {
  return (
    <ThemedView style={styles.metricItem}>
      <ThemedText style={[styles.metricLabel, { color }]}>{label}</ThemedText>
      <ThemedText style={[styles.metricValue, { color }]}>{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: 16,
  },
}); 