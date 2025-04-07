import { EnvironmentalImpactDashboard } from '@/components/analytics/EnvironmentalImpactDashboard';
import { ThemedText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { DetailedEnvironmentalMetrics } from '@/services/EnvironmentalImpactService';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function EnvironmentalImpactScreen() {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<DetailedEnvironmentalMetrics>(emptyDetailedMetrics);
  const [historicalData, setHistoricalData] = useState(emptyHistoricalData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual metrics and historical data from the API
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setMetrics({
          ...emptyDetailedMetrics,
          plasticReduction: {
            totalWeight: 125.5,
            itemsRecycled: 250,
            landfillDiverted: 150,
          },
          carbonFootprint: {
            totalReduction: 75.3,
            treesEquivalent: 12,
            emissionsAvoided: 100,
          },
          waterConservation: {
            litersSaved: 5000,
            householdsImpacted: 25,
            waterQualityImprovement: 85,
          },
          communityImpact: {
            participationRate: 75,
            totalHouseholds: 100,
            communityPrograms: 3,
          },
        });

        setHistoricalData(emptyHistoricalData.map(data => ({
          ...data,
          plasticWeight: Math.random() * 50,
          carbonReduction: Math.random() * 30,
          waterSaved: Math.random() * 1000,
        })));
      } catch (error) {
        console.error('Error fetching environmental impact data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>Environmental Impact</ThemedText>
          
          {isLoading ? (
            <ThemedText>Loading...</ThemedText>
          ) : (
            <EnvironmentalImpactDashboard
              metrics={metrics}
              historicalData={historicalData}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 