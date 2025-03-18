import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText, ThemedView } from '@/components/ui';
import { HapticTab } from '@/components/ui/HapticTab';

interface ImpactVisualizationProps {
  data: {
    dates: string[];
    weights: number[];
    impacts: {
      co2Reduced: number[];
      treesEquivalent: number[];
      oceanWastePrevented: number[];
    };
  };
  onTimeframeChange?: (timeframe: 'week' | 'month' | 'year') => void;
  style?: object;
  testID?: string;
}

export function ImpactVisualization({
  data,
  onTimeframeChange,
  style,
  testID
}: ImpactVisualizationProps): JSX.Element {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 1,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    }
  };

  return (
    <ThemedView style={[styles.container, style]} testID={testID}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Impact Trends</ThemedText>
        <View style={styles.timeframeButtons}>
          <HapticTab
            onPress={() => onTimeframeChange?.('week')}
            style={styles.timeframeButton}
          >
            <ThemedText>Week</ThemedText>
          </HapticTab>
          <HapticTab
            onPress={() => onTimeframeChange?.('month')}
            style={styles.timeframeButton}
          >
            <ThemedText>Month</ThemedText>
          </HapticTab>
          <HapticTab
            onPress={() => onTimeframeChange?.('year')}
            style={styles.timeframeButton}
          >
            <ThemedText>Year</ThemedText>
          </HapticTab>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: data.dates,
            datasets: [
              {
                data: data.weights,
                color: (opacity = 1) => theme.colors.success,
                strokeWidth: 2
              }
            ]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          testID="weight-trend-chart"
        />
        <ThemedText style={styles.chartLabel}>Plastic Collection Trend</ThemedText>
      </View>

      <View style={styles.impactGrid}>
        <View style={styles.impactItem}>
          <BarChart
            data={{
              labels: ['CO₂'],
              datasets: [{ data: [data.impacts.co2Reduced[data.impacts.co2Reduced.length - 1]] }]
            }}
            width={screenWidth / 3 - 20}
            height={160}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => theme.colors.warning
            }}
            style={styles.miniChart}
            testID="co2-impact-chart"
          />
          <ThemedText style={styles.impactLabel}>CO₂ Reduced</ThemedText>
        </View>

        <View style={styles.impactItem}>
          <BarChart
            data={{
              labels: ['Trees'],
              datasets: [{ data: [data.impacts.treesEquivalent[data.impacts.treesEquivalent.length - 1]] }]
            }}
            width={screenWidth / 3 - 20}
            height={160}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => theme.colors.success
            }}
            style={styles.miniChart}
            testID="trees-impact-chart"
          />
          <ThemedText style={styles.impactLabel}>Trees Equivalent</ThemedText>
        </View>

        <View style={styles.impactItem}>
          <BarChart
            data={{
              labels: ['Ocean'],
              datasets: [{ data: [data.impacts.oceanWastePrevented[data.impacts.oceanWastePrevented.length - 1]] }]
            }}
            width={screenWidth / 3 - 20}
            height={160}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => theme.colors.info
            }}
            style={styles.miniChart}
            testID="ocean-impact-chart"
          />
          <ThemedText style={styles.impactLabel}>Ocean Waste Prevented</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
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
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    padding: 8,
    borderRadius: 8,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    alignItems: 'center',
  },
  miniChart: {
    borderRadius: 8,
  },
  impactLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
});
