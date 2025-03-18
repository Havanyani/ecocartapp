import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BreakdownItem {
  id: string;
  label: string;
  value: number;
  percentage: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: 'collection' | 'environmental' | 'financial';
  trend?: {
    value: number;
    label: string;
  };
}

interface PerformanceMetricsBreakdownProps {
  items: BreakdownItem[];
  total: number;
  unit: string;
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsBreakdown({
  items,
  total,
  unit,
  title = 'Performance Breakdown',
  subtitle,
}: PerformanceMetricsBreakdownProps) {
  const getCategoryColor = (category: BreakdownItem['category']) => {
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

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatTrend = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  const sortedItems = [...items].sort((a, b) => b.percentage - a.percentage);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
        <View style={styles.totalSection}>
          <ThemedText style={styles.totalLabel}>Total</ThemedText>
          <ThemedText style={styles.totalValue}>
            {formatValue(total)} {unit}
          </ThemedText>
        </View>
      </View>

      <View style={styles.breakdownList}>
        {sortedItems.map(item => (
          <View key={item.id} style={styles.breakdownItem}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <IconSymbol
                  name={item.icon}
                  size={20}
                  color={getCategoryColor(item.category)}
                />
                <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
              </View>
              <ThemedText style={styles.itemPercentage}>
                {formatPercentage(item.percentage)}
              </ThemedText>
            </View>

            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: getCategoryColor(item.category),
                  },
                ]}
              />
            </View>

            <View style={styles.itemDetails}>
              <ThemedText style={styles.itemValue}>
                {formatValue(item.value)} {unit}
              </ThemedText>
              {item.trend && (
                <View style={styles.trendContainer}>
                  <IconSymbol
                    name={item.trend.value > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={item.trend.value > 0 ? '#2e7d32' : '#d32f2f'}
                  />
                  <ThemedText
                    style={[
                      styles.trendValue,
                      { color: item.trend.value > 0 ? '#2e7d32' : '#d32f2f' },
                    ]}
                  >
                    {formatTrend(item.trend.value)}
                  </ThemedText>
                  <ThemedText style={styles.trendLabel}>
                    {item.trend.label}
                  </ThemedText>
                </View>
              )}
            </View>
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
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  breakdownList: {
    gap: 16,
  },
  breakdownItem: {
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 14,
    color: '#666',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 12,
    color: '#666',
  },
}); 