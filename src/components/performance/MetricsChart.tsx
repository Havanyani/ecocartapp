import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TimeSeriesMetrics } from '@/types/PerformanceMonitoring';
import { ThemedText } from '@/components/ui/ThemedText';

interface Props {
  data: TimeSeriesMetrics;
  metric: keyof TimeSeriesMetrics[number];
  title: string;
  color: string;
}

export function MetricsChart({ data, metric, title, color }: Props) {
  const chartData = {
    labels: Object.keys(data).map(timestamp => {
      const date = new Date(Number(timestamp));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [{
      data: Object.values(data).map(point => point[metric] || 0),
      color: () => color,
      strokeWidth: 2,
    }],
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <LineChart
        data={chartData}
        width={320}
        height={180}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
}); 