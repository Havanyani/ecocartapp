import { ThemedText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  assetsSize: number;
  unusedCode: number;
  optimizationPotential: number;
}

interface BundleData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: (opacity: number) => string;
  }[];
}

export default function BundleOptimizationScreen() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Mock data - replace with actual bundle analysis data
  const metrics: BundleMetrics = {
    totalSize: 25.5,
    jsSize: 15.2,
    assetsSize: 10.3,
    unusedCode: 2.8,
    optimizationPotential: 3.5,
  };

  const bundleData: BundleData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Total Size (MB)',
        data: [26.2, 25.8, 25.5, 25.3, 25.5, 25.4, 25.5],
        color: (opacity: number) => `rgba(46, 125, 50, ${opacity})`,
      },
      {
        label: 'JS Size (MB)',
        data: [15.8, 15.5, 15.2, 15.0, 15.2, 15.1, 15.2],
        color: (opacity: number) => `rgba(0, 121, 107, ${opacity})`,
      },
    ],
  };

  const renderMetricCard = (label: string, value: number, unit: string = 'MB') => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.cardBackground }]}>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText style={styles.metricValue}>
        {value.toFixed(1)}{unit}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>Bundle Size Analysis</ThemedText>

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
            {renderMetricCard('Total Size', metrics.totalSize)}
            {renderMetricCard('JS Size', metrics.jsSize)}
            {renderMetricCard('Assets Size', metrics.assetsSize)}
            {renderMetricCard('Unused Code', metrics.unusedCode)}
            {renderMetricCard('Optimization Potential', metrics.optimizationPotential)}
          </View>

          <View style={[styles.chartContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <ThemedText style={styles.chartTitle}>Bundle Size Trends</ThemedText>
            <BarChart
              data={bundleData}
              width={styles.chart.width}
              height={220}
              yAxisSuffix="MB"
              chartConfig={{
                backgroundColor: theme.colors.cardBackground,
                backgroundGradientFrom: theme.colors.cardBackground,
                backgroundGradientTo: theme.colors.cardBackground,
                decimalPlaces: 1,
                color: (opacity = 1) => theme.colors.text,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: theme.colors.border,
                },
              }}
              style={styles.chart}
            />
          </View>

          <View style={[styles.optimizationTips, { backgroundColor: theme.colors.cardBackground }]}>
            <ThemedText style={styles.tipsTitle}>Optimization Tips</ThemedText>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Remove unused dependencies and code
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Implement code splitting and lazy loading
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Optimize image assets and use appropriate formats
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Enable tree shaking and dead code elimination
              </ThemedText>
            </View>
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
    marginBottom: 16,
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
  optimizationTips: {
    padding: 16,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 