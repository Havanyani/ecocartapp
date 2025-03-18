import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AnalyticMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: 'collection' | 'environmental' | 'financial';
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
  }>;
  details?: {
    [key: string]: {
      label: string;
      value: number;
      percentage: number;
    };
  };
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    label: string;
  };
}

interface PerformanceMetricsAnalyticsProps {
  metrics: AnalyticMetric[];
  timeframe: string;
  onMetricPress?: (id: string) => void;
}

export function PerformanceMetricsAnalytics({
  metrics,
  timeframe,
  onMetricPress,
}: PerformanceMetricsAnalyticsProps) {
  const getCategoryColor = (category: AnalyticMetric['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const getInsightColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return '#2e7d32';
      case 'negative': return '#d32f2f';
      case 'neutral': return '#ed6c02';
      default: return '#666';
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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
        <ThemedText style={styles.title}>Analytics Overview</ThemedText>
        <ThemedText style={styles.timeframe}>{timeframe}</ThemedText>
      </View>

      <View style={styles.metricsList}>
        {metrics.map(metric => (
          <HapticTab
            key={metric.id}
            style={styles.metricCard}
            onPress={() => onMetricPress?.(metric.id)}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricInfo}>
                <IconSymbol
                  name={metric.icon}
                  size={24}
                  color={getCategoryColor(metric.category)}
                />
                <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
              </View>
              <View style={styles.changeIndicator}>
                {metric.previousValue > 0 && (
                  <>
                    <IconSymbol
                      name={metric.value >= metric.previousValue ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={metric.value >= metric.previousValue ? '#2e7d32' : '#d32f2f'}
                    />
                    <ThemedText
                      style={[
                        styles.changeText,
                        {
                          color: metric.value >= metric.previousValue ? '#2e7d32' : '#d32f2f',
                        },
                      ]}
                    >
                      {formatChange(calculateChange(metric.value, metric.previousValue))}
                    </ThemedText>
                  </>
                )}
              </View>
            </View>

            <ThemedText style={styles.metricValue}>
              {formatValue(metric.value)}
              <ThemedText style={styles.unitText}> {metric.unit}</ThemedText>
            </ThemedText>

            {metric.insights.length > 0 && (
              <View style={styles.insightsList}>
                {metric.insights.map((insight, index) => (
                  <View
                    key={index}
                    style={[
                      styles.insightItem,
                      { backgroundColor: getInsightColor(insight.type) + '10' },
                    ]}
                  >
                    <IconSymbol
                      name={
                        insight.type === 'positive'
                          ? 'information'
                          : insight.type === 'negative'
                          ? 'alert'
                          : 'information-outline'
                      }
                      size={16}
                      color={getInsightColor(insight.type)}
                    />
                    <ThemedText
                      style={[
                        styles.insightText,
                        { color: getInsightColor(insight.type) },
                      ]}
                    >
                      {insight.message}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {metric.details && (
              <View style={styles.detailsList}>
                {Object.entries(metric.details).map(([key, detail]) => (
                  <View key={key} style={styles.detailItem}>
                    <View style={styles.detailHeader}>
                      <ThemedText style={styles.detailLabel}>
                        {detail.label}
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {formatValue(detail.value)}
                        <ThemedText style={styles.detailUnit}>
                          {' '}
                          {metric.unit}
                        </ThemedText>
                      </ThemedText>
                    </View>
                    <View style={styles.detailProgress}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${detail.percentage}%`,
                            backgroundColor: getCategoryColor(metric.category),
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </HapticTab>
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
  timeframe: {
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
    gap: 12,
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
    fontSize: 16,
    fontWeight: '600',
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
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  unitText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
  },
  detailsList: {
    gap: 12,
    marginTop: 4,
  },
  detailItem: {
    gap: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailUnit: {
    fontSize: 12,
    color: '#666',
  },
  detailProgress: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
}); 