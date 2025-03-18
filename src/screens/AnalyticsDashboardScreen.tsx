import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
  }>;
}

interface ImpactMetric {
  value: number;
  label: string;
  icon: string;
  unit: string;
}

export function AnalyticsDashboardScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const plasticData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43],
    }],
  };

  const creditData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [100, 225, 140, 400, 495, 215],
    }],
  };

  const impactMetrics: ImpactMetric[] = [
    { value: 784, label: 'Plastic Bottles', icon: 'bottle-soda', unit: '' },
    { value: 1569, label: 'Plastic Bags', icon: 'shopping', unit: '' },
    { value: 523.4, label: 'CO₂ Emissions', icon: 'molecule-co2', unit: 'kg' }
  ];

  return (
    <ScrollView 
      style={styles.container}
      testID="analytics-dashboard"
      accessibilityLabel="Analytics Dashboard"
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Sustainability Impact</ThemedText>
        
        <View style={styles.timeframeSelector}>
          {['week', 'month', 'year'].map((period) => (
            <HapticTab
              key={period}
              style={[
                styles.timeframeButton,
                timeframe === period && styles.selectedTimeframe
              ]}
              onPress={() => setTimeframe(period as typeof timeframe)}
              accessibilityLabel={`Show ${period}ly data`}
              accessibilityState={{ selected: timeframe === period }}
            >
              <ThemedText style={[
                styles.timeframeText,
                timeframe === period && styles.selectedTimeframeText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </ThemedText>
            </HapticTab>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardTitle}>Plastic Collection Trends</ThemedText>
        <LineChart
          data={plasticData}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            labelColor: () => '#666',
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#2e7d32',
            },
          }}
          bezier
          style={styles.chart}
        />
      </ThemedView>

      <View style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statValue}>523.4 kg</ThemedText>
          <ThemedText style={styles.statLabel}>Total Plastic Collected</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statValue}>R 2,617</ThemedText>
          <ThemedText style={styles.statLabel}>Credits Earned</ThemedText>
        </ThemedView>
      </View>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardTitle}>Environmental Impact</ThemedText>
        <ThemedText style={styles.impactText}>
          Your recycling efforts have saved the equivalent of:
        </ThemedText>
        <View style={styles.impactStats}>
          {impactMetrics.map((metric) => (
            <View key={metric.label} style={styles.impactItem}>
              <IconSymbol name={metric.icon} size={24} color="#2e7d32" />
              <ThemedText style={styles.impactValue}>
                {metric.value}{metric.unit}
              </ThemedText>
              <ThemedText style={styles.impactLabel}>{metric.label}</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeframe: {
    backgroundColor: '#e8f5e9',
  },
  timeframeText: {
    color: '#666',
  },
  selectedTimeframeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  impactText: {
    fontSize: 16,
    marginBottom: 12,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  impactItem: {
    alignItems: 'center',
    gap: 8,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  impactLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 