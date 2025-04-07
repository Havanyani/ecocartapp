import { ThemedText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BenchmarkMetrics {
  model: string;
  accuracy: number;
  speed: number;
  memory: number;
  energy: number;
}

interface BenchmarkData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: (opacity: number) => string;
  }[];
}

export default function AIBenchmarkScreen() {
  const { theme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'speed' | 'memory' | 'energy'>('accuracy');

  // Mock data - replace with actual benchmark data
  const benchmarkMetrics: BenchmarkMetrics[] = [
    {
      model: 'EcoCart v1.0',
      accuracy: 0.85,
      speed: 0.7,
      memory: 0.8,
      energy: 0.75,
    },
    {
      model: 'EcoCart v2.0',
      accuracy: 0.92,
      speed: 0.85,
      memory: 0.9,
      energy: 0.85,
    },
    {
      model: 'EcoCart v3.0',
      accuracy: 0.95,
      speed: 0.95,
      memory: 0.95,
      energy: 0.95,
    },
  ];

  const benchmarkData: BenchmarkData = {
    labels: benchmarkMetrics.map(m => m.model),
    datasets: [
      {
        label: 'Accuracy',
        data: benchmarkMetrics.map(m => m.accuracy),
        color: (opacity: number) => `rgba(46, 125, 50, ${opacity})`,
      },
      {
        label: 'Speed',
        data: benchmarkMetrics.map(m => m.speed),
        color: (opacity: number) => `rgba(0, 121, 107, ${opacity})`,
      },
      {
        label: 'Memory',
        data: benchmarkMetrics.map(m => m.memory),
        color: (opacity: number) => `rgba(25, 118, 210, ${opacity})`,
      },
      {
        label: 'Energy',
        data: benchmarkMetrics.map(m => m.energy),
        color: (opacity: number) => `rgba(198, 40, 40, ${opacity})`,
      },
    ],
  };

  const renderMetricButton = (metric: BenchmarkMetrics['model']) => (
    <View
      key={metric}
      style={[
        styles.metricButton,
        selectedMetric === metric && styles.metricButtonActive,
        { backgroundColor: theme.colors.cardBackground },
      ]}
    >
      <ThemedText
        style={[
          styles.metricButtonText,
          selectedMetric === metric && styles.metricButtonTextActive,
        ]}
        onPress={() => setSelectedMetric(metric as any)}
      >
        {metric}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>AI Model Benchmarks</ThemedText>

          <View style={styles.metricSelector}>
            {(['accuracy', 'speed', 'memory', 'energy'] as const).map(renderMetricButton)}
          </View>

          <View style={[styles.chartContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <ThemedText style={styles.chartTitle}>Performance Comparison</ThemedText>
            <BarChart
              data={benchmarkData}
              width={styles.chart.width}
              height={220}
              yAxisSuffix="%"
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
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: theme.colors.border,
                },
              }}
              style={styles.chart}
            />
          </View>

          <View style={styles.metricsList}>
            {benchmarkMetrics.map((model) => (
              <View
                key={model.model}
                style={[styles.modelCard, { backgroundColor: theme.colors.cardBackground }]}
              >
                <ThemedText style={styles.modelName}>{model.model}</ThemedText>
                <View style={styles.modelMetrics}>
                  <View style={styles.modelMetric}>
                    <ThemedText style={styles.modelMetricLabel}>Accuracy</ThemedText>
                    <ThemedText style={styles.modelMetricValue}>
                      {(model.accuracy * 100).toFixed(1)}%
                    </ThemedText>
                  </View>
                  <View style={styles.modelMetric}>
                    <ThemedText style={styles.modelMetricLabel}>Speed</ThemedText>
                    <ThemedText style={styles.modelMetricValue}>
                      {(model.speed * 100).toFixed(1)}%
                    </ThemedText>
                  </View>
                  <View style={styles.modelMetric}>
                    <ThemedText style={styles.modelMetricLabel}>Memory</ThemedText>
                    <ThemedText style={styles.modelMetricValue}>
                      {(model.memory * 100).toFixed(1)}%
                    </ThemedText>
                  </View>
                  <View style={styles.modelMetric}>
                    <ThemedText style={styles.modelMetricLabel}>Energy</ThemedText>
                    <ThemedText style={styles.modelMetricValue}>
                      {(model.energy * 100).toFixed(1)}%
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
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
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  metricButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 8,
    borderRadius: 8,
  },
  metricButtonActive: {
    backgroundColor: '#2e7d32',
  },
  metricButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricButtonTextActive: {
    color: '#ffffff',
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
  metricsList: {
    gap: 16,
  },
  modelCard: {
    padding: 16,
    borderRadius: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modelMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  modelMetric: {
    flex: 1,
    minWidth: '45%',
  },
  modelMetricLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  modelMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 