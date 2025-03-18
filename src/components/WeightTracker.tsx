import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface WeightHistory {
  date: string;
  weight: number;
}

interface WeightTrackerProps {
  currentWeight: number;
  credits: number;
  style?: ViewStyle;
  testID?: string;
  weeklyGoal?: number;
  monthlyGoal?: number;
  history: WeightHistory[];
  weeklyData: number[];
  onWeightUpdate?: (newWeight: number) => void;
}

export function WeightTracker({
  currentWeight,
  credits,
  style,
  testID,
  weeklyGoal,
  monthlyGoal,
  history,
  weeklyData,
  onWeightUpdate,
}: WeightTrackerProps) {
  const weeklyProgress = weeklyGoal ? Math.round((currentWeight / weeklyGoal) * 100) : null;
  const monthlyProgress = monthlyGoal ? Math.round((currentWeight / monthlyGoal) * 100) : null;

  const calculateTrend = () => {
    const trend = weeklyData.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return 0;
      return acc + (curr - arr[idx - 1]);
    }, 0) / (weeklyData.length - 1);

    return trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
  };

  const trend = calculateTrend();
  const totalWeight = weeklyData.reduce((sum, weight) => sum + weight, 0);
  const weeklyAverage = totalWeight / weeklyData.length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="scale" size={24} color="#2e7d32" />
        <ThemedText style={styles.title}>Weight Tracking</ThemedText>
      </View>

      <View style={styles.currentStats}>
        <View style={styles.weightDisplay}>
          <ThemedText testID="current-weight" style={styles.weightValue}>
            {currentWeight}kg
          </ThemedText>
          {onWeightUpdate && (
            <HapticTab onPress={() => onWeightUpdate(currentWeight + 0.5)}>
              <IconSymbol name="plus" size={24} color="#2e7d32" />
            </HapticTab>
          )}
        </View>

        {(weeklyGoal || monthlyGoal) && (
          <View style={styles.goals}>
            {weeklyGoal && (
              <ThemedText testID="weekly-goal">
                Weekly Goal: {weeklyGoal}kg ({weeklyProgress}%)
              </ThemedText>
            )}
            {monthlyGoal && (
              <ThemedText testID="monthly-goal">
                Monthly Goal: {monthlyGoal}kg ({monthlyProgress}%)
              </ThemedText>
            )}
          </View>
        )}
      </View>

      <View style={styles.trendSection}>
        <ThemedText style={styles.subtitle}>Trend Analysis</ThemedText>
        <View style={styles.trendContainer}>
          <IconSymbol
            name={trend === 'increasing' ? 'trending-up' : trend === 'decreasing' ? 'trending-down' : 'trending-neutral'}
            size={24}
            color={trend === 'increasing' ? '#2e7d32' : trend === 'decreasing' ? '#d32f2f' : '#666'}
          />
          <ThemedText style={[styles.trendText, {
            color: trend === 'increasing' ? '#2e7d32' : trend === 'decreasing' ? '#d32f2f' : '#666'
          }]}>
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{totalWeight.toFixed(1)}kg</ThemedText>
          <ThemedText style={styles.statLabel}>Total Collected</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{weeklyAverage.toFixed(1)}kg</ThemedText>
          <ThemedText style={styles.statLabel}>Weekly Average</ThemedText>
        </View>
      </View>

      <LineChart
        data={{
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            data: weeklyData
          }]
        }}
        width={350}
        height={200}
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
        style={styles.chart}
        bezier
      />

      <ThemedText style={styles.subtitle}>History</ThemedText>
      <View style={styles.history}>
        {history.length > 0 ? (
          history.map((entry, index) => (
            <ThemedText
              key={entry.date}
              testID={`history-${index}`}
              style={styles.historyItem}
            >
              {entry.date}: {entry.weight}kg
            </ThemedText>
          ))
        ) : (
          <ThemedText>No weight history available</ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  currentStats: {
    marginBottom: 24,
  },
  weightDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  goals: {
    gap: 8,
  },
  trendSection: {
    marginBottom: 16,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  history: {
    gap: 8,
  },
  historyItem: {
    fontSize: 14,
    color: '#666',
  },
}); 