import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StatItem {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  category: 'collection' | 'environmental' | 'financial';
  comparison?: {
    label: string;
    value: number;
  };
}

interface PerformanceMetricsStatsProps {
  stats: StatItem[];
  timeframe: string;
  comparisonTimeframe?: string;
}

export function PerformanceMetricsStats({
  stats,
  timeframe,
  comparisonTimeframe,
}: PerformanceMetricsStatsProps) {
  const getCategoryColor = (category: StatItem['category']) => {
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Performance Statistics</ThemedText>
        <ThemedText style={styles.timeframe}>{timeframe}</ThemedText>
      </View>

      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.id} style={styles.statCard}>
            <View style={styles.statHeader}>
              <IconSymbol
                name={stat.icon}
                size={20}
                color={getCategoryColor(stat.category)}
              />
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
            </View>

            <View style={styles.statValue}>
              <ThemedText style={styles.valueText}>
                {formatValue(stat.value)}
              </ThemedText>
              <ThemedText style={styles.unitText}>{stat.unit}</ThemedText>
            </View>

            <View style={styles.statFooter}>
              <View style={styles.changeIndicator}>
                <IconSymbol
                  name={stat.change > 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={stat.change > 0 ? '#2e7d32' : '#d32f2f'}
                />
                <ThemedText
                  style={[
                    styles.changeText,
                    { color: stat.change > 0 ? '#2e7d32' : '#d32f2f' },
                  ]}
                >
                  {formatChange(stat.change)}
                </ThemedText>
              </View>

              {stat.comparison && (
                <View style={styles.comparison}>
                  <ThemedText style={styles.comparisonLabel}>
                    {stat.comparison.label}
                  </ThemedText>
                  <ThemedText style={styles.comparisonValue}>
                    {formatValue(stat.comparison.value)} {stat.unit}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {comparisonTimeframe && (
        <ThemedText style={styles.comparisonTimeframe}>
          Compared to {comparisonTimeframe}
        </ThemedText>
      )}
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
  timeframe: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
  },
  statFooter: {
    gap: 8,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  comparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
  },
  comparisonValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  comparisonTimeframe: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
}); 