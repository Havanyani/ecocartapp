import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface MetricItem {
  id: string;
  title: string;
  value: number;
  unit: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  trend?: number;
  color?: string;
}

interface PerformanceMetricsGridProps {
  metrics: MetricItem[];
  onMetricPress?: (metricId: string) => void;
}

export function PerformanceMetricsGrid({ metrics, onMetricPress }: PerformanceMetricsGridProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [metrics]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <Animated.View
            key={metric.id}
            style={[
              styles.gridItem,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <HapticTab
              style={[styles.metricCard, { borderColor: metric.color || '#2e7d32' }]}
              onPress={() => onMetricPress?.(metric.id)}
            >
              <IconSymbol
                name={metric.icon}
                size={24}
                color={metric.color || '#2e7d32'}
              />
              <ThemedText style={styles.metricTitle}>{metric.title}</ThemedText>
              <ThemedText style={[styles.metricValue, { color: metric.color || '#2e7d32' }]}>
                {metric.value}
                <ThemedText style={styles.metricUnit}>{metric.unit}</ThemedText>
              </ThemedText>
              
              {metric.trend !== undefined && (
                <View style={styles.trendContainer}>
                  <IconSymbol
                    name={metric.trend >= 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={metric.trend >= 0 ? '#2e7d32' : '#d32f2f'}
                  />
                  <ThemedText
                    style={[
                      styles.trendValue,
                      { color: metric.trend >= 0 ? '#2e7d32' : '#d32f2f' },
                    ]}
                  >
                    {Math.abs(metric.trend)}%
                  </ThemedText>
                </View>
              )}
            </HapticTab>
          </Animated.View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  metricCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 