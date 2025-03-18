import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLine, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';

type VisualizationType = 'bar' | 'line' | 'pie';

interface PerformanceMetric {
  timestamp: number;
  memory: number;
  cpu: number;
  fps: number;
  latency: number;
  diskUsage: number;
}

interface PerformanceReport {
  startTime: number;
  endTime: number;
  metrics: PerformanceMetric[];
  summary: {
    memory: { avg: number; max: number; min: number };
    cpu: { avg: number; max: number; min: number };
    fps: { avg: number; max: number; min: number };
    latency: { avg: number; max: number; min: number };
    diskUsage: { avg: number; max: number; min: number };
  };
}

export function PerformanceAnalytics() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
  const [selectedMetric, setSelectedMetric] = useState<keyof PerformanceMetric>('memory');
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading performance data
      const data = generateMockData();
      setReport(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (): PerformanceReport => {
    const now = Date.now();
    const metrics: PerformanceMetric[] = [];
    const points = 60; // One point per minute for an hour

    for (let i = 0; i < points; i++) {
      metrics.push({
        timestamp: now - (points - i) * 60000,
        memory: 50 + Math.random() * 30,
        cpu: 40 + Math.random() * 40,
        fps: 55 + Math.random() * 10,
        latency: 100 + Math.random() * 200,
        diskUsage: 60 + Math.random() * 20,
      });
    }

    return {
      startTime: metrics[0].timestamp,
      endTime: metrics[metrics.length - 1].timestamp,
      metrics,
      summary: {
        memory: calculateStats(metrics.map(m => m.memory)),
        cpu: calculateStats(metrics.map(m => m.cpu)),
        fps: calculateStats(metrics.map(m => m.fps)),
        latency: calculateStats(metrics.map(m => m.latency)),
        diskUsage: calculateStats(metrics.map(m => m.diskUsage)),
      },
    };
  };

  const calculateStats = (values: number[]) => ({
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
  });

  const getMetricLabel = (metric: keyof PerformanceMetric): string => {
    switch (metric) {
      case 'memory':
        return 'Memory Usage (%)';
      case 'cpu':
        return 'CPU Usage (%)';
      case 'fps':
        return 'Frame Rate (FPS)';
      case 'latency':
        return 'Network Latency (ms)';
      case 'diskUsage':
        return 'Disk Usage (%)';
      default:
        return metric;
    }
  };

  const getMetricColor = (metric: keyof PerformanceMetric): string => {
    switch (metric) {
      case 'memory':
        return '#FF9500';
      case 'cpu':
        return '#FF2D55';
      case 'fps':
        return '#5856D6';
      case 'latency':
        return '#FF3B30';
      case 'diskUsage':
        return '#34C759';
      default:
        return theme.colors.primary;
    }
  };

  const exportReport = async () => {
    if (!report) return;

    const reportText = `Performance Report (${new Date(report.startTime).toLocaleString()} - ${new Date(report.endTime).toLocaleString()})

Summary:
${Object.entries(report.summary).map(([metric, stats]) => `
${getMetricLabel(metric as keyof PerformanceMetric)}:
  Average: ${stats.avg.toFixed(2)}
  Maximum: ${stats.max.toFixed(2)}
  Minimum: ${stats.min.toFixed(2)}
`).join('\n')}`;

    try {
      await Share.share({
        message: reportText,
        title: 'Performance Report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Analytics</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={exportReport}
        >
          <IconSymbol name="export" size={20} color={theme.colors.primary} />
          <Text style={styles.exportButtonText}>Export Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeRangeSelector}>
        {(['hour', 'day', 'week'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.selectedTimeRange,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.selectedTimeRangeText,
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.metricSelector}>
        {(['memory', 'cpu', 'fps', 'latency', 'diskUsage'] as const).map((metric) => (
          <TouchableOpacity
            key={metric}
            style={[
              styles.metricButton,
              selectedMetric === metric && styles.selectedMetric,
              { borderColor: getMetricColor(metric) },
            ]}
            onPress={() => setSelectedMetric(metric)}
          >
            <Text
              style={[
                styles.metricButtonText,
                selectedMetric === metric && { color: getMetricColor(metric) },
              ]}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={300}
          padding={{ top: 10, bottom: 40, left: 60, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }) => `${getMetricLabel(selectedMetric)}: ${datum.y.toFixed(1)}`}
              labelComponent={<VictoryTooltip />}
            />
          }
        >
          <VictoryAxis
            dependentAxis
            label={getMetricLabel(selectedMetric)}
            style={{
              axisLabel: { padding: 40 },
            }}
          />
          <VictoryAxis
            scale="time"
            tickFormat={(t) => new Date(t).toLocaleTimeString()}
            style={{
              axisLabel: { padding: 35 },
            }}
          />
          <VictoryArea
            data={report.metrics.map((m) => ({
              x: m.timestamp,
              y: m[selectedMetric],
            }))}
            style={{
              data: {
                fill: `${getMetricColor(selectedMetric)}20`,
                stroke: getMetricColor(selectedMetric),
              },
            }}
          />
          <VictoryLine
            data={report.metrics.map((m) => ({
              x: m.timestamp,
              y: m[selectedMetric],
            }))}
            style={{
              data: {
                stroke: getMetricColor(selectedMetric),
              },
            }}
          />
        </VictoryChart>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={[styles.statValue, { color: getMetricColor(selectedMetric) }]}>
              {report.summary[selectedMetric].avg.toFixed(1)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Maximum</Text>
            <Text style={[styles.statValue, { color: getMetricColor(selectedMetric) }]}>
              {report.summary[selectedMetric].max.toFixed(1)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Minimum</Text>
            <Text style={[styles.statValue, { color: getMetricColor(selectedMetric) }]}>
              {report.summary[selectedMetric].min.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exportButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedTimeRange: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeRangeText: {
    color: '#007AFF',
  },
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedMetric: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 