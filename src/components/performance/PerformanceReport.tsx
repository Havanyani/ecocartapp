import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MetricsPersistenceService } from '@/services/MetricsPersistenceService';
import { PerformanceExportService } from '@/services/PerformanceExportService';
import { colors } from '@/theme/colors';
import { TimeSeriesMetrics } from '@/types/PerformanceMonitoring';
import { MetricsAggregation } from '@/utils/MetricsAggregation';
import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { MetricsChart } from './MetricsChart';

const TIME_RANGES = {
  '1H': 60 * 60 * 1000,
  '24H': 24 * 60 * 60 * 1000,
  '7D': 7 * 24 * 60 * 60 * 1000
} as const;

type TimeRange = keyof typeof TIME_RANGES;

interface MetricReport {
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: Parameters<typeof IconSymbol>[0]['name'];
}

interface Props {
  metrics: MetricReport[];
  timeframe: string;
}

export function PerformanceReport({ metrics, timeframe }: Props) {
  const [metricsData, setMetricsData] = useState<TimeSeriesMetrics>({});
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1H');
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadMetrics();
  }, [selectedRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const range = TIME_RANGES[selectedRange];
      const data = await MetricsPersistenceService.loadMetrics({
        start: Date.now() - range
      });
      const aggregatedData = MetricsAggregation.aggregateByTimeWindow(data, 5 * 60 * 1000);
      setMetricsData(aggregatedData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await PerformanceExportService.exportMetrics('json');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const styles = createStyles(isDark, width);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading metrics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            <IconSymbol name="chart-box" size={24} color="#2e7d32" />
            Performance Report
          </ThemedText>
          <HapticTab onPress={handleExport} style={styles.exportButton}>
            <IconSymbol name="export" size={20} color="#2e7d32" />
            <ThemedText style={styles.exportText}>Export</ThemedText>
          </HapticTab>
        </View>

        <View 
          style={styles.timeRangeContainer}
          accessibilityRole="radiogroup"
          accessibilityLabel="Time range selection"
        >
          {(Object.keys(TIME_RANGES) as TimeRange[]).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                selectedRange === range && styles.rangeButtonSelected
              ]}
              onPress={() => setSelectedRange(range)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedRange === range }}
              accessibilityLabel={`${range} time range`}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  selectedRange === range && styles.rangeButtonTextSelected
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <MetricsChart
          data={metricsData}
          metric="latency"
          title="Message Latency"
          color={colors[isDark ? 'orangeDark' : 'orange']}
        />

        <MetricsChart
          data={metricsData}
          metric="throughput"
          title="Message Throughput"
          color={colors[isDark ? 'greenDark' : 'green']}
        />

        <MetricsChart
          data={metricsData}
          metric="compressionRatio"
          title="Compression Ratio"
          color={colors[isDark ? 'purpleDark' : 'purple']}
        />

        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <IconSymbol name={metric.icon} size={24} color="#2e7d32" />
              <ThemedText style={styles.metricValue}>
                {metric.value} {metric.unit}
              </ThemedText>
              <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
              <View style={styles.changeIndicator}>
                <IconSymbol
                  name={metric.change >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={metric.change >= 0 ? '#2e7d32' : '#d32f2f'}
                />
                <ThemedText
                  style={[
                    styles.changeText,
                    { color: metric.change >= 0 ? '#2e7d32' : '#d32f2f' }
                  ]}
                >
                  {Math.abs(metric.change).toFixed(1)}%
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, width: number) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? colors.backgroundDark : colors.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? colors.backgroundDark : colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: isDark ? colors.textDark : colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? colors.textDark : colors.text,
  },
  exportButton: {
    backgroundColor: isDark ? colors.primaryDark : colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  rangeButton: {
    paddingHorizontal: width < 375 ? 12 : 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isDark ? colors.surfaceDark : colors.surface,
    borderWidth: 1,
    borderColor: isDark ? colors.primaryDark : colors.primary,
  },
  rangeButtonSelected: {
    backgroundColor: isDark ? colors.primaryDark : colors.primary,
  },
  rangeButtonText: {
    color: isDark ? colors.primaryDark : colors.primary,
    fontSize: width < 375 ? 12 : 14,
    fontWeight: '600',
  },
  rangeButtonTextSelected: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  changeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 