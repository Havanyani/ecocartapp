import { ConditionalImport } from '@/utils/ConditionalImport';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Fallback component for web
const ChartFallback = ({ title = 'Chart', style, width, height, ...props }: any) => {
  return (
    <ThemedView 
      style={[
        styles.container, 
        style, 
        { width: width || 300, height: height || 200 }
      ]}
    >
      <ThemedText style={styles.text}>
        {title}
      </ThemedText>
      <ThemedText style={styles.subText}>
        Charts are optimized for mobile devices.
      </ThemedText>
    </ThemedView>
  );
};

// Get Victory components using the ConditionalImport utility
const victoryNative = ConditionalImport.victoryNative;

// Victory components adapted for web
export const VictoryArea = (props: any) => {
  if (Platform.OS === 'web') {
    return <ChartFallback title="Area Chart" {...props} />;
  }
  return <victoryNative.VictoryArea {...props} />;
};

export const VictoryAxis = (props: any) => {
  if (Platform.OS === 'web') {
    return null;
  }
  return <victoryNative.VictoryAxis {...props} />;
};

export const VictoryBar = (props: any) => {
  if (Platform.OS === 'web') {
    return <ChartFallback title="Bar Chart" {...props} />;
  }
  return <victoryNative.VictoryBar {...props} />;
};

export const VictoryChart = (props: any) => {
  if (Platform.OS === 'web') {
    return <ChartFallback title="Chart" {...props} />;
  }
  return <victoryNative.VictoryChart {...props} />;
};

export const VictoryLine = (props: any) => {
  if (Platform.OS === 'web') {
    return <ChartFallback title="Line Chart" {...props} />;
  }
  return <victoryNative.VictoryLine {...props} />;
};

export const VictoryPie = (props: any) => {
  if (Platform.OS === 'web') {
    return <ChartFallback title="Pie Chart" {...props} />;
  }
  return <victoryNative.VictoryPie {...props} />;
};

// For simpler components like themes and containers, provide basic fallbacks
export const VictoryTheme = Platform.OS === 'web'
  ? { material: {} }
  : victoryNative.VictoryTheme;

export const VictoryTooltip = (props: any) => {
  if (Platform.OS === 'web') {
    return null;
  }
  return <victoryNative.VictoryTooltip {...props} />;
};

export const VictoryVoronoiContainer = (props: any) => {
  if (Platform.OS === 'web') {
    return null;
  }
  return <victoryNative.VictoryVoronoiContainer {...props} />;
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