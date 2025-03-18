import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface PlasticTypeMetrics {
  type: string;
  weight: number;
  co2Saved: number;
  waterSaved: number;
  energySaved: number;
}

interface CommunityMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCollections: number;
  averagePerUser: number;
}

interface EnvironmentalMetrics {
  totalPlasticCollected: number;
  plasticTypes: PlasticTypeMetrics[];
  co2Reduction: number;
  waterSaved: number;
  energySaved: number;
  treesEquivalent: number;
  communityMetrics: CommunityMetrics;
  monthlyTrends: {
    dates: string[];
    plasticWeights: number[];
    co2Savings: number[];
  };
}

interface Props {
  metrics: EnvironmentalMetrics;
  onTimeframeChange?: (timeframe: string) => void;
}

export const EnvironmentalImpactMetrics: React.FC<Props> = ({
  metrics,
  onTimeframeChange
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Month');
  const [selectedMetric, setSelectedMetric] = useState<'plastic' | 'co2'>('plastic');

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(1);
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Environmental Impact</ThemedText>
          <View style={styles.timeframeButtons}>
            {['Week', 'Month', 'Year'].map(timeframe => (
              <HapticTab
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && styles.selectedTimeframe
                ]}
                onPress={() => handleTimeframeChange(timeframe)}
              >
                <ThemedText
                  style={[
                    styles.timeframeText,
                    selectedTimeframe === timeframe && styles.selectedTimeframeText
                  ]}
                >
                  {timeframe}
                </ThemedText>
              </HapticTab>
            ))}
          </View>
        </View>

        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <IconSymbol name="recycle" size={32} color="#2e7d32" />
            <ThemedText style={styles.impactValue}>
              {formatNumber(metrics.totalPlasticCollected)}kg
            </ThemedText>
            <ThemedText style={styles.impactLabel}>Plastic Collected</ThemedText>
          </View>
          <View style={styles.impactCard}>
            <IconSymbol name="molecule-co2" size={32} color="#2e7d32" />
            <ThemedText style={styles.impactValue}>
              {formatNumber(metrics.co2Reduction)}kg
            </ThemedText>
            <ThemedText style={styles.impactLabel}>CO₂ Reduced</ThemedText>
          </View>
          <View style={styles.impactCard}>
            <IconSymbol name="water" size={32} color="#2e7d32" />
            <ThemedText style={styles.impactValue}>
              {formatNumber(metrics.waterSaved)}L
            </ThemedText>
            <ThemedText style={styles.impactLabel}>Water Saved</ThemedText>
          </View>
          <View style={styles.impactCard}>
            <IconSymbol name="lightning-bolt" size={32} color="#2e7d32" />
            <ThemedText style={styles.impactValue}>
              {formatNumber(metrics.energySaved)}kWh
            </ThemedText>
            <ThemedText style={styles.impactLabel}>Energy Saved</ThemedText>
          </View>
        </View>

        <View style={styles.treeEquivalent}>
          <IconSymbol name="tree" size={48} color="#2e7d32" />
          <ThemedText style={styles.treeText}>
            Your impact equals planting {metrics.treesEquivalent} trees!
          </ThemedText>
        </View>

        <View style={styles.communitySection}>
          <ThemedText style={styles.sectionTitle}>Community Impact</ThemedText>
          <View style={styles.communityStats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {metrics.communityMetrics.totalUsers}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Users</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {metrics.communityMetrics.averagePerUser}kg
              </ThemedText>
              <ThemedText style={styles.statLabel}>Avg per User</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.trendsSection}>
          <ThemedText style={styles.sectionTitle}>Impact Trends</ThemedText>
          <View style={styles.metricToggle}>
            <HapticTab
              style={[
                styles.toggleButton,
                selectedMetric === 'plastic' && styles.selectedToggle
              ]}
              onPress={() => setSelectedMetric('plastic')}
            >
              <ThemedText>Plastic</ThemedText>
            </HapticTab>
            <HapticTab
              style={[
                styles.toggleButton,
                selectedMetric === 'co2' && styles.selectedToggle
              ]}
              onPress={() => setSelectedMetric('co2')}
            >
              <ThemedText>CO₂</ThemedText>
            </HapticTab>
          </View>
          <LineChart
            data={{
              labels: metrics.monthlyTrends.dates,
              datasets: [{
                data: selectedMetric === 'plastic' 
                  ? metrics.monthlyTrends.plasticWeights
                  : metrics.monthlyTrends.co2Savings
              }]
            }}
            width={350}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
              labelColor: () => '#666',
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedTimeframe: {
    backgroundColor: '#2e7d32',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedTimeframeText: {
    color: '#fff',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  impactCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  treeEquivalent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  treeText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  communitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  trendsSection: {
    marginBottom: 24,
  },
  metricToggle: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedToggle: {
    backgroundColor: '#2e7d32',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 