import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartSeries } from '@/types/PerformanceMonitoring';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

interface PerformanceMetricsChartProps {
  series: ChartSeries[];
  timeframe: string;
  unit: string;
  title?: string;
  subtitle?: string;
  onPointPress?: (seriesId: string, point: { date: Date; value: number }) => void;
}

export function PerformanceMetricsChart({
  series,
  timeframe,
  unit,
  title = 'Performance Trends',
  subtitle,
  onPointPress,
}: PerformanceMetricsChartProps) {
  const screenWidth = Dimensions.get('window').width - 48;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 1,
    });
  };

  const calculateChange = (data: { date: Date; value: number }[]) => {
    if (data.length < 2) return 0;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    return ((last - first) / first) * 100;
  };

  const chartData = {
    labels: series[0].data.map(point => formatDate(point.date)),
    datasets: series.map(s => ({
      data: s.data.map(point => point.value),
      color: () => s.color,
      strokeWidth: 2,
    })),
  };

  const legendItems: { id: string; label: string; value: number; change: number; color: string }[] = series.map(s => ({
    id: s.id,
    label: s.label,
    value: s.data[s.data.length - 1].value,
    change: calculateChange(s.data),
    color: s.color,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
        <ThemedText style={styles.timeframe}>{timeframe}</ThemedText>
      </View>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
        onDataPointClick={({ index, dataset }) => {
          const seriesIndex = chartData.datasets.indexOf(dataset);
          onPointPress?.(
            series[seriesIndex].id,
            series[seriesIndex].data[index]
          );
        }}
      />

      <View style={styles.legend}>
        {legendItems.map(item => (
          <View key={item.id} style={styles.legendItem}>
            <View style={styles.legendHeader}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <ThemedText style={styles.legendLabel}>{item.label}</ThemedText>
              <View style={styles.changeIndicator}>
                <IconSymbol
                  name={item.change >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={item.change >= 0 ? '#2e7d32' : '#d32f2f'}
                />
                <ThemedText
                  style={[
                    styles.changeText,
                    { color: item.change >= 0 ? '#2e7d32' : '#d32f2f' },
                  ]}
                >
                  {item.change.toFixed(1)}%
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.legendValue}>
              {formatValue(item.value)} {unit}
            </ThemedText>
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
  timeframe: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  chart: {
    borderRadius: 8,
  },
  legend: {
    gap: 12,
  },
  legendItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
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
  legendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
}); 