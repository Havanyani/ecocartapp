import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { CollectionAnalyticsService } from '@/services/CollectionAnalyticsService';
import { EnvironmentalImpactService } from '@/services/EnvironmentalImpactService';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CollectionAnalyticsScreen() {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<any>(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const [analyticsData, impactData] = await Promise.all([
        CollectionAnalyticsService.generateReport(startDate, endDate),
        EnvironmentalImpactService.getMetrics()
      ]);

      setMetrics(analyticsData);
      setEnvironmentalImpact(impactData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading analytics...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.content}>
          {/* Summary Metrics */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol name="analytics" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>Summary</ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText>Total Collections:</ThemedText>
              <ThemedText style={styles.metricValue}>{metrics?.totalCollections || 0}</ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText>Total Weight:</ThemedText>
              <ThemedText style={styles.metricValue}>{metrics?.totalWeight?.toFixed(1) || 0} kg</ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText>Total Credits:</ThemedText>
              <ThemedText style={styles.metricValue}>{metrics?.totalCredits || 0}</ThemedText>
            </View>
          </Card>

          {/* Environmental Impact */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol name="leaf" size={24} color={theme.colors.success} />
              <ThemedText style={styles.cardTitle}>Environmental Impact</ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText>CO₂ Reduced:</ThemedText>
              <ThemedText style={styles.metricValue}>
                {environmentalImpact?.carbonFootprint?.totalReduction?.toFixed(1) || 0} kg
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText>Water Saved:</ThemedText>
              <ThemedText style={styles.metricValue}>
                {environmentalImpact?.waterConservation?.litersSaved?.toFixed(1) || 0} L
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText>Trees Equivalent:</ThemedText>
              <ThemedText style={styles.metricValue}>
                {environmentalImpact?.carbonFootprint?.treesEquivalent || 0}
              </ThemedText>
            </View>
          </Card>

          {/* Material Breakdown */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol name="recycle" size={24} color={theme.colors.info} />
              <ThemedText style={styles.cardTitle}>Material Breakdown</ThemedText>
            </View>
            {metrics?.materialBreakdown?.map((material: any, index: number) => (
              <View key={index} style={styles.metricRow}>
                <ThemedText>{material.name}:</ThemedText>
                <ThemedText style={styles.metricValue}>
                  {material.quantity} {material.unit}
                </ThemedText>
              </View>
            ))}
          </Card>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricValue: {
    fontWeight: '600',
  },
}); 