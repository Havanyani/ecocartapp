import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePerformance } from '../../hooks/usePerformance';
import { useTheme } from '../../hooks/useTheme';

interface PerformanceMetricsProps {
  userId: string;
}

export function PerformanceMetrics({ userId }: PerformanceMetricsProps) {
  const { colors } = useTheme();
  const { metrics, isLoading, error } = usePerformance(userId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.text }]}>Loading metrics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.error }]}>
          Error loading metrics: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>App Performance</Text>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {metrics?.appLoadTime || 0}ms
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text }]}>App Load Time</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {metrics?.screenLoadTime || 0}ms
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Screen Load Time</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {metrics?.apiResponseTime || 0}ms
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text }]}>API Response Time</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Error Rates</Text>
        {metrics?.errorRates.map((error) => (
          <View key={error.type} style={styles.errorItem}>
            <Text style={[styles.errorType, { color: colors.text }]}>{error.type}</Text>
            <View style={styles.errorStats}>
              <Text style={[styles.errorCount, { color: colors.text }]}>
                {error.count} errors
              </Text>
              <Text style={[styles.errorRate, { color: colors.text }]}>
                {error.rate}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Resource Usage</Text>
        <View style={styles.resourceItem}>
          <Text style={[styles.resourceLabel, { color: colors.text }]}>Memory Usage</Text>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${metrics?.memoryUsage || 0}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {metrics?.memoryUsage || 0}%
            </Text>
          </View>
        </View>
        <View style={styles.resourceItem}>
          <Text style={[styles.resourceLabel, { color: colors.text }]}>CPU Usage</Text>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${metrics?.cpuUsage || 0}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {metrics?.cpuUsage || 0}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>Network Performance</Text>
        <View style={styles.networkItem}>
          <Text style={[styles.networkLabel, { color: colors.text }]}>Requests</Text>
          <Text style={[styles.networkValue, { color: colors.text }]}>
            {metrics?.networkRequests || 0}
          </Text>
        </View>
        <View style={styles.networkItem}>
          <Text style={[styles.networkLabel, { color: colors.text }]}>Success Rate</Text>
          <Text style={[styles.networkValue, { color: colors.text }]}>
            {metrics?.networkSuccessRate || 0}%
          </Text>
        </View>
        <View style={styles.networkItem}>
          <Text style={[styles.networkLabel, { color: colors.text }]}>Average Latency</Text>
          <Text style={[styles.networkValue, { color: colors.text }]}>
            {metrics?.networkLatency || 0}ms
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 16,
  },
  errorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorType: {
    fontSize: 16,
  },
  errorStats: {
    flexDirection: 'row',
    gap: 16,
  },
  errorCount: {
    fontSize: 14,
  },
  errorRate: {
    fontSize: 14,
  },
  resourceItem: {
    marginBottom: 16,
  },
  resourceLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    marginTop: 4,
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  networkLabel: {
    fontSize: 16,
  },
  networkValue: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 