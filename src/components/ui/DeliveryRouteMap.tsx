import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from './ThemedView';

interface DeliveryRouteMapProps {
  stops: Array<{
    id: string;
    type: 'delivery' | 'pickup';
    address: string;
    scheduledTime: string;
  }>;
  currentPickup: {
    id: string;
    status: string;
  } | null;
  style?: ViewStyle;
  testID?: string;
}

export function DeliveryRouteMap({ stops, currentPickup, style, testID }: DeliveryRouteMapProps): JSX.Element {
  return (
    <ThemedView style={[styles.container, style]} testID={testID}>
      {/* Map implementation will go here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
}); 