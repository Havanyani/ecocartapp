import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ContributionGraph, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useTheme } from '@/theme';
import { IconSymbol, ThemedText, ThemedView } from '@/components/ui';
import { HapticTab } from '@/components/ui/HapticTab';

interface CollectionData {
  date: string;
  weight: number;
  plasticType: string;
  credits: number;
}

interface CommunityStats {
  totalUsers: number;
  totalCollections: number;
  averagePerUser: number;
  topCollectors: Array<{
    userId: string;
    totalWeight: number;
    credits: number;
  }>;
}

interface AdvancedImpactVisualsProps {
  collectionData: CollectionData[];
  communityStats: CommunityStats;
  onTimeframeChange: (timeframe: string) => void;
  testID?: string;
}

export function AdvancedImpactVisuals({
  collectionData,
  communityStats,
  onTimeframeChange,
  testID
}: AdvancedImpactVisualsProps): JSX.Element {
  const theme = useTheme()()();
  const [selectedView, setSelectedView] = useState<'personal' | 'community'>('personal');
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.text,
    strokeWidth: 2,
    barPercentage: 0.5
  };

  // Calculate plastic type distribution
  const plasticDistribution = collectionData.reduce((acc, curr) => {
    acc[curr.plasticType] = (acc[curr.plasticType] || 0) + curr.weight;
    return acc;
  }, {} as Record<string, number>);

  // Format data for contribution graph
  const contributionData = collectionData.map(data => ({
    date: data.date,
    count: Math.round(data.weight * 10) // Scale weight for better visualization
  }));

  // Calculate progress metrics
  const progressData = {
    labels: ['Weekly Goal', 'Monthly Goal', 'Annual Goal'],
    data: [0.7, 0.6, 0.45] // Example progress values
  };

  return (
    <ThemedView style={styles.container} testID={testID}>
      <View style={styles.tabSelector}>
        <HapticTab
          onPress={() => setSelectedView('personal')}
          style={[
            styles.tab,
            selectedView === 'personal' && styles.selectedTab
          ]}
        >
          <IconSymbol name="account" size={24} />
          <ThemedText>Personal Impact</ThemedText>
        </HapticTab>
        <HapticTab
          onPress={() => setSelectedView('community')}
          style={[
            styles.tab,
            selectedView === 'community' && styles.selectedTab
          ]}
        >
          <IconSymbol name="account-group" size={24} />
          <ThemedText>Community Impact</ThemedText>
        </HapticTab>
      </View>

      {selectedView === 'personal' ? (
        <>
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Plastic Type Distribution</ThemedText>
            <PieChart
              data={Object.entries(plasticDistribution).map(([name, weight], index) => ({
                name,
                weight,
                color: theme.colors.chartColors[index % theme.colors.chartColors.length],
                legendFontColor: theme.colors.text
              }))}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="weight"
              backgroundColor="transparent"
              paddingLeft="15"
              testID="plastic-distribution-chart"
            />
          </View>

          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Collection Goals Progress</ThemedText>
            <ProgressChart
              data={progressData}
              width={screenWidth - 40}
              height={220}
              strokeWidth={16}
              radius={32}
              chartConfig={chartConfig}
              hideLegend={false}
              testID="goals-progress-chart"
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Community Collection Heatmap</ThemedText>
            <ContributionGraph
              values={contributionData}
              endDate={new Date()}
              numDays={105}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              testID="community-heatmap"
            />
          </View>

          <View style={styles.statsContainer}>
            <ThemedText style={styles.statsTitle}>Community Statistics</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {communityStats.totalUsers}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Active Users</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {communityStats.totalCollections}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Collections</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {communityStats.averagePerUser.toFixed(1)}kg
                </ThemedText>
                <ThemedText style={styles.statLabel}>Avg. per User</ThemedText>
              </View>
            </View>
          </View>
        </>
      )}
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
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsContainer: {
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
}); 