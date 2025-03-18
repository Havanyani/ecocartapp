import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface PlaceholderProps {
  type: 'chart' | 'table' | 'card';
  rows?: number;
  animated?: boolean;
}

export function PerformanceMetricsPlaceholder({
  type = 'card',
  rows = 3,
  animated = true,
}: PlaceholderProps) {
  const shimmerValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();

      return () => shimmerAnimation.stop();
    }
  }, [animated]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <Animated.View style={[styles.chartHeader, { opacity }]} />
      <Animated.View style={[styles.chartBody, { opacity }]} />
      <View style={styles.chartLegend}>
        {[...Array(4)].map((_, index) => (
          <Animated.View
            key={index}
            style={[styles.legendItem, { opacity }]}
          />
        ))}
      </View>
    </View>
  );

  const renderTable = () => (
    <View style={styles.tableContainer}>
      <Animated.View style={[styles.tableHeader, { opacity }]} />
      {[...Array(rows)].map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.tableRow, { opacity }]}
        />
      ))}
    </View>
  );

  const renderCard = () => (
    <View style={styles.cardContainer}>
      <Animated.View style={[styles.cardHeader, { opacity }]} />
      <View style={styles.cardContent}>
        {[...Array(3)].map((_, index) => (
          <Animated.View
            key={index}
            style={[styles.cardLine, { opacity }]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {type === 'chart' && renderChart()}
      {type === 'table' && renderTable()}
      {type === 'card' && renderCard()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    gap: 16,
  },
  chartHeader: {
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  chartBody: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    width: 60,
    height: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  tableContainer: {
    gap: 12,
  },
  tableHeader: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  tableRow: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  cardContainer: {
    gap: 16,
  },
  cardHeader: {
    height: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  cardContent: {
    gap: 12,
  },
  cardLine: {
    height: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
}); 