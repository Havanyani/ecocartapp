import { ThemedText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TreeShakingMetrics {
  totalCodeSize: number;
  usedCodeSize: number;
  deadCodeSize: number;
  optimizationRate: number;
  potentialSavings: number;
}

interface TreeShakingData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
  legend?: string[];
}

export default function TreeShakingScreen() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Mock data - replace with actual tree shaking analysis data
  const metrics: TreeShakingMetrics = {
    totalCodeSize: 100,
    usedCodeSize: 75,
    deadCodeSize: 25,
    optimizationRate: 75,
    potentialSavings: 15,
  };

  const treeShakingData: TreeShakingData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [75, 74, 75, 73, 75, 74, 75],
        color: (opacity: number) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [25, 26, 25, 27, 25, 26, 25],
        color: (opacity: number) => `rgba(198, 40, 40, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Used Code (KB)', 'Dead Code (KB)'],
  };

  const renderMetricCard = (label: string, value: number, unit: string = '%') => (
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
          <ThemedText style={styles.title}>Tree Shaking Analysis</ThemedText>

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
            {renderMetricCard('Total Code Size', metrics.totalCodeSize, 'KB')}
            {renderMetricCard('Used Code', metrics.usedCodeSize, 'KB')}
            {renderMetricCard('Dead Code', metrics.deadCodeSize, 'KB')}
            {renderMetricCard('Optimization Rate', metrics.optimizationRate)}
            {renderMetricCard('Potential Savings', metrics.potentialSavings, 'KB')}
          </View>

          <View style={[styles.chartContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <ThemedText style={styles.chartTitle}>Code Distribution Trends</ThemedText>
            <LineChart
              data={treeShakingData}
              width={350}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.cardBackground,
                backgroundGradientFrom: theme.colors.cardBackground,
                backgroundGradientTo: theme.colors.cardBackground,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.text,
                labelColor: (opacity = 1) => theme.colors.text,
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  strokeWidth: 1,
                  stroke: theme.colors.border,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={[styles.optimizationTips, { backgroundColor: theme.colors.cardBackground }]}>
            <ThemedText style={styles.tipsTitle}>Optimization Recommendations</ThemedText>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Remove unused imports and components
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Implement dynamic imports for large components
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Use named exports instead of default exports
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={styles.tipText}>
                • Enable tree shaking in build configuration
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