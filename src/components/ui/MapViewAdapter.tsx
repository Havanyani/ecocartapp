import { ConditionalImport } from '@/utils/ConditionalImport';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Get react-native-maps using the ConditionalImport utility
const reactNativeMaps = ConditionalImport.reactNativeMaps;

// Export mock components for web platform
export const Marker = (props: any) => {
  if (Platform.OS === 'web') return null;
  return <reactNativeMaps.Marker {...props} />;
};

export const Polyline = (props: any) => {
  if (Platform.OS === 'web') return null;
  return <reactNativeMaps.Polyline {...props} />;
};

export const PROVIDER_GOOGLE = reactNativeMaps.PROVIDER_GOOGLE;
export const Location = { longitude: 0, latitude: 0 };

// MapView component - platform specific
const MapView = (props: any) => {
  // On web, show a fallback message
  if (Platform.OS === 'web') {
    return <WebMapFallback {...props} />;
  }
  
  // On native platforms
  const RealMapView = reactNativeMaps.default;
  return <RealMapView {...props} />;
};

// Fallback component for web
const WebMapFallback = (props: any) => {
  return (
    <ThemedView style={[styles.container, props.style]}>
      <ThemedText style={styles.text}>
        Maps are only available on mobile devices.
      </ThemedText>
      <ThemedText style={styles.subText}>
        Please use the Expo Go app or a native build to view maps.
      </ThemedText>
      {props.children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default MapView; 