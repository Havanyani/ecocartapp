import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { formatWeight } from '@/utils/formatters';
import { ThemedText } from '@/components/ui/ThemedText';

interface WeightTrackerProps {
  initialWeight?: number;
  currentWeight?: number;
  onWeightChange?: (weight: number) => void;
  onSubmit?: () => void;
  historicalData?: Array<{
    date: string;
    weight: number;
  }>;
  data?: {
    history: Array<{
      date: string;
      weight: number;
    }>;
    currentWeight: number;
    weeklyGoal: number;
    monthlyGoal: number;
  };
}

export function WeightTracker({ 
  initialWeight = 0,
  currentWeight,
  onWeightChange,
  onSubmit,
  historicalData = [],
  data
}: WeightTrackerProps) {
  const [weight, setWeight] = useState(data?.currentWeight ?? currentWeight ?? initialWeight);

  const chartData = {
    labels: (data?.history ?? historicalData).map(d => d.date),
    datasets: [{
      data: (data?.history ?? historicalData).map(d => d.weight)
    }]
  };

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    onWeightChange?.(newWeight);
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <View style={styles.container} testID="weight-tracker">
      <View style={styles.header}>
        <MaterialCommunityIcons name="scale" size={24} color="#666" />
        <ThemedText style={styles.title}>Weight Tracker</ThemedText>
      </View>
      
      <View style={styles.currentWeight}>
        <ThemedText style={styles.weightText}>
          {formatWeight(weight)}
        </ThemedText>
      </View>

      {(data?.history ?? historicalData).length > 0 ? (
        <LineChart
          data={chartData}
          width={300}
          height={200}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={styles.chart}
        />
      ) : (
        <ThemedText style={styles.noData}>No weight history available</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  currentWeight: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weightText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5196F4',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
}); 