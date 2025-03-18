import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface RouteOptimizationCardProps {
  route: {
    totalDistance: number;
    estimatedTime: number;
    stops: Array<{
      id: string;
      type: 'delivery' | 'pickup';
      address: string;
      scheduledTime: string;
    }>;
  };
  onRefreshRoute: () => void;
  testID?: string;
}

export function RouteOptimizationCard({ route, onRefreshRoute, testID }: RouteOptimizationCardProps): JSX.Element {
  return (
    <ThemedView style={styles.container} testID={testID}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Optimized Route</ThemedText>
        <TouchableOpacity onPress={onRefreshRoute}>
          <IconSymbol name="refresh" size={24} />
        </TouchableOpacity>
      </View>
      <ThemedText>Distance: {route.totalDistance.toFixed(1)} km</ThemedText>
      <ThemedText>Estimated Time: {route.estimatedTime} min</ThemedText>
      <ThemedText>Stops: {route.stops.length}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 