/**
 * PerformanceMetricsChart.tsx
 * 
 * A chart component for displaying performance metrics.
 * Used by the WebPerformanceDashboard.
 */

import { ThemedText } from '@/components/ui/ThemedText';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Simple placeholder component when React Native Charts is not available
export function PerformanceMetricsChart({ data }: { data: any }): JSX.Element {
  // Format the data for display
  const formattedData = data.labels.map((label: string, index: number) => ({
    label,
    value: data.datasets[0].data[index],
  }));

  if (Platform.OS === 'web') {
    // Web implementation using DIVs for bar chart display
    return (
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          {formattedData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <ThemedText style={styles.label}>{item.label}</ThemedText>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: `${Math.min(100, (item.value / 5000) * 100)}%`,
                      backgroundColor: getColorForValue(item.value)
                    }
                  ]} 
                />
                <ThemedText style={styles.value}>
                  {item.value < 1 ? item.value.toFixed(3) : 
                   item.value < 100 ? item.value.toFixed(1) : 
                   Math.round(item.value)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4caf50' }]} />
            <ThemedText style={styles.legendText}>Good</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ff9800' }]} />
            <ThemedText style={styles.legendText}>Needs Improvement</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f44336' }]} />
            <ThemedText style={styles.legendText}>Poor</ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // Mobile implementation (simplified)
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Performance Metrics</ThemedText>
      {formattedData.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <ThemedText style={styles.listItemLabel}>{item.label}</ThemedText>
          <ThemedText style={[styles.listItemValue, { color: getColorForValue(item.value) }]}>
            {item.value < 1 ? item.value.toFixed(3) : 
             item.value < 100 ? item.value.toFixed(1) : 
             Math.round(item.value)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// Helper function to determine color based on value
const getColorForValue = (value: number): string => {
  // Define the thresholds for different metrics
  const isLCP = value > 1000; // Largest Contentful Paint is in ms
  const isFID = value > 100 && value < 1000; // First Input Delay is in ms (usually < 1000)
  const isCLS = value < 1; // Cumulative Layout Shift is a ratio (always < 1)

  if (isLCP) {
    return value < 2500 ? '#4caf50' : value < 4000 ? '#ff9800' : '#f44336';
  } else if (isFID) {
    return value < 100 ? '#4caf50' : value < 300 ? '#ff9800' : '#f44336';
  } else if (isCLS) {
    return value < 0.1 ? '#4caf50' : value < 0.25 ? '#ff9800' : '#f44336';
  }

  // Default behavior for other metrics
  return value < 50 ? '#4caf50' : value < 150 ? '#ff9800' : '#f44336';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 16,
  },
  barContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  barWrapper: {
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  value: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212121',
    left: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#757575',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLabel: {
    fontSize: 14,
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PerformanceMetricsChart; 