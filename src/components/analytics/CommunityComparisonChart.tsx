/**
 * CommunityComparisonChart.tsx
 * 
 * A component that displays the user's environmental impact metrics
 * compared to local and national averages, using bar charts for visual comparison.
 */

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface ComparisonData {
  plasticCollected: number;
  co2Reduced: number;
  waterSaved: number;
}

interface CommunityComparisonChartProps {
  data: {
    user: ComparisonData;
    localAverage: ComparisonData;
    nationalAverage: ComparisonData;
    topPerformers: ComparisonData;
  };
}

type MetricKey = 'plasticCollected' | 'co2Reduced' | 'waterSaved';

export function CommunityComparisonChart({ data }: CommunityComparisonChartProps): JSX.Element {
  const { theme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('plasticCollected');

  const metrics = [
    { key: 'plasticCollected', label: 'Plastic', unit: 'kg', icon: 'recycle' },
    { key: 'co2Reduced', label: 'CO₂', unit: 'kg', icon: 'molecule-co2' },
    { key: 'waterSaved', label: 'Water', unit: 'L', icon: 'water' }
  ];

  const handleMetricChange = (index: number) => {
    setSelectedMetric(metrics[index].key as MetricKey);
  };

  const getMetricValue = (source: ComparisonData, metric: MetricKey) => {
    return source[metric];
  };

  // Find the maximum value for the current metric to calculate relative bar widths
  const maxValue = Math.max(
    getMetricValue(data.user, selectedMetric),
    getMetricValue(data.localAverage, selectedMetric),
    getMetricValue(data.nationalAverage, selectedMetric),
    getMetricValue(data.topPerformers, selectedMetric)
  );

  const calculateBarWidth = (value: number) => {
    // Use 80% of the screen width as the maximum width for bars
    const maxBarWidth = Dimensions.get('window').width * 0.7;
    return value > 0 
      ? (value / maxValue) * maxBarWidth 
      : 0;
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(1);
    }
  };

  const currentMetric = metrics.find(m => m.key === selectedMetric);

  return (
    <View style={styles.container}>
      <SegmentedControl
        values={metrics.map(m => m.label)}
        selectedIndex={metrics.findIndex(m => m.key === selectedMetric)}
        onChange={handleMetricChange}
        style={styles.metricSelector}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <ThemedText style={styles.legendText}>You</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
          <ThemedText style={styles.legendText}>Local Avg</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <ThemedText style={styles.legendText}>National Avg</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
          <ThemedText style={styles.legendText}>Top 10%</ThemedText>
        </View>
      </View>

      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <MaterialCommunityIcons 
            name={currentMetric?.icon as any} 
            size={24} 
            color={theme.colors?.primary} 
          />
          <ThemedText style={styles.chartTitle}>
            {currentMetric?.label} {selectedMetric === 'plasticCollected' ? 'Collected' : 'Saved'}
          </ThemedText>
        </View>

        <View style={styles.barChart}>
          {/* User's bar */}
          <ComparisonBar
            label="You"
            value={getMetricValue(data.user, selectedMetric)}
            maxValue={maxValue}
            barWidth={calculateBarWidth(getMetricValue(data.user, selectedMetric))}
            barColor="#4CAF50"
            unit={currentMetric?.unit || ''}
          />

          {/* Local Average bar */}
          <ComparisonBar
            label="Local Avg"
            value={getMetricValue(data.localAverage, selectedMetric)}
            maxValue={maxValue}
            barWidth={calculateBarWidth(getMetricValue(data.localAverage, selectedMetric))}
            barColor="#2196F3"
            unit={currentMetric?.unit || ''}
          />

          {/* National Average bar */}
          <ComparisonBar
            label="National Avg"
            value={getMetricValue(data.nationalAverage, selectedMetric)}
            maxValue={maxValue}
            barWidth={calculateBarWidth(getMetricValue(data.nationalAverage, selectedMetric))}
            barColor="#FF9800"
            unit={currentMetric?.unit || ''}
          />

          {/* Top Performers bar */}
          <ComparisonBar
            label="Top 10%"
            value={getMetricValue(data.topPerformers, selectedMetric)}
            maxValue={maxValue}
            barWidth={calculateBarWidth(getMetricValue(data.topPerformers, selectedMetric))}
            barColor="#9C27B0"
            unit={currentMetric?.unit || ''}
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.insightsContainer}>
        <ThemedText style={styles.insightsTitle}>Impact Insights</ThemedText>
        
        {getMetricValue(data.user, selectedMetric) > getMetricValue(data.localAverage, selectedMetric) ? (
          <InsightItem 
            icon="trophy" 
            text={`You're outperforming the local average by ${Math.round((getMetricValue(data.user, selectedMetric) / getMetricValue(data.localAverage, selectedMetric) - 1) * 100)}%!`}
          />
        ) : (
          <InsightItem 
            icon="trending-up" 
            text={`You're at ${Math.round((getMetricValue(data.user, selectedMetric) / getMetricValue(data.localAverage, selectedMetric)) * 100)}% of the local average.`}
          />
        )}
        
        <InsightItem 
          icon="target" 
          text={`To reach the top 10%, increase your impact by ${Math.round((getMetricValue(data.topPerformers, selectedMetric) / getMetricValue(data.user, selectedMetric) - 1) * 100)}%.`}
        />
        
        <TouchableOpacity style={styles.challengeButton}>
          <MaterialCommunityIcons name="arm-flex" size={18} color="#fff" />
          <ThemedText style={styles.challengeButtonText}>
            Join a Community Challenge
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

interface ComparisonBarProps {
  label: string;
  value: number;
  maxValue: number;
  barWidth: number;
  barColor: string;
  unit: string;
}

function ComparisonBar({
  label,
  value,
  maxValue,
  barWidth,
  barColor,
  unit
}: ComparisonBarProps): JSX.Element {
  const formattedValue = value >= 1000 
    ? `${(value / 1000).toFixed(1)}K` 
    : value.toFixed(1);

  return (
    <View style={styles.barContainer}>
      <ThemedText style={styles.barLabel}>{label}</ThemedText>
      <View style={styles.barWrapper}>
        <View 
          style={[
            styles.bar, 
            { 
              width: barWidth,
              backgroundColor: barColor 
            }
          ]} 
        />
        <ThemedText style={styles.barValue}>
          {formattedValue} {unit}
        </ThemedText>
      </View>
    </View>
  );
}

interface InsightItemProps {
  icon: string;
  text: string;
}

function InsightItem({ icon, text }: InsightItemProps): JSX.Element {
  return (
    <View style={styles.insightItem}>
      <MaterialCommunityIcons name={icon as any} size={20} color="#4CAF50" />
      <ThemedText style={styles.insightText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  metricSelector: {
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  barChart: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  barLabel: {
    width: 80,
    fontSize: 14,
  },
  barWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  barValue: {
    fontSize: 12,
    minWidth: 60,
  },
  insightsContainer: {
    borderRadius: 12,
    padding: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    marginLeft: 8,
    fontSize: 14,
  },
  challengeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  challengeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
}); 