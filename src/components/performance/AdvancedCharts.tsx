import { useTheme } from '@/hooks/useTheme';
import { ExtendedProfileResult, Metrics } from '@/types/Performance';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryLine,
    VictoryPie,
} from 'victory-native';

interface ChartProps {
  data: ExtendedProfileResult[];
  metric: keyof Metrics;
  type: 'line' | 'area' | 'scatter' | 'pie' | 'distribution';
}

type ChartDataPoint = {
  x: string;
  y: number;
  label?: string;
};

export const AdvancedCharts: React.FC<ChartProps> = ({
  data,
  metric,
  type,
}) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const chartWidth = width - 48;
  const chartHeight = 200;

  const getPieChartData = (): ChartDataPoint[] => {
    const values = data.map(d => d.metrics[metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const segments = 5;
    const segmentSize = range / segments;

    const groups = new Array(segments).fill(0);
    values.forEach(value => {
      const index = Math.min(
        Math.floor((value - min) / segmentSize),
        segments - 1
      );
      groups[index]++;
    });

    return groups.map((count, i) => ({
      x: `Range ${i + 1}`,
      y: count,
      label: `${(min + i * segmentSize).toFixed(1)}-${(min + (i + 1) * segmentSize).toFixed(1)}`,
    }));
  };

  const getDistributionChartData = (): ChartDataPoint[] => {
    const values = data.map(d => d.metrics[metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const bins = 20;
    const binSize = range / bins;

    const histogram = new Array(bins).fill(0);
    values.forEach(value => {
      const index = Math.min(
        Math.floor((value - min) / binSize),
        bins - 1
      );
      histogram[index]++;
    });

    return histogram.map((count, i) => ({
      x: (min + i * binSize).toFixed(1),
      y: count,
    }));
  };

  const getTimeSeriesData = (): ChartDataPoint[] => {
    return data.map((d, i) => ({
      x: i.toString(),
      y: d.metrics[metric],
    }));
  };

  const chartColors = [
    theme.colors.primary,
    theme.colors.secondary || '#FF9500',
    '#34C759',
    '#FF3B30',
    '#5856D6',
  ];

  const renderChart = () => {
    switch (type) {
      case 'line': {
        const chartData = getTimeSeriesData();
        return (
          <VictoryChart
            width={chartWidth}
            height={chartHeight}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => t.toFixed(1)}
            />
            <VictoryAxis />
            <VictoryLine
              data={chartData}
              style={{
                data: { stroke: theme.colors.primary },
              }}
            />
            <VictoryBar
              data={[chartData[chartData.length - 1]]}
              style={{
                data: { fill: theme.colors.primary },
              }}
            />
          </VictoryChart>
        );
      }

      case 'area': {
        const chartData = getTimeSeriesData();
        return (
          <VictoryChart
            width={chartWidth}
            height={chartHeight}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => t.toFixed(1)}
            />
            <VictoryAxis />
            <VictoryBar
              data={chartData}
              style={{
                data: { fill: `${theme.colors.primary}40` },
              }}
            />
          </VictoryChart>
        );
      }

      case 'scatter': {
        const chartData = getTimeSeriesData();
        return (
          <VictoryChart
            width={chartWidth}
            height={chartHeight}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => t.toFixed(1)}
            />
            <VictoryAxis />
            <VictoryBar
              data={chartData}
              style={{
                data: { fill: theme.colors.primary },
              }}
            />
          </VictoryChart>
        );
      }

      case 'pie': {
        const chartData = getPieChartData();
        return (
          <View style={styles.pieContainer}>
            <VictoryPie
              width={chartWidth}
              height={chartHeight}
              data={chartData}
              colorScale={chartColors}
            />
            <View style={styles.legend}>
              {chartData.map((d, i) => (
                <View key={i} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: chartColors[i] },
                    ]}
                  />
                  <Text style={styles.legendText}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'distribution': {
        const chartData = getDistributionChartData();
        return (
          <VictoryChart
            width={chartWidth}
            height={chartHeight}
          >
            <VictoryAxis
              dependentAxis
              label="Frequency"
            />
            <VictoryAxis
              label="Value"
              tickFormat={(t) => t.toFixed(1)}
            />
            <VictoryBar
              data={chartData}
              style={{
                data: { fill: theme.colors.primary },
              }}
            />
          </VictoryChart>
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`${metric} ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}</Text>
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pieContainer: {
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 10,
  },
}); 