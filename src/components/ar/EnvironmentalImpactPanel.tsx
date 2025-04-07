import { useTheme } from '@/hooks/useTheme';
import { calculateEnvironmentalImpact } from '@/utils/ar-helpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EnvironmentalImpactPanelProps {
  containerId: string;
  quantity?: number;
}

/**
 * Displays environmental impact metrics for a recycled container
 */
export default function EnvironmentalImpactPanel({ 
  containerId, 
  quantity = 1 
}: EnvironmentalImpactPanelProps) {
  const { theme } = useTheme();
  
  // Calculate impact metrics
  const impact = calculateEnvironmentalImpact(containerId, quantity);
  
  // Format numbers to be more readable
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };
  
  // If no impact (non-recyclable), show alternate message
  if (impact.carbonSaved === 0 && impact.waterSaved === 0 && impact.energySaved === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Environmental Impact
        </Text>
        <View style={styles.noImpactContainer}>
          <MaterialCommunityIcons 
            name="information" 
            size={24} 
            color={theme.colors.warning} 
          />
          <Text style={[styles.noImpactText, { color: theme.colors.textSecondary }]}>
            This item is not recyclable in most areas. Consider alternatives or check special recycling programs.
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Environmental Impact
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        By recycling {quantity} item{quantity > 1 ? 's' : ''}, you save:
      </Text>
      
      <View style={styles.metricsContainer}>
        {/* Carbon savings */}
        <View style={styles.metricItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.success }]}>
            <MaterialCommunityIcons name="molecule-co2" size={24} color="white" />
          </View>
          <View style={styles.metricTextContainer}>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {formatNumber(impact.carbonSaved)} kg
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              CO₂ Emissions
            </Text>
          </View>
        </View>
        
        {/* Water savings */}
        <View style={styles.metricItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.info }]}>
            <MaterialCommunityIcons name="water" size={24} color="white" />
          </View>
          <View style={styles.metricTextContainer}>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {formatNumber(impact.waterSaved)} L
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Water Usage
            </Text>
          </View>
        </View>
        
        {/* Energy savings */}
        <View style={styles.metricItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color="white" />
          </View>
          <View style={styles.metricTextContainer}>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {formatNumber(impact.energySaved)} kWh
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Energy Saved
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.equivalentText, { color: theme.colors.textSecondary }]}>
        That's equivalent to {formatNumber(impact.carbonSaved * 4)} km not driven in a car!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 14,
  },
  equivalentText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  noImpactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    marginTop: 8,
  },
  noImpactText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
}); 