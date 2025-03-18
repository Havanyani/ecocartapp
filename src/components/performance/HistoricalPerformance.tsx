import { useTheme } from '@/hooks/useTheme';
import { performanceAnalytics } from '@/utils/PerformanceAnalytics';
import React, { useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryLine,
    VictoryPie,
    VictoryTheme,
    VictoryTooltip,
    VictoryVoronoiContainer
} from 'victory-native';

type TimeRange = 'hour' | 'day' | 'week';
type MetricType = 'memory' | 'network' | 'render' | 'frameRate' | 'interaction';
type ChartType = 'line' | 'bar' | 'distribution' | 'scatter' | 'area';

interface ChartData {
  x: number;
  y: number;
  label: string;
}

interface DistributionData {
  x: string;
  y: number;
  label: string;
}

export const HistoricalPerformance: React.FC = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('hour');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('memory');
  const [chartType, setChartType] = useState<ChartType>('line');

  const historicalData = performanceAnalytics.getHistoricalData(timeRange);
  const stats = performanceAnalytics.getPerformanceStats(timeRange);

  const getChartData = (): ChartData[] => {
    return historicalData.timestamps.map((timestamp, index) => {
      let value: number;
      let label: string;

      switch (selectedMetric) {
        case 'memory':
          value = historicalData.memoryUsage[index];
          label = `${value.toFixed(1)} MB`;
          break;
        case 'network':
          value = historicalData.networkLatency[index];
          label = `${value} ms`;
          break;
        case 'render':
          value = historicalData.renderTime[index];
          label = `${value.toFixed(1)} ms`;
          break;
        case 'frameRate':
          value = historicalData.frameRate[index];
          label = `${value} fps`;
          break;
        case 'interaction':
          value = historicalData.interactionDelay[index];
          label = `${value.toFixed(1)} ms`;
          break;
        default:
          value = 0;
          label = '';
      }

      return {
        x: timestamp,
        y: value,
        label,
      };
    });
  };

  const getDistributionData = (): DistributionData[] => {
    const metricStats = stats[selectedMetric];
    return [
      { x: 'Min', y: metricStats.min, label: `${metricStats.min.toFixed(1)}` },
      { x: 'Average', y: metricStats.average, label: `${metricStats.average.toFixed(1)}` },
      { x: 'Median', y: metricStats.median, label: `${metricStats.median.toFixed(1)}` },
      { x: 'Mode', y: metricStats.mode, label: `${metricStats.mode.toFixed(1)}` },
      { x: 'Std Dev', y: metricStats.standardDeviation, label: `${metricStats.standardDeviation.toFixed(1)}` },
      { x: 'P95', y: metricStats.p95, label: `${metricStats.p95.toFixed(1)}` },
      { x: 'P99', y: metricStats.p99, label: `${metricStats.p99.toFixed(1)}` },
      { x: 'Max', y: metricStats.max, label: `${metricStats.max.toFixed(1)}` },
    ];
  };

  const getMetricLabel = (): string => {
    switch (selectedMetric) {
      case 'memory':
        return 'Memory Usage (MB)';
      case 'network':
        return 'Network Latency (ms)';
      case 'render':
        return 'Render Time (ms)';
      case 'frameRate':
        return 'Frame Rate (fps)';
      case 'interaction':
        return 'Interaction Delay (ms)';
      default:
        return '';
    }
  };

  const handleExport = async () => {
    try {
      const data = performanceAnalytics.exportData(timeRange);
      await Share.share({
        message: data,
        title: `Performance Data - ${timeRange}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const renderChart = () => {
    const chartProps = {
      theme: VictoryTheme.material,
      width: 350,
      height: 300,
      containerComponent: (
        <VictoryVoronoiContainer
          labels={({ datum }) => datum.label}
          labelComponent={<VictoryTooltip />}
        />
      ),
    };

    switch (chartType) {
      case 'line':
        return (
          <VictoryChart {...chartProps}>
            <VictoryAxis
              tickFormat={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => value.toFixed(0)}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryLine
              data={getChartData()}
              style={{
                data: { stroke: theme.colors.primary },
              }}
            />
          </VictoryChart>
        );

      case 'bar':
        return (
          <VictoryChart {...chartProps}>
            <VictoryAxis
              tickFormat={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => value.toFixed(0)}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryBar
              data={getChartData()}
              style={{
                data: { fill: theme.colors.primary },
              }}
            />
          </VictoryChart>
        );

      case 'distribution':
        return (
          <VictoryChart {...chartProps}>
            <VictoryPie
              data={getDistributionData()}
              colorScale="qualitative"
              labels={({ datum }) => `${datum.x}: ${datum.label}`}
            />
          </VictoryChart>
        );

      case 'scatter':
        return (
          <VictoryChart {...chartProps}>
            <VictoryAxis
              tickFormat={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => value.toFixed(0)}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryLine
              data={getChartData()}
              style={{
                data: { stroke: theme.colors.primary },
                points: { fill: theme.colors.primary },
              }}
            />
          </VictoryChart>
        );

      case 'area':
        return (
          <VictoryChart {...chartProps}>
            <VictoryAxis
              tickFormat={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => value.toFixed(0)}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text },
              }}
            />
            <VictoryLine
              data={getChartData()}
              style={{
                data: { 
                  stroke: theme.colors.primary,
                  fill: theme.colors.primary,
                  fillOpacity: 0.2,
                },
              }}
            />
          </VictoryChart>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.timeRangeControls}>
          {(['hour', 'day', 'week'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.selectedTimeRange,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.selectedTimeRangeText,
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.metricControls}>
          {(['memory', 'network', 'render', 'frameRate', 'interaction'] as MetricType[]).map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.metricButton,
                selectedMetric === metric && styles.selectedMetric,
              ]}
              onPress={() => setSelectedMetric(metric)}
            >
              <Text style={[
                styles.metricText,
                selectedMetric === metric && styles.selectedMetricText,
              ]}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartTypeControls}>
          {(['line', 'bar', 'distribution', 'scatter', 'area'] as ChartType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chartTypeButton,
                chartType === type && styles.selectedChartType,
              ]}
              onPress={() => setChartType(type)}
            >
              <Text style={[
                styles.chartTypeText,
                chartType === type && styles.selectedChartTypeText,
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export Data</Text>
        </TouchableOpacity>
      </View>

      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
  },
  controls: {
    marginBottom: 16,
  },
  timeRangeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeRangeButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#F2F2F7',
  },
  selectedTimeRange: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    textAlign: 'center',
    color: '#000000',
  },
  selectedTimeRangeText: {
    color: '#FFFFFF',
  },
  metricControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricButton: {
    padding: 8,
    margin: 4,
    borderRadius: 4,
    backgroundColor: '#F2F2F7',
    minWidth: '18%',
  },
  selectedMetric: {
    backgroundColor: '#007AFF',
  },
  metricText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#000000',
  },
  selectedMetricText: {
    color: '#FFFFFF',
  },
  chartTypeControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartTypeButton: {
    padding: 8,
    margin: 4,
    borderRadius: 4,
    backgroundColor: '#F2F2F7',
    minWidth: '18%',
  },
  selectedChartType: {
    backgroundColor: '#007AFF',
  },
  chartTypeText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#000000',
  },
  selectedChartTypeText: {
    color: '#FFFFFF',
  },
  exportButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 