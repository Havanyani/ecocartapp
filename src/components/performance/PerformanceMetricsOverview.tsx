import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface OverviewMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: 'package-variant' | 'weight' | 'recycle' | 'credit-card-outline' | 'leaf';
  category: 'collection' | 'environmental' | 'financial';
  highlight?: boolean;
}

interface PerformanceMetricsOverviewProps {
  metrics: OverviewMetric[];
  timeframe: 'day' | 'week' | 'month' | 'year';
  onMetricPress?: (id: string) => void;
}

export function PerformanceMetricsOverview({
  metrics,
  timeframe,
  onMetricPress,
}: PerformanceMetricsOverviewProps) {
  const scaleAnims = useRef(metrics.map(() => new Animated.Value(0.95))).current;
  const fadeAnims = useRef(metrics.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = metrics.map((_, index) =>
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(100, animations).start();
  }, [metrics]);

  const getCategoryColor = (category: OverviewMetric['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatValue = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          <IconSymbol name="chart-areaspline" size={24} color="#2e7d32" />
          Performance Overview
        </ThemedText>
        <ThemedText style={styles.timeframe}>
          Last {timeframe}
        </ThemedText>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => {
          const growth = calculateGrowth(metric.value, metric.previousValue);
          return (
            <Animated.View
              key={metric.id}
              style={[
                styles.metricCard,
                metric.highlight && styles.highlightedCard,
                {
                  opacity: fadeAnims[index],
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <HapticTab
                style={styles.metricContent}
                onPress={() => onMetricPress?.(metric.id)}
              >
                <View style={styles.metricHeader}>
                  <IconSymbol
                    name={metric.icon}
                    size={20}
                    color={getCategoryColor(metric.category)}
                  />
                  <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
                </View>

                <ThemedText style={styles.metricValue}>
                  {formatValue(metric.value)}
                  <ThemedText style={styles.unitText}>{metric.unit}</ThemedText>
                </ThemedText>

                {growth !== 0 && (
                  <View style={styles.growthContainer}>
                    <IconSymbol
                      name={growth >= 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={growth >= 0 ? '#2e7d32' : '#d32f2f'}
                    />
                    <ThemedText
                      style={[
                        styles.growthText,
                        { color: growth >= 0 ? '#2e7d32' : '#d32f2f' },
                      ]}
                    >
                      {Math.abs(growth).toFixed(1)}%
                    </ThemedText>
                  </View>
                )}
              </HapticTab>
            </Animated.View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeframe: {
    fontSize: 14,
    color: '#666',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  highlightedCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  metricContent: {
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  unitText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
    marginLeft: 2,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 