import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ProgressMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  category: 'collection' | 'environmental' | 'financial';
  status: 'on-track' | 'at-risk' | 'behind';
}

interface PerformanceMetricsProgressProps {
  metrics: ProgressMetric[];
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsProgress({
  metrics,
  title = 'Progress Towards Goals',
  subtitle,
}: PerformanceMetricsProgressProps) {
  const progressAnims = useRef(metrics.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = metrics.map((metric, index) => {
      const progress = metric.current / metric.target;
      return Animated.timing(progressAnims[index], {
        toValue: Math.min(progress, 1),
        duration: 1000,
        useNativeDriver: false,
      });
    });

    Animated.stagger(200, animations).start();
  }, [metrics]);

  const getCategoryColor = (category: ProgressMetric['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const getStatusColor = (status: ProgressMetric['status']) => {
    switch (status) {
      case 'on-track': return '#2e7d32';
      case 'at-risk': return '#ed6c02';
      case 'behind': return '#d32f2f';
      default: return '#666';
    }
  };

  const formatProgress = (current: number, target: number) => {
    return `${Math.round((current / target) * 100)}%`;
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
        {metrics.map((metric, index) => (
          <View key={metric.id} style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <View style={styles.metricInfo}>
                <IconSymbol
                  name={metric.icon}
                  size={20}
                  color={getCategoryColor(metric.category)}
                />
                <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.progressText,
                  { color: getStatusColor(metric.status) },
                ]}
              >
                {formatProgress(metric.current, metric.target)}
              </ThemedText>
            </View>

            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getStatusColor(metric.status),
                  },
                ]}
              />
            </View>

            <View style={styles.metricDetails}>
              <ThemedText style={styles.currentValue}>
                {metric.current.toLocaleString()} {metric.unit}
              </ThemedText>
              <ThemedText style={styles.targetValue}>
                of {metric.target.toLocaleString()} {metric.unit}
              </ThemedText>
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
  metricsList: {
    gap: 16,
  },
  metricItem: {
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
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
  metricDetails: {
    flexDirection: 'row',
    gap: 4,
  },
  currentValue: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  targetValue: {
    fontSize: 12,
    color: '#666',
  },
}); 