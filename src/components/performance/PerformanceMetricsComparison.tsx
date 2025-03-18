import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ComparisonPeriod {
  label: string;
  value: number;
  change?: number;
}

interface ComparisonMetric {
  id: string;
  label: string;
  unit: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: 'collection' | 'environmental' | 'financial';
  current: ComparisonPeriod;
  previous: ComparisonPeriod;
  target?: number;
}

interface PerformanceMetricsComparisonProps {
  metrics: ComparisonMetric[];
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsComparison({
  metrics,
  title = 'Period Comparison',
  subtitle,
}: PerformanceMetricsComparisonProps) {
  const getCategoryColor = (category: ComparisonMetric['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  };

  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>

      <View style={styles.metricsList}>
        {metrics.map(metric => (
          <View key={metric.id} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <IconSymbol
                name={metric.icon}
                size={20}
                color={getCategoryColor(metric.category)}
              />
              <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
            </View>

            <View style={styles.periodsContainer}>
              <View style={styles.periodColumn}>
                <ThemedText style={styles.periodLabel}>
                  {metric.current.label}
                </ThemedText>
                <View style={styles.valueContainer}>
                  <ThemedText style={styles.currentValue}>
                    {formatValue(metric.current.value)}
                  </ThemedText>
                  <ThemedText style={styles.unit}>{metric.unit}</ThemedText>
                </View>
                {metric.current.change && (
                  <View style={styles.changeIndicator}>
                    <IconSymbol
                      name={metric.current.change > 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={metric.current.change > 0 ? '#2e7d32' : '#d32f2f'}
                    />
                    <ThemedText
                      style={[
                        styles.changeText,
                        { color: metric.current.change > 0 ? '#2e7d32' : '#d32f2f' },
                      ]}
                    >
                      {formatChange(metric.current.change)}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.periodDivider} />

              <View style={styles.periodColumn}>
                <ThemedText style={styles.periodLabel}>
                  {metric.previous.label}
                </ThemedText>
                <View style={styles.valueContainer}>
                  <ThemedText style={styles.previousValue}>
                    {formatValue(metric.previous.value)}
                  </ThemedText>
                  <ThemedText style={styles.unit}>{metric.unit}</ThemedText>
                </View>
                {metric.previous.change && (
                  <View style={styles.changeIndicator}>
                    <IconSymbol
                      name={metric.previous.change > 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={metric.previous.change > 0 ? '#2e7d32' : '#d32f2f'}
                    />
                    <ThemedText
                      style={[
                        styles.changeText,
                        { color: metric.previous.change > 0 ? '#2e7d32' : '#d32f2f' },
                      ]}
                    >
                      {formatChange(metric.previous.change)}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            {metric.target && (
              <View style={styles.targetSection}>
                <ThemedText style={styles.targetLabel}>Target Progress</ThemedText>
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${calculateProgress(metric.current.value, metric.target)}%`,
                        backgroundColor: getCategoryColor(metric.category),
                      },
                    ]}
                  />
                </View>
                <ThemedText style={styles.targetText}>
                  {formatValue(metric.current.value)} of {formatValue(metric.target)} {metric.unit}
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsList: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  periodColumn: {
    flex: 1,
    alignItems: 'center',
  },
  periodDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  previousValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  unit: {
    fontSize: 14,
    color: '#666',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  targetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  targetText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 