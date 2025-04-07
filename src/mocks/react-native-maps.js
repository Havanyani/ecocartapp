// Mock implementation for react-native-maps
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MapViewMock = (props) => (
  <View style={[styles.container, props.style]}>
    <Text style={styles.text}>Maps are only available on mobile devices</Text>
    {props.children}
  </View>
);

const MarkerMock = () => null;
const PolylineMock = () => null;
const CircleMock = () => null;
const OverlayMock = () => null;
const CalloutMock = () => null;

// Export mock components
export default MapViewMock;
export const Marker = MarkerMock;
export const Polyline = PolylineMock;
export const Circle = CircleMock;
export const Overlay = OverlayMock;
export const Callout = CalloutMock;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

// Mock styles
const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  text: {
    color: '#555',
    textAlign: 'center',
  },
}); 