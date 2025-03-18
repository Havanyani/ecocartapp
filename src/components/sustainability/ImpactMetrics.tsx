import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

interface ImpactMetricsProps {
  metrics: {
    plasticCollected: number;
    co2Reduced: number;
    treesEquivalent: number;
    communityRank: number;
    totalParticipants: number;
  };
}

export function ImpactMetrics({ metrics }: ImpactMetricsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <IconSymbol name="recycle" size={24} color="#2e7d32" />
          <ThemedText style={styles.metricValue}>{metrics.plasticCollected.toFixed(1)} kg</ThemedText>
          <ThemedText style={styles.metricLabel}>Plastic Collected</ThemedText>
        </View>
        <View style={styles.metricCard}>
          <IconSymbol name="molecule-co2" size={24} color="#2e7d32" />
          <ThemedText style={styles.metricValue}>{metrics.co2Reduced.toFixed(2)} kg</ThemedText>
          <ThemedText style={styles.metricLabel}>CO₂ Reduced</ThemedText>
        </View>
        <View style={styles.metricCard}>
          <IconSymbol name="tree" size={24} color="#2e7d32" />
          <ThemedText style={styles.metricValue}>{metrics.treesEquivalent}</ThemedText>
          <ThemedText style={styles.metricLabel}>Trees Equivalent</ThemedText>
        </View>
      </View>
      <View style={styles.rankingSection}>
        <ThemedText style={styles.rankingText}>Top {metrics.communityRank}%</ThemedText>
        <ThemedText style={styles.participantsText}>of {metrics.totalParticipants} participants</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  rankingSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  rankingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 