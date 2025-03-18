import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface TrendData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

export function PerformanceTrends() {
  const [trendData, setTrendData] = useState<TrendData>({
    labels: [],
    datasets: [{ data: [] }]
  });

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const metrics = WebSocketPerformance.getMetricsSummary();
      setTrendData(currentData => ({
        labels: [...currentData.labels, new Date().toLocaleTimeString()],
        datasets: [{
          data: [...currentData.datasets[0].data, metrics.averageLatency]
        }]
      }));
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <View testID="trends-container" style={styles.container}>
      <LineChart
        data={trendData}
        width={300}
        height={200}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`
        }}
        style={styles.chart}
        testID="line-chart"
        accessible={true}
        accessibilityLabel="Performance trends chart"
        accessibilityHint="Shows performance metrics over time"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
}); 