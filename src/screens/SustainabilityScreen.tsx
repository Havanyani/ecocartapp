import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '@/hooks/useStore';

export const SustainabilityScreen = observer(() => {
  const { sustainabilityStore, collectionStore } = useStore();

  useEffect(() => {
    const loadData = async () => {
      await collectionStore.loadCollections();
      await sustainabilityStore.calculateMetrics();
    };
    loadData();
  }, []);

  const formatMetric = (value: number, unit: string) => {
    return `${value.toFixed(1)} ${unit}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Environmental Impact</Text>
        </View>
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {formatMetric(sustainabilityStore.metrics.totalPlasticCollected, 'kg')}
            </Text>
            <Text style={styles.metricLabel}>Total Plastic Collected</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {formatMetric(sustainabilityStore.metrics.carbonFootprintReduced, 'kg')}
            </Text>
            <Text style={styles.metricLabel}>CO₂ Emissions Reduced</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              ${sustainabilityStore.metrics.totalCreditsIssued.toFixed(2)}
            </Text>
            <Text style={styles.metricLabel}>Total Community Credits Earned</Text>
          </View>
        </View>
        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Your Contribution</Text>
          <View style={styles.contributionCard}>
            <Text style={styles.contributionText}>
              Your recycling efforts have helped prevent
              {' '}{formatMetric(sustainabilityStore.metrics.totalPlasticCollected, 'kg')}{' '}
              of plastic from entering our oceans.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  communitySection: {
    padding: 16,
  },
  contributionCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  contributionText: {
    fontSize: 16,
    color: '#2E7D32',
    lineHeight: 24,
  },
}); 