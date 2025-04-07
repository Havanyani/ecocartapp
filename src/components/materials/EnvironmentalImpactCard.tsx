/**
 * EnvironmentalImpactCard.tsx
 * 
 * A component that displays environmental impact statistics for recycling materials.
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';

interface EnvironmentalImpactCardProps {
  co2SavedPerKg: number;
  waterSavedPerKg: number;
  energySavedPerKg: number;
  biodegradableTimeYears: number;
}

export function EnvironmentalImpactCard({
  co2SavedPerKg,
  waterSavedPerKg,
  energySavedPerKg,
  biodegradableTimeYears,
}: EnvironmentalImpactCardProps) {
  const theme = useTheme();

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format biodegradable time to be more readable
  const formatBiodegradableTime = (years: number): string => {
    if (years >= 1000000) {
      return "Never fully biodegrades";
    } else if (years >= 1000) {
      return `${Math.round(years / 1000)} thousand years`;
    } else {
      return `${years} years`;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Environmental Impact</ThemedText>
      
      <View style={styles.statsContainer}>
        {/* CO2 Saved */}
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.theme.colors.primary}20` }]}>
            <MaterialCommunityIcons name="molecule-co2" size={24} color={theme.theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>{co2SavedPerKg} kg</ThemedText>
            <ThemedText style={styles.statLabel}>CO₂ saved per kg recycled</ThemedText>
          </View>
        </View>
        
        {/* Water Saved */}
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.theme.colors.primary}20` }]}>
            <Ionicons name="water" size={24} color={theme.theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>{formatNumber(waterSavedPerKg)} L</ThemedText>
            <ThemedText style={styles.statLabel}>Water saved per kg recycled</ThemedText>
          </View>
        </View>
        
        {/* Energy Saved */}
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.theme.colors.primary}20` }]}>
            <Ionicons name="flash" size={24} color={theme.theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>{energySavedPerKg} kWh</ThemedText>
            <ThemedText style={styles.statLabel}>Energy saved per kg recycled</ThemedText>
          </View>
        </View>
        
        {/* Biodegradable Time */}
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.theme.colors.primary}20` }]}>
            <Ionicons name="hourglass" size={24} color={theme.theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>{formatBiodegradableTime(biodegradableTimeYears)}</ThemedText>
            <ThemedText style={styles.statLabel}>Time to biodegrade naturally</ThemedText>
          </View>
        </View>
      </View>
      
      <ThemedText style={styles.disclaimer}>
        *Environmental impact values are estimates based on industry averages and may vary based on local conditions and recycling methods.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.6,
  }
}); 