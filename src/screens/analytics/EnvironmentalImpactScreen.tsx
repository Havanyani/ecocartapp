/**
 * EnvironmentalImpactScreen.tsx
 * 
 * A comprehensive dashboard for visualizing the environmental impact
 * of recycling activities, with historical tracking and community comparisons.
 */

import { CommunityComparisonChart } from '@/components/analytics/CommunityComparisonChart';
import { EnvironmentalImpactDashboard } from '@/components/analytics/EnvironmentalImpactDashboard';
import { EnvironmentalImpactMetrics } from '@/components/analytics/EnvironmentalImpactMetrics';
import HeaderButtons from '@/components/ui/HeaderButtons';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { DetailedEnvironmentalMetrics, EnvironmentalImpactService } from '@/services/EnvironmentalImpactService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

// Create default empty metrics
const emptyDetailedMetrics: DetailedEnvironmentalMetrics = {
  plasticReduction: {
    totalWeight: 0,
    itemsRecycled: 0,
    landfillDiverted: 0,
  },
  carbonFootprint: {
    totalReduction: 0,
    treesEquivalent: 0,
    emissionsAvoided: 0,
  },
  waterConservation: {
    litersSaved: 0,
    householdsImpacted: 0,
    waterQualityImprovement: 0,
  },
  communityImpact: {
    participationRate: 0,
    totalHouseholds: 0,
    communityPrograms: 0,
  },
};

const emptyHistoricalData = Array(6).fill(0).map((_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - i);
  return {
    date: date.toISOString(),
    plasticWeight: 0,
    carbonReduction: 0,
    waterSaved: 0,
  };
}).reverse();

const emptyCommunityData = {
  user: {
    plasticCollected: 0,
    co2Reduced: 0,
    waterSaved: 0,
  },
  localAverage: {
    plasticCollected: 0,
    co2Reduced: 0,
    waterSaved: 0,
  },
  nationalAverage: {
    plasticCollected: 0,
    co2Reduced: 0,
    waterSaved: 0,
  },
  topPerformers: {
    plasticCollected: 0,
    co2Reduced: 0,
    waterSaved: 0,
  },
};

// Convert detailed metrics to the format expected by EnvironmentalImpactMetrics
const convertToMetricsFormat = (
  detailedMetrics: DetailedEnvironmentalMetrics,
  historicalData: Array<{
    date: string;
    plasticWeight: number;
    carbonReduction: number;
    waterSaved: number;
  }>
) => {
  return {
    totalPlasticCollected: detailedMetrics.plasticReduction.totalWeight,
    plasticTypes: [
      {
        type: 'PET',
        weight: detailedMetrics.plasticReduction.totalWeight * 0.4,
        co2Saved: detailedMetrics.carbonFootprint.totalReduction * 0.4,
        waterSaved: detailedMetrics.waterConservation.litersSaved * 0.4,
        energySaved: 0,
      },
      {
        type: 'HDPE',
        weight: detailedMetrics.plasticReduction.totalWeight * 0.3,
        co2Saved: detailedMetrics.carbonFootprint.totalReduction * 0.3,
        waterSaved: detailedMetrics.waterConservation.litersSaved * 0.3,
        energySaved: 0,
      },
      {
        type: 'Other',
        weight: detailedMetrics.plasticReduction.totalWeight * 0.3,
        co2Saved: detailedMetrics.carbonFootprint.totalReduction * 0.3,
        waterSaved: detailedMetrics.waterConservation.litersSaved * 0.3,
        energySaved: 0,
      },
    ],
    co2Reduction: detailedMetrics.carbonFootprint.totalReduction,
    waterSaved: detailedMetrics.waterConservation.litersSaved,
    energySaved: detailedMetrics.plasticReduction.totalWeight * 5.774, // Approx energy saved per kg
    treesEquivalent: detailedMetrics.carbonFootprint.treesEquivalent,
    communityMetrics: {
      totalUsers: detailedMetrics.communityImpact.totalHouseholds,
      activeUsers: Math.round(detailedMetrics.communityImpact.totalHouseholds * detailedMetrics.communityImpact.participationRate / 100),
      totalCollections: detailedMetrics.plasticReduction.itemsRecycled,
      averagePerUser: detailedMetrics.plasticReduction.totalWeight / detailedMetrics.communityImpact.totalHouseholds,
    },
    monthlyTrends: {
      dates: historicalData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short' })),
      plasticWeights: historicalData.map(d => d.plasticWeight),
      co2Savings: historicalData.map(d => d.carbonReduction),
    },
  };
};

type EnvironmentalImpactScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'EnvironmentalImpact'
>;

export function EnvironmentalImpactScreen(): JSX.Element {
  const navigation = useNavigation<EnvironmentalImpactScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [detailedMetrics, setDetailedMetrics] = useState<DetailedEnvironmentalMetrics>(emptyDetailedMetrics);
  const [historicalData, setHistoricalData] = useState(emptyHistoricalData);
  const [communityData, setCommunityData] = useState(emptyCommunityData);

  const fetchData = useCallback(async () => {
    try {
      // Fetch detailed environmental metrics
      const metrics = await EnvironmentalImpactService.getMetrics();
      setDetailedMetrics(metrics);

      // Fetch historical data
      const history = await EnvironmentalImpactService.getHistoricalData();
      setHistoricalData(history);

      // Fetch user impact data for selected timeframe
      const userData = await EnvironmentalImpactService.getUserImpactData(timeframe);
      setCommunityData(userData);

    } catch (error) {
      console.error('Error fetching environmental impact data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Set up the header with a share button
    navigation.setOptions({
      headerRight: () => (
        <HeaderButtons>
          <HeaderButtons.Button
            iconName="share-variant"
            onPress={shareData}
            testID="share-button"
          />
        </HeaderButtons>
      ),
    });
  }, [navigation, detailedMetrics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    const timeframeMap: Record<string, 'week' | 'month' | 'year'> = {
      Week: 'week',
      Month: 'month',
      Year: 'year',
    };
    setTimeframe(timeframeMap[newTimeframe] || 'month');
  }, []);

  const shareData = () => {
    // In a real app, implement sharing functionality here
    console.log('Sharing environmental impact data');
  };

  const metricsData = convertToMetricsFormat(detailedMetrics, historicalData);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <ThemedText style={styles.loadingText}>Loading impact data...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Your Environmental Impact</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          See the positive difference you're making for the planet
        </ThemedText>
        
        <EnvironmentalImpactMetrics
          metrics={metricsData}
          onTimeframeChange={handleTimeframeChange}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Historical Impact</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Your recycling contribution over time
        </ThemedText>
        
        <EnvironmentalImpactDashboard
          metrics={detailedMetrics}
          historicalData={historicalData}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Community Comparison</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          See how your impact compares to others in your community
        </ThemedText>
        
        <CommunityComparisonChart data={communityData} />
      </ThemedView>

      <ThemedView style={styles.tipsSection}>
        <ThemedText style={styles.tipsTitle}>Tips to Increase Your Impact</ThemedText>
        <View style={styles.tip}>
          <ThemedText style={styles.tipNumber}>1</ThemedText>
          <View style={styles.tipContent}>
            <ThemedText style={styles.tipTitle}>Consistent Recycling</ThemedText>
            <ThemedText style={styles.tipText}>
              Make recycling a daily habit to maximize your environmental impact.
            </ThemedText>
          </View>
        </View>
        <View style={styles.tip}>
          <ThemedText style={styles.tipNumber}>2</ThemedText>
          <View style={styles.tipContent}>
            <ThemedText style={styles.tipTitle}>Clean Materials</ThemedText>
            <ThemedText style={styles.tipText}>
              Rinse containers before recycling to improve recycling efficiency.
            </ThemedText>
          </View>
        </View>
        <View style={styles.tip}>
          <ThemedText style={styles.tipNumber}>3</ThemedText>
          <View style={styles.tipContent}>
            <ThemedText style={styles.tipTitle}>Collect in Bulk</ThemedText>
            <ThemedText style={styles.tipText}>
              Collect multiple items before scheduling a pickup to reduce carbon emissions.
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  tipsSection: {
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2e7d32',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
    fontWeight: 'bold',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
}); 