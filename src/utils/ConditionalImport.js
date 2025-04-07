import React from 'react';
import { Platform, Text, View } from 'react-native';

// Mock components for web platform
const MockMapView = (props) => (
  <View style={{...props.style, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0'}}>
    <Text>Maps are not available on web</Text>
    {props.children}
  </View>
);

const MockChart = (props) => (
  <View style={{...props.style, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0'}}>
    <Text>Charts are not available on web</Text>
    {props.children}
  </View>
);

// Web fallbacks
const mapsFallback = {
  default: MockMapView,
  Marker: () => null,
  Polyline: () => null,
  PROVIDER_GOOGLE: 'google',
};

const victoryFallback = {
  VictoryArea: MockChart,
  VictoryAxis: () => null,
  VictoryBar: MockChart,
  VictoryChart: MockChart,
  VictoryLine: MockChart,
  VictoryPie: MockChart,
  VictoryTheme: { material: {} },
  VictoryTooltip: () => null,
  VictoryVoronoiContainer: () => null,
};

// Helper for conditional imports
export const ConditionalImport = {
  // Maps components
  reactNativeMaps: Platform.OS === 'web' 
    ? mapsFallback 
    : ((() => {
        try {
          // Use direct require for specific modules
          const maps = require('react-native-maps');
          return maps;
        } catch (e) {
          console.error('Error loading react-native-maps:', e);
          return mapsFallback;
        }
      })()),
      
  // Victory components
  victoryNative: Platform.OS === 'web'
    ? victoryFallback
    : ((() => {
        try {
          // Use direct require for specific modules
          const victory = require('victory-native');
          return victory;
        } catch (e) {
          console.error('Error loading victory-native:', e);
          return victoryFallback;
        }
      })()),
      
  // Skia components
  reactNativeSkia: Platform.OS === 'web'
    ? {}
    : ((() => {
        try {
          return require('@shopify/react-native-skia');
        } catch (e) {
          console.error('Error loading @shopify/react-native-skia:', e);
          return {};
        }
      })()),
}; 