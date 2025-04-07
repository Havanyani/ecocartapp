import { ThemedText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PerformanceMetrics {
  accuracy: number;
  confidence: number;
  processingTime: number;
  detectionRate: number;
  falsePositives: number;
  falseNegatives: number;
}

interface HistoricalData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: (opacity: number) => string;
  }[];
}

export default function AIPerformanceScreen() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Mock data - replace with actual data from your backend
  const metrics: PerformanceMetrics = {
    accuracy: 0.95,
    confidence: 0.92,
    processingTime: 0.8,
    detectionRate: 0.98,
    falsePositives: 0.02,
    falseNegatives: 0.01,
  };

  const historicalData: HistoricalData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Accuracy',
        data: [0.92, 0.94, 0.95, 0.93, 0.96, 0.95, 0.95],
        color: (opacity: number) => `rgba(46, 125, 50, ${opacity})`,
      },
      {
        label: 'Confidence',
        data: [0.89, 0.91, 0.92, 0.90, 0.93, 0.92, 0.92],
        color: (opacity: number) => `rgba(0, 121, 107, ${opacity})`,
      },
    ],
  };

  const renderMetricCard = (label: string, value: number, unit: string = '%') => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.cardBackground }]}>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText style={styles.metricValue}>
        {(value * 100).toFixed(1)}{unit}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>AI Performance Metrics</ThemedText>

          <View style={styles.timeRangeSelector}>
            {(['day', 'week', 'month'] as const).map((range) => (
              <View
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <ThemedText
                  style={[
                    styles.timeRangeButtonText,
                    timeRange === range && styles.timeRangeButtonTextActive,
                  ]}
                  onPress={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.metricsGrid}>
            {renderMetricCard('Accuracy', metrics.accuracy)}
            {renderMetricCard('Confidence', metrics.confidence)}
            {renderMetricCard('Processing Time', metrics.processingTime, 's')}
            {renderMetricCard('Detection Rate', metrics.detectionRate)}
            {renderMetricCard('False Positives', metrics.falsePositives)}
            {renderMetricCard('False Negatives', metrics.falseNegatives)}
          </View>

          <View style={[styles.chartContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <ThemedText style={styles.chartTitle}>Performance Trends</ThemedText>
            <LineChart
              data={historicalData}
              width={styles.chart.width}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.cardBackground,
                backgroundGradientFrom: theme.colors.cardBackground,
                backgroundGradientTo: theme.colors.cardBackground,
                decimalPlaces: 2,
                color: (opacity = 1) => theme.colors.text,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: theme.colors.border,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#2e7d32',
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  metricCard: {
    width: '50%',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    width: '100%',
  },
}); 