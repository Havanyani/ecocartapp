import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PerformanceMetricsChart,
  PerformanceMetricsInsights,
  PerformanceMetricsSummary,
  PerformanceMetricsTable
} from '../../../src/components/performance';

const creditData = {
  summary: [
    {
      id: '1',
      label: 'Total Credits Issued',
      value: 25000,
      unit: 'ZAR',
      change: 18.5,
      target: 30000,
      icon: 'cash',
      category: 'financial' as const,
      status: 'on-track' as const,
    },
    {
      id: '2',
      label: 'Credit Redemption Rate',
      value: 85,
      unit: '%',
      change: 5.2,
      icon: 'percent',
      category: 'financial' as const,
      status: 'on-track' as const,
    },
    {
      id: '3',
      label: 'Average Credit per User',
      value: 200,
      unit: 'ZAR',
      change: -2.1,
      icon: 'account-cash',
      category: 'financial' as const,
      status: 'at-risk' as const,
    },
  ],
  trends: [
    {
      id: 'credits',
      label: 'Credits Issued',
      data: [
        { date: new Date('2024-01-01'), value: 5000 },
        { date: new Date('2024-02-01'), value: 7000 },
        { date: new Date('2024-03-01'), value: 8000 },
        { date: new Date('2024-04-01'), value: 5000 },
      ],
      color: '#1976d2',
      category: 'financial' as const,
    },
    {
      id: 'redemption',
      label: 'Credits Redeemed',
      data: [
        { date: new Date('2024-01-01'), value: 4250 },
        { date: new Date('2024-02-01'), value: 5950 },
        { date: new Date('2024-03-01'), value: 6800 },
        { date: new Date('2024-04-01'), value: 4250 },
      ],
      color: '#00796b',
      category: 'financial' as const,
    },
  ],
  insights: [
    {
      id: '1',
      type: 'positive' as const,
      metric: 'Credit System Performance',
      description: 'High redemption rates indicate strong program adoption',
      value: 85,
      change: 5.2,
      confidence: 0.88,
      category: 'financial' as const,
      recommendations: [
        'Consider increasing credit rates for peak collection times',
        'Implement targeted promotions for low-activity users',
      ],
      relatedMetrics: [
        {
          label: 'User Satisfaction',
          value: 92,
          correlation: 0.82,
        },
        {
          label: 'Return Rate',
          value: 88,
          correlation: 0.75,
        },
      ],
    },
  ],
  transactions: [
    {
      id: '1',
      category: 'financial' as const,
      data: {
        date: 'Apr 1, 2024',
        credits: '5,000',
        redeemed: '4,250',
        users: '125',
      },
      expandable: true,
      details: [
        { label: 'Average per User', value: '40 ZAR' },
        { label: 'Peak Redemption Time', value: '15:00 - 17:00' },
      ],
    },
    {
      id: '2',
      category: 'financial' as const,
      data: {
        date: 'Mar 1, 2024',
        credits: '8,000',
        redeemed: '6,800',
        users: '160',
      },
      expandable: true,
      details: [
        { label: 'Average per User', value: '50 ZAR' },
        { label: 'Peak Redemption Time', value: '14:00 - 16:00' },
      ],
    },
  ],
};

const tableColumns = [
  { id: 'date', label: 'Date', width: 2, align: 'left' as const },
  { id: 'credits', label: 'Credits (ZAR)', width: 1, align: 'right' as const },
  { id: 'redeemed', label: 'Redeemed', width: 1, align: 'right' as const },
  { id: 'users', label: 'Users', width: 1, align: 'right' as const },
];

export default function CreditsAnalytics() {
  const timeframe = 'Last 3 Months';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PerformanceMetricsSummary
            metrics={creditData.summary}
            timeframe={timeframe}
            title="Credit System Performance"
            subtitle="Tracking credit issuance and redemption"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsChart
            series={creditData.trends}
            timeframe={timeframe}
            unit="ZAR"
            title="Credit Flow Trends"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsInsights
            insights={creditData.insights}
            timeframe={timeframe}
            title="Credit System Insights"
          />

          <View style={styles.spacer} />

          <PerformanceMetricsTable
            columns={tableColumns}
            rows={creditData.transactions}
            title="Credit Transactions"
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