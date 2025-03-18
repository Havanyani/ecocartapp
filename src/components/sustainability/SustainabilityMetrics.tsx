import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  plasticWeight: number;
}

export default function SustainabilityMetrics({ plasticWeight }: Props): JSX.Element {
  // Calculate environmental impact
  const carbonOffset = plasticWeight * 2.5; // kg of CO2
  const treesEquivalent = carbonOffset / 21.7; // One tree absorbs ~21.7kg CO2 per year
  const waterSaved = plasticWeight * 3.8; // liters of water
  const energySaved = plasticWeight * 6.4; // kWh of energy

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="leaf" size={24} color="#2e7d32" />
        Environmental Impact
      </ThemedText>

      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <IconSymbol name="molecule-co2" size={32} color="#2e7d32" />
          <ThemedText style={styles.metricValue}>{carbonOffset.toFixed(1)}kg</ThemedText>
          <ThemedText style={styles.metricLabel}>CO2 Offset</ThemedText>
        </View>

        <View style={styles.metricItem}>
          <IconSymbol name="tree" size={32} color="#2e7d32" />
          <ThemedText style={styles.metricValue}>{treesEquivalent.toFixed(1)}</ThemedText>
          <ThemedText style={styles.metricLabel}>Trees Equivalent</ThemedText>
        </View>

        <View style={styles.metricItem}>
          <IconSymbol name="water" size={32} color="#2196F3" />
          <ThemedText style={styles.metricValue}>{waterSaved.toFixed(0)}L</ThemedText>
          <ThemedText style={styles.metricLabel}>Water Saved</ThemedText>
        </View>

        <View style={styles.metricItem}>
          <IconSymbol name="lightning-bolt" size={32} color="#FFC107" />
          <ThemedText style={styles.metricValue}>{energySaved.toFixed(1)}kWh</ThemedText>
          <ThemedText style={styles.metricLabel}>Energy Saved</ThemedText>
        </View>
      </View>

      <HapticTab 
        style={styles.learnMoreButton}
        onPress={() => {/* Implement learn more */}}
        accessibilityLabel="Learn more about environmental impact"
      >
        <ThemedText style={styles.learnMoreText}>Learn More</ThemedText>
      </HapticTab>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#2e7d32',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  learnMoreButton: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  learnMoreText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
}); 