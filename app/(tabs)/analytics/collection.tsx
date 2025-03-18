import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PerformanceMetricsChart,
  PerformanceMetricsInsights,
  PerformanceMetricsSummary,
  PerformanceMetricsTable
} from '../../../src/components/performance';
import { ChartSeries, InsightTrend, MetricItem, TableColumn, TableRow, TimeFrame } from '../../../src/types/Performance';

const collectionData: {
  summary: MetricItem[];
  trends: ChartSeries[];
  insights: InsightTrend[];
  history: TableRow[];
} = {
  summary: [
    {
      id: '1',
      label: 'Total Plastic Collected',
      value: 1250,
      unit: 'kg',
      change: 15.2,
      target: 2000,
      icon: 'recycle',
      category: 'collection',
      status: 'on-track',
    },
    {
      id: '2',
      label: 'Active Collectors',
      value: 125,
      unit: 'users',
      change: 22.5,
      icon: 'account-group',
      category: 'collection',
    },
    {
      id: '3',
      label: 'Average Per Pickup',
      value: 2.5,
      unit: 'kg',
      change: -3.2,
      icon: 'scale',
      category: 'collection',
      status: 'at-risk',
    },
  ],
  trends: [
    {
      id: 'collection-rate',
      label: 'Collection Rate',
      data: [
        { date: new Date('2024-01-01'), value: 35 },
        { date: new Date('2024-02-01'), value: 42 },
        { date: new Date('2024-03-01'), value: 48 },
        { date: new Date('2024-04-01'), value: 38 },
      ],
      color: '#4CAF50',
      category: 'collection',
    },
  ],
  insights: [
    {
      id: '1',
      type: 'positive',
      metric: 'Collection Growth',
      description: 'New user participation driving collection increases',
      value: 48,
      change: 28.5,
      confidence: 0.92,
      category: 'collection',
      recommendations: [
        'Focus on user retention strategies',
        'Optimize pickup schedules for peak times',
      ],
      relatedMetrics: [
        {
          label: 'User Retention',
          value: 78,
          correlation: 0.85,
        },
      ],
    },
  ],
  history: [
    {
      id: '1',
      category: 'collection',
      data: {
        date: 'Apr 1, 2024',
        weight: '38',
        collectors: '125',
        efficiency: '2.5',
      },
      expandable: true,
      details: [
        { label: 'Peak Collection Time', value: '14:00 - 16:00' },
        { label: 'Most Active Area', value: 'Central District' },
      ],
    },
    {
      id: '2',
      category: 'collection',
      data: {
        date: 'Mar 1, 2024',
        weight: '48',
        collectors: '115',
        efficiency: '2.8',
      },
      expandable: true,
      details: [
        { label: 'Peak Collection Time', value: '15:00 - 17:00' },
        { label: 'Most Active Area', value: 'North District' },
      ],
    },
  ],
};

const tableColumns: TableColumn[] = [
  { id: 'date', label: 'Date', width: 2, align: 'left' as const },
  { id: 'weight', label: 'Weight (kg)', width: 1, align: 'right' as const },
  { id: 'collectors', label: 'Collectors', width: 1, align: 'right' as const },
  { id: 'efficiency', label: 'Avg (kg)', width: 1, align: 'right' as const }
];

export default function CollectionAnalytics() {
  const timeframe: TimeFrame = 'Last 3 Months';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PerformanceMetricsSummary
            metrics={collectionData.summary}
            timeframe={timeframe}
            title="Collection Performance"
            subtitle="Tracking collection efficiency and growth"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsChart
            series={collectionData.trends}
            timeframe={timeframe}
            unit="kg"
            title="Daily Collection Trends"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsInsights
            insights={collectionData.insights}
            timeframe={timeframe}
            title="Collection Insights"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsTable
            columns={tableColumns}
            rows={collectionData.history}
            title="Collection History"
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