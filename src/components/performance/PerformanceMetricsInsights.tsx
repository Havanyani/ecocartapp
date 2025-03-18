import React from 'react';
import { StyleSheet, View } from 'react-native';
import { InsightTrend } from '@/types/PerformanceMonitoring';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

interface Props {
  insights: InsightTrend[];
  timeframe: string;
  title?: string;
}

export function PerformanceMetricsInsights({
  insights,
  timeframe,
  title = 'Performance Insights'
}: Props) {
  const getInsightIcon = (type: InsightTrend['type']) => {
    switch (type) {
      case 'positive': return 'trending-up';
      case 'negative': return 'trending-down';
      case 'neutral': return 'trending-neutral';
      default: return 'information';
    }
  };

  const getInsightColor = (type: InsightTrend['type']) => {
    switch (type) {
      case 'positive': return '#2e7d32';
      case 'negative': return '#d32f2f';
      case 'neutral': return '#666666';
      default: return '#1976d2';
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.timeframe}>{timeframe}</ThemedText>

      <View style={styles.insightsGrid}>
        {insights.map(insight => (
          <View key={insight.id} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <IconSymbol
                name={getInsightIcon(insight.type)}
                size={24}
                color={getInsightColor(insight.type)}
              />
              <ThemedText style={styles.insightMetric}>
                {insight.metric}
              </ThemedText>
            </View>

            <ThemedText style={styles.description}>
              {insight.description}
            </ThemedText>

            {insight.recommendations?.length > 0 && (
              <View style={styles.recommendations}>
                <ThemedText style={styles.recommendationsTitle}>
                  Recommendations:
                </ThemedText>
                {insight.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <IconSymbol name="circle-small" size={16} color="#666" />
                    <ThemedText style={styles.recommendationText}>
                      {rec}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {insight.relatedMetrics?.length > 0 && (
              <View style={styles.relatedMetrics}>
                {insight.relatedMetrics.map((metric, index) => (
                  <View key={index} style={styles.metricItem}>
                    <ThemedText style={styles.metricLabel}>
                      {metric.label}
                    </ThemedText>
                    <ThemedText style={styles.metricValue}>
                      {metric.value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeframe: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  insightsGrid: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightMetric: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
  },
  recommendations: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
  },
  relatedMetrics: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
}); 