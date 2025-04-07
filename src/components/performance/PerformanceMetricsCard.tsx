/**
 * PerformanceMetricsCard.tsx
 * 
 * A card component for displaying performance metrics.
 * Used by the WebPerformanceDashboard to show various metrics.
 */

import { ThemedText } from '@/components/ui/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface PerformanceMetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function PerformanceMetricsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
}: PerformanceMetricsCardProps): JSX.Element {
  const getColorForTrend = () => {
    if (!trend) return '#757575';
    switch (trend) {
      case 'up':
        return '#4caf50';
      case 'down':
        return '#f44336';
      case 'neutral':
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.value}>{value}</ThemedText>
      {description && <ThemedText style={styles.description}>{description}</ThemedText>}
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <View
            style={[
              styles.trendIndicator,
              { backgroundColor: getColorForTrend() }
            ]}
          />
          <ThemedText style={[styles.trendValue, { color: getColorForTrend() }]}>
            {trendValue}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30%',
    minWidth: 100,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: '#9e9e9e',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  trendValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default PerformanceMetricsCard; 