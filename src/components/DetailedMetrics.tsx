import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

interface ProcessingTime {
  operation: string;
  duration: number;
}

interface TotalMetrics {
  collections: number;
  achievements: number;
  system: number;
  failed: number;
  reconnects: number;
}

interface MetricsData {
  processingTime: ProcessingTime[];
  totalMetrics: TotalMetrics;
  messageLatency: number[];
  averageCompressionRatio: number;
  totalCollected: number;
  chartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

interface StatItemProps {
  label: string;
  value: string | number;
}

interface DetailedMetricsProps {
  metrics: MetricsData;
  onTimeframeChange?: (timeframe: 'Week' | 'Month' | 'Year') => void;
}

function StatItem({ label, value }: StatItemProps): JSX.Element {
  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  );
}

export function DetailedMetrics({ metrics, onTimeframeChange }: DetailedMetricsProps): JSX.Element {
  const processingTimeData = {
    labels: ['Compression', 'Encryption', 'Validation', 'Batch'],
    datasets: [{
      data: [
        metrics.processingTime.filter(p => p.operation.includes('compress')).reduce((a, b) => a + b.duration, 0),
        metrics.processingTime.filter(p => p.operation.includes('encrypt')).reduce((a, b) => a + b.duration, 0),
        metrics.processingTime.filter(p => p.operation.includes('validate')).reduce((a, b) => a + b.duration, 0),
        metrics.processingTime.filter(p => p.operation.includes('batch')).reduce((a, b) => a + b.duration, 0),
      ]
    }]
  };

  const messageTypeData = [
    {
      name: 'Collection',
      count: metrics.totalMetrics.collections,
      color: '#FF6384'
    },
    {
      name: 'Achievement',
      count: metrics.totalMetrics.achievements,
      color: '#36A2EB'
    },
    {
      name: 'System',
      count: metrics.totalMetrics.system,
      color: '#FFCE56'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="chart-bar" size={24} color="#2e7d32" />
        Collection Analytics
      </ThemedText>

      <View style={styles.timeframeContainer}>
        {['Week', 'Month', 'Year'].map(timeframe => (
          <HapticTab
            key={timeframe}
            style={styles.timeframeButton}
            onPress={() => onTimeframeChange?.(timeframe as 'Week' | 'Month' | 'Year')}
          >
            <ThemedText style={styles.timeframeText}>{timeframe}</ThemedText>
          </HapticTab>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <StatItem
          label="Total Collected"
          value={`${metrics.totalCollected}kg`}
        />
        <StatItem
          label="Peak Latency"
          value={`${Math.max(...metrics.messageLatency)}ms`}
        />
        <StatItem
          label="Failed Messages"
          value={metrics.totalMetrics.failed}
        />
        <StatItem
          label="Compression Savings"
          value={`${((1 - metrics.averageCompressionRatio) * 100).toFixed(1)}%`}
        />
        <StatItem
          label="Reconnections"
          value={metrics.totalMetrics.reconnects}
        />
      </View>

      <ThemedText style={styles.sectionTitle}>Processing Time Distribution</ThemedText>
      <BarChart
        data={processingTimeData}
        width={350}
        height={220}
        yAxisLabel=""
        yAxisSuffix="ms"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`
        }}
      />

      <ThemedText style={styles.sectionTitle}>Message Type Distribution</ThemedText>
      <PieChart
        data={messageTypeData}
        width={350}
        height={220}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
      />

      <LineChart
        data={metrics.chartData}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        }}
        style={styles.chart}
        bezier
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeframeButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  timeframeText: {
    fontSize: 16,
  },
  chart: {
    marginTop: 24,
  },
}); 