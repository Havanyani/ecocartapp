import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MetricsPersistenceService } from '@/services/MetricsPersistenceService';
import { MetricData, MetricsSummary, TimeSeriesMetrics } from '@/types/PerformanceMonitoring';

interface MetricsChartProps {
  data: TimeSeriesMetrics;
  metric: keyof MetricData;
  title: string;
  color?: string;
}

export function MetricsChart({ 
  data, 
  metric, 
  title, 
  color = '#007AFF' 
}: MetricsChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 32; // Accounting for padding

  const chartData = useMemo(() => {
    const timestamps = Object.keys(data).sort();
    const values = timestamps.map(t => data[t][metric] ?? 0);
    const labels = timestamps.map(t => {
      const date = new Date(parseInt(t));
      return `${date.getHours()}:${date.getMinutes()}`;
    });

    return {
      labels: labels.slice(-6),
      datasets: [{
        data: values.slice(-6),
        color: (opacity = 1) => color
      }]
    };
  }, [data, metric, color]);

  const summary = useMemo(() => 
    (MetricsPersistenceService.getMetricsSummary(data) ?? { 
      trends: {
        latency: undefined,
        processingTime: undefined,
        compressionRatio: undefined
      },
      latest: new Date().getTime(),
      oldest: new Date().getTime(),
      timeSpan: 0,
      sampleCount: 0
    }) as unknown as MetricsSummary,
    [data]
  );

  const getTrendIndicator = () => {
    const trend = summary?.trends[metric];
    if (!trend) return null;

    const trendColor = trend.direction === 'increasing' ? '#FF3B30' : '#34C759';
    const label = `${trend.direction === 'increasing' ? 'Increased' : 'Decreased'} by ${Math.abs(trend.change).toFixed(1)}%`;

    return (
      <Text 
        style={[styles.trendText, { color: trendColor }]}
        accessibilityLabel={label}
        accessibilityRole="text"
      >
        {trend.direction === 'increasing' ? '↑' : '↓'} 
        {Math.abs(trend.change).toFixed(1)}%
      </Text>
    );
  };

  return (
    <View 
      style={styles.container}
      accessibilityRole="adjustable"
      accessibilityLabel={`${title} chart`}
    >
      <View style={styles.header}>
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {getTrendIndicator()}
      </View>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: () => '#333333',
          style: {
            borderRadius: 16
          },
          propsForLabels: {
            accessibilityLabel: 'Chart label'
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
}); 