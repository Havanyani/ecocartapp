import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Dummy components for web
export const Marker = (props: any) => null;
export const Polyline = (props: any) => null;
export const PROVIDER_GOOGLE = 'google';
export const Location = { longitude: 0, latitude: 0 };

interface MapViewProps extends ViewProps {
  initialRegion?: any;
  region?: any;
  showsUserLocation?: boolean;
  provider?: string;
  onRegionChange?: (region: any) => void;
  children?: React.ReactNode;
}

// Web fallback for MapView
const MapView: React.FC<MapViewProps> = (props) => {
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