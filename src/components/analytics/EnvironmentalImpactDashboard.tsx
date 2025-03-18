import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryPie } from 'victory-native';
import { useTheme } from '@/hooks/useTheme';
import { DetailedEnvironmentalMetrics } from '@/services/EnvironmentalImpactService';
import { IconSymbol, ThemedText, ThemedView } from '@/components/ui';
import { HapticTab } from '@/components/ui/HapticTab';

interface ImpactDashboardProps {
  metrics: DetailedEnvironmentalMetrics;
  historicalData: Array<{
    date: string;
    plasticWeight: number;
    carbonReduction: number;
    waterSaved: number;
  }>;
  testID?: string;
}

export function EnvironmentalImpactDashboard({
  metrics,
  historicalData,
  testID
}: ImpactDashboardProps): JSX.Element {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'trends'>('overview');
  const screenWidth = Dimensions.get('window').width;

  const ImpactCard = ({ title, value, unit, icon, description }: {
    title: string;
    value: number;
    unit: string;
    icon: string;
    description: string;
  }) => (
    <ThemedView style={styles.card}>
      <IconSymbol name={icon} size={24} color={theme.colors.primary} />
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <ThemedText style={styles.cardValue}>
        {value.toFixed(1)} {unit}
      </ThemedText>
      <ThemedText style={styles.cardDescription}>{description}</ThemedText>
    </ThemedView>
  );

  const renderOverview = () => (
    <ScrollView style={styles.contentContainer}>
      <View style={styles.cardsContainer}>
        <ImpactCard
          title="Plastic Saved"
          value={metrics.plasticReduction.totalWeight}
          unit="kg"
          icon="recycle"
          description="Total plastic waste diverted from landfills"
        />
        <ImpactCard
          title="CO₂ Reduction"
          value={metrics.carbonFootprint.totalReduction}
          unit="kg"
          icon="molecule-co2"
          description={`Equivalent to ${Math.round(metrics.carbonFootprint.treesEquivalent)} trees`}
        />
        <ImpactCard
          title="Water Saved"
          value={metrics.waterConservation.litersSaved / 1000}
          unit="m³"
          icon="water"
          description="Water conserved through recycling"
        />
        <ImpactCard
          title="Community Impact"
          value={metrics.communityImpact.participationRate}
          unit="%"
          icon="account-group"
          description={`${metrics.communityImpact.totalHouseholds} households participating`}
        />
      </View>
    </ScrollView>
  );

  const renderDetailed = () => (
    <ScrollView style={styles.contentContainer}>
      <View style={styles.chartContainer}>
        <VictoryChart width={screenWidth - 48} height={300}>
          <VictoryAxis
            tickFormat={(t: string) => new Date(t).toLocaleDateString()}
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text }
            }}
          />
          <VictoryLine
            data={historicalData}
            x="date"
            y="plasticWeight"
            style={{
              data: { stroke: theme.colors.primary }
            }}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );

  const renderTrends = () => (
    <ScrollView style={styles.contentContainer}>
      <View style={styles.chartContainer}>
        <VictoryPie
          data={[
            { x: "Plastic", y: metrics.plasticReduction.totalWeight },
            { x: "CO₂", y: metrics.carbonFootprint.totalReduction },
            { x: "Water", y: metrics.waterConservation.litersSaved / 1000 }
          ]}
          colorScale={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
          width={screenWidth - 48}
          height={300}
        />
      </View>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container} testID={testID}>
      <View style={styles.tabsContainer}>
        <HapticTab
          onPress={() => setActiveTab('overview')}
          style={[
            styles.tab,
            activeTab === 'overview' && styles.activeTab
          ]}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText
          ]}>
            Overview
          </ThemedText>
        </HapticTab>
        <HapticTab
          onPress={() => setActiveTab('detailed')}
          style={[
            styles.tab,
            activeTab === 'detailed' && styles.activeTab
          ]}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'detailed' && styles.activeTabText
          ]}>
            Detailed
          </ThemedText>
        </HapticTab>
        <HapticTab
          onPress={() => setActiveTab('trends')}
          style={[
            styles.tab,
            activeTab === 'trends' && styles.activeTab
          ]}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'trends' && styles.activeTabText
          ]}>
            Trends
          </ThemedText>
        </HapticTab>
      </View>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'detailed' && renderDetailed()}
      {activeTab === 'trends' && renderTrends()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E0E0E0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  chartContainer: {
    padding: 16,
    alignItems: 'center',
  },
}); 