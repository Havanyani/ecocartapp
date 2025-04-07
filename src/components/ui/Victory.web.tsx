import React from 'react';
import { StyleSheet } from 'react-native';
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

// Web-specific chart components
export const VictoryArea = (props: any) => <ChartFallback title="Area Chart" {...props} />;
export const VictoryAxis = (props: any) => null;
export const VictoryBar = (props: any) => <ChartFallback title="Bar Chart" {...props} />;
export const VictoryChart = (props: any) => <ChartFallback title="Chart" {...props} />;
export const VictoryLine = (props: any) => <ChartFallback title="Line Chart" {...props} />;
export const VictoryPie = (props: any) => <ChartFallback title="Pie Chart" {...props} />;
export const VictoryTheme = { material: {} };
export const VictoryTooltip = (props: any) => null;
export const VictoryVoronoiContainer = (props: any) => null;

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