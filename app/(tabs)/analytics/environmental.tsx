import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PerformanceMetricsChart,
  PerformanceMetricsInsights,
  PerformanceMetricsSummary
} from '../../../src/components/performance';

const environmentalData = {
  summary: [
    {
      id: '1',
      label: 'Carbon Offset',
      value: 2.5,
      unit: 'tons',
      change: 12.3,
      target: 5,
      icon: 'leaf',
      category: 'environmental' as const,
      status: 'on-track' as const,
    },
    {
      id: '2',
      label: 'Plastic Diverted',
      value: 1250,
      unit: 'kg',
      change: 15.2,
      icon: 'recycle',
      category: 'environmental' as const,
    },
    {
      id: '3',
      label: 'Water Impact',
      value: 5000,
      unit: 'liters',
      change: 8.7,
      icon: 'water',
      category: 'environmental' as const,
      status: 'on-track' as const,
    },
  ],
  trends: [
    {
      id: 'carbon',
      label: 'Carbon Offset',
      data: [
        { date: new Date('2024-01-01'), value: 0.5 },
        { date: new Date('2024-02-01'), value: 1.2 },
        { date: new Date('2024-03-01'), value: 1.8 },
        { date: new Date('2024-04-01'), value: 2.5 },
      ],
      color: '#00796b',
      category: 'environmental' as const,
    },
  ],
  insights: [
    {
      id: '1',
      type: 'positive' as const,
      metric: 'Environmental Impact',
      description: 'Carbon offset targets are exceeding expectations',
      value: 2.5,
      change: 38.9,
      confidence: 0.95,
      category: 'environmental' as const,
      recommendations: [
        'Share impact metrics with community',
        'Consider expanding program reach',
      ],
      relatedMetrics: [
        {
          label: 'Community Engagement',
          value: 92,
          correlation: 0.85,
        },
      ],
    },
  ],
};

export default function EnvironmentalAnalytics() {
  const timeframe = 'Last 3 Months';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PerformanceMetricsSummary
            metrics={environmentalData.summary}
            timeframe={timeframe}
            title="Environmental Impact"
            subtitle="Tracking our sustainability goals"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsChart
            series={environmentalData.trends}
            timeframe={timeframe}
            unit="tons CO₂"
            title="Carbon Offset Trends"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsInsights
            insights={environmentalData.insights}
            timeframe={timeframe}
            title="Environmental Insights"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  spacer: {
    height: 16,
  },
}); 