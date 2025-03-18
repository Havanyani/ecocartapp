import {
  PerformanceMetricsChart,
  PerformanceMetricsInsights,
  PerformanceMetricsSummary,
  PerformanceMetricsTable
} from '@/components/performance';
import { ChartSeries, InsightTrend, MetricItem, TableColumn, TableRow } from '@/types/Performance';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sample data - in production this would come from an API
const summaryData: MetricItem[] = [
  {
    id: '1',
    label: 'Total Plastic Collected',
    value: 1250,
    unit: 'kg',
    change: 15.2,
    target: 2000,
    icon: 'recycle',
    category: 'collection' as const,
    status: 'on-track' as const,
  },
  {
    id: '2',
    label: 'Credits Issued',
    value: 25000,
    unit: 'ZAR',
    change: 8.5,
    icon: 'currency-zar',
    category: 'financial' as const,
  },
  {
    id: '3',
    label: 'Carbon Offset',
    value: 2.5,
    unit: 'tons',
    change: 12.3,
    icon: 'leaf',
    category: 'environmental' as const,
    status: 'on-track' as const,
  },
];

const chartData: ChartSeries[] = [
  {
    id: 'plastic',
    label: 'Plastic Collection',
    data: [
      { date: new Date('2024-01-01'), value: 200 },
      { date: new Date('2024-02-01'), value: 350 },
      { date: new Date('2024-03-01'), value: 450 },
      { date: new Date('2024-04-01'), value: 250 },
    ],
    color: '#2e7d32',
    category: 'collection' as const,
  },
  {
    id: 'credits',
    label: 'Credits',
    data: [
      { date: new Date('2024-01-01'), value: 4000 },
      { date: new Date('2024-02-01'), value: 7000 },
      { date: new Date('2024-03-01'), value: 9000 },
      { date: new Date('2024-04-01'), value: 5000 },
    ],
    color: '#1976d2',
    category: 'financial' as const,
  },
];

const insightsData: InsightTrend[] = [
  {
    id: '1',
    type: 'positive' as const,
    metric: 'Collection Growth',
    description: 'Plastic collection has increased significantly this month',
    value: 450,
    change: 28.5,
    confidence: 0.92,
    category: 'collection' as const,
    recommendations: [
      'Consider expanding collection capacity',
      'Implement peak time collection strategies',
    ],
    relatedMetrics: [
      {
        label: 'Customer Participation',
        value: 85,
        correlation: 0.78,
      },
      {
        label: 'Credit Redemption',
        value: 65,
        correlation: 0.62,
      },
    ],
  },
  {
    id: '2',
    type: 'neutral' as const,
    metric: 'Credit Utilization',
    description: 'Credit redemption rates remain stable',
    value: 9000,
    change: 5.2,
    confidence: 0.85,
    category: 'financial' as const,
    recommendations: [
      'Consider promotional campaigns',
      'Analyze popular redemption patterns',
    ],
    relatedMetrics: [
      {
        label: 'Customer Engagement',
        value: 70,
        correlation: 0.45,
      }
    ],
  },
];

const tableColumns: TableColumn[] = [
  { id: 'date', label: 'Date', width: 2, align: 'left' as const },
  { id: 'weight', label: 'Weight (kg)', width: 1, align: 'right' as const },
  { id: 'credits', label: 'Credits (ZAR)', width: 1, align: 'right' as const },
  { id: 'customers', label: 'Customers', width: 1, align: 'right' as const },
];

const tableData: TableRow[] = [
  {
    id: '1',
    category: 'collection' as const,
    data: {
      date: 'Apr 1, 2024',
      weight: '250',
      credits: '5,000',
      customers: '125',
    },
    expandable: true,
    details: [
      { label: 'Average per Customer', value: '2.0 kg' },
      { label: 'Credit Rate', value: '20 ZAR/kg' },
    ],
  },
  // ... more rows
];

export default function AnalyticsHome() {
  const timeframe = 'Last 3 Months';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PerformanceMetricsSummary
            metrics={summaryData}
            timeframe={timeframe}
          />

          <View style={styles.spacer} />

          <PerformanceMetricsChart
            series={chartData}
            timeframe={timeframe}
            unit="kg"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsInsights
            insights={insightsData}
            timeframe={timeframe}
          />

          <View style={styles.spacer} />

          <PerformanceMetricsTable
            columns={tableColumns}
            rows={tableData}
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