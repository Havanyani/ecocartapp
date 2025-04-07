import { IconSymbol, ThemedText, ThemedView } from '@/components/ui';
import { HapticTab } from '@/components/ui/HapticTab';
import { useTheme } from '@/theme';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryPie,
  VictoryTooltip
} from 'victory-native';

interface VisualizationData {
  timePatterns: {
    hourly: Record<number, number>;
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
  plasticTypes: Array<{
    type: string;
    weight: number;
    percentage: number;
    trend: number;
  }>;
  environmentalImpact: {
    current: {
      plasticSaved: number;
      co2Reduced: number;
      oceanImpact: number;
    };
    projected: {
      endOfMonth: number;
      endOfYear: number;
    };
    goals: {
      monthly: number;
      yearly: number;
      progress: number;
    };
  };
}

interface AdvancedVisualizationProps {
  data: VisualizationData;
  onTimeframeChange: (timeframe: string) => void;
  testID?: string;
}

const chartColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB'
];

export function AdvancedVisualization({
  data,
  onTimeframeChange,
  testID
}: AdvancedVisualizationProps): JSX.Element {
  const theme = useTheme()()();
  const [selectedView, setSelectedView] = useState<'time' | 'type' | 'impact'>('time');
  const screenWidth = Dimensions.get('window').width;

  const chartTheme = {
    axis: {
      style: {
        axis: {
          stroke: theme.colors.text
        },
        tickLabels: {
          fill: theme.colors.text
        }
      }
    }
  };

  return (
    <ThemedView style={styles.container} testID={testID}>
      <View style={styles.tabSelector}>
        <HapticTab
          onPress={() => setSelectedView('time')}
          style={[styles.tab, selectedView === 'time' && styles.selectedTab]}
        >
          <IconSymbol name="clock" size={24} />
          <ThemedText>Time Analysis</ThemedText>
        </HapticTab>
        <HapticTab
          onPress={() => setSelectedView('type')}
          style={[styles.tab, selectedView === 'type' && styles.selectedTab]}
        >
          <IconSymbol name="shape" size={24} />
          <ThemedText>Plastic Types</ThemedText>
        </HapticTab>
        <HapticTab
          onPress={() => setSelectedView('impact')}
          style={[styles.tab, selectedView === 'impact' && styles.selectedTab]}
        >
          <IconSymbol name="earth" size={24} />
          <ThemedText>Environmental Impact</ThemedText>
        </HapticTab>
      </View>

      <ScrollView style={styles.chartContainer}>
        {selectedView === 'time' && (
          <>
            <ThemedText style={styles.chartTitle}>Collection Patterns</ThemedText>
            <VictoryChart
              theme={chartTheme}
              width={screenWidth - 40}
              height={300}
            >
              <VictoryAxis
                tickFormat={(t) => `${t}:00`}
                label="Hour of Day"
                axisLabelComponent={<VictoryTooltip />}
              />
              <VictoryAxis
                dependentAxis
                label="Weight (kg)"
                axisLabelComponent={<VictoryTooltip />}
              />
              <VictoryLine
                data={Object.entries(data.timePatterns.hourly).map(([hour, weight]) => ({
                  x: parseInt(hour),
                  y: weight
                }))}
                style={{
                  data: { stroke: theme.colors.primary }
                }}
              />
            </VictoryChart>
          </>
        )}

        {selectedView === 'type' && (
          <>
            <ThemedText style={styles.chartTitle}>Plastic Type Distribution</ThemedText>
            <VictoryPie
              data={data.plasticTypes.map(type => ({
                x: type.type,
                y: type.percentage,
                label: `${type.type}\n${type.percentage.toFixed(1)}%`
              }))}
              width={screenWidth - 40}
              height={300}
              colorScale={chartColors}
              labels={({ datum }) => `${datum.x}\n${datum.y.toFixed(1)}%`}
            />
          </>
        )}

        {selectedView === 'impact' && (
          <>
            <ThemedText style={styles.chartTitle}>Environmental Impact</ThemedText>
            <VictoryChart
              theme={chartTheme}
              width={screenWidth - 40}
              height={300}
            >
              <VictoryBar
                data={[
                  { x: 'Plastic', y: data.environmentalImpact.current.plasticSaved },
                  { x: 'CO₂', y: data.environmentalImpact.current.co2Reduced },
                  { x: 'Ocean', y: data.environmentalImpact.current.oceanImpact }
                ]}
                style={{
                  data: { fill: theme.colors.success }
                }}
              />
            </VictoryChart>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  selectedTab: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  }
}); 