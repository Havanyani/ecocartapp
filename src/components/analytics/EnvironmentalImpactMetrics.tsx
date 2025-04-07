/**
 * EnvironmentalImpactMetrics.tsx
 * 
 * A component that displays environmental impact metrics in an interactive
 * card format with detailed visualizations.
 */

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/numberUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface PlasticType {
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

interface MonthlyTrends {
  dates: string[];
  plasticWeights: number[];
  co2Savings: number[];
}

interface ImpactMetricsProps {
  totalPlasticCollected: number;
  plasticTypes: PlasticType[];
  co2Reduction: number;
  waterSaved: number;
  energySaved: number;
  treesEquivalent: number;
  communityMetrics: CommunityMetrics;
  monthlyTrends: MonthlyTrends;
}

interface EnvironmentalImpactMetricsProps {
  metrics: ImpactMetricsProps;
  onTimeframeChange?: (timeframe: string) => void;
}

export function EnvironmentalImpactMetrics({
  metrics,
  onTimeframeChange,
}: EnvironmentalImpactMetricsProps): JSX.Element {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState<string>('Month');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    if (onTimeframeChange) {
      onTimeframeChange(value);
    }
  };

  const toggleCardExpanded = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const isCardExpanded = (cardId: string) => expandedCard === cardId;

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'plastic':
        return 'recycle';
      case 'co2':
        return 'molecule-co2';
      case 'water':
        return 'water';
      case 'trees':
        return 'tree';
      case 'energy':
        return 'lightning-bolt';
      default:
        return 'chart-line';
    }
  };

  const getMetricColor = (metricType: string) => {
    switch (metricType) {
      case 'plastic':
        return '#1976D2';
      case 'co2':
        return '#388E3C';
      case 'water':
        return '#0288D1';
      case 'trees':
        return '#43A047';
      case 'energy':
        return '#FFA000';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <SegmentedControl
        values={['Week', 'Month', 'Year']}
        selectedIndex={['Week', 'Month', 'Year'].indexOf(timeframe)}
        onChange={handleTimeframeChange}
        style={styles.segmentedControl}
      />

      <View style={styles.cardsContainer}>
        {/* Plastic Collection Card */}
        <ImpactCard
          title="Plastic Collected"
          value={formatNumber(metrics.totalPlasticCollected, 2)}
          unit="kg"
          icon={getMetricIcon('plastic')}
          color={getMetricColor('plastic')}
          isExpanded={isCardExpanded('plastic')}
          onToggleExpand={() => toggleCardExpanded('plastic')}
          expandedContent={
            <View style={styles.expandedContent}>
              <ThemedText style={styles.expandedTitle}>Breakdown by Type</ThemedText>
              {metrics.plasticTypes.map((type, index) => (
                <View key={index} style={styles.typeRow}>
                  <View style={styles.typeInfo}>
                    <ThemedText style={styles.typeName}>{type.type}</ThemedText>
                    <ThemedText style={styles.typeValue}>{formatNumber(type.weight, 2)} kg</ThemedText>
                  </View>
                  <View 
                    style={[
                      styles.typeBar, 
                      { 
                        width: `${(type.weight / metrics.totalPlasticCollected) * 100}%`,
                        backgroundColor: getMetricColor('plastic') 
                      }
                    ]} 
                  />
                </View>
              ))}
              <ThemedText style={styles.impactNote}>
                That's equivalent to approximately {Math.round(metrics.totalPlasticCollected * 50)} plastic bottles!
              </ThemedText>
            </View>
          }
        />

        {/* CO2 Reduction Card */}
        <ImpactCard
          title="CO₂ Reduction"
          value={formatNumber(metrics.co2Reduction, 2)}
          unit="kg"
          icon={getMetricIcon('co2')}
          color={getMetricColor('co2')}
          isExpanded={isCardExpanded('co2')}
          onToggleExpand={() => toggleCardExpanded('co2')}
          expandedContent={
            <View style={styles.expandedContent}>
              <ThemedText style={styles.expandedTitle}>Carbon Footprint Reduction</ThemedText>
              <View style={styles.equivalentItem}>
                <MaterialCommunityIcons name="car" size={24} color={getMetricColor('co2')} />
                <ThemedText style={styles.equivalentText}>
                  Equivalent to {formatNumber(metrics.co2Reduction / 0.12, 1)} km not driven by car
                </ThemedText>
              </View>
              <View style={styles.equivalentItem}>
                <MaterialCommunityIcons name="tree" size={24} color={getMetricColor('trees')} />
                <ThemedText style={styles.equivalentText}>
                  {formatNumber(metrics.treesEquivalent, 1)} trees absorbing CO₂ for a day
                </ThemedText>
              </View>
              <ThemedText style={styles.impactNote}>
                The average person produces about 4,500 kg of CO₂ per year
              </ThemedText>
            </View>
          }
        />

        {/* Water Saved Card */}
        <ImpactCard
          title="Water Saved"
          value={formatNumber(metrics.waterSaved, 0)}
          unit="L"
          icon={getMetricIcon('water')}
          color={getMetricColor('water')}
          isExpanded={isCardExpanded('water')}
          onToggleExpand={() => toggleCardExpanded('water')}
          expandedContent={
            <View style={styles.expandedContent}>
              <ThemedText style={styles.expandedTitle}>Water Conservation</ThemedText>
              <View style={styles.equivalentItem}>
                <MaterialCommunityIcons name="shower" size={24} color={getMetricColor('water')} />
                <ThemedText style={styles.equivalentText}>
                  Equivalent to {formatNumber(metrics.waterSaved / 100, 0)} showers
                </ThemedText>
              </View>
              <View style={styles.equivalentItem}>
                <MaterialCommunityIcons name="home" size={24} color={getMetricColor('water')} />
                <ThemedText style={styles.equivalentText}>
                  {formatNumber(metrics.waterSaved / 150, 1)} days of household water usage
                </ThemedText>
              </View>
              <ThemedText style={styles.impactNote}>
                Recycling 1 kg of plastic saves about 3,000 liters of water
              </ThemedText>
            </View>
          }
        />

        {/* Energy Saved Card */}
        <ImpactCard
          title="Energy Saved"
          value={formatNumber(metrics.energySaved, 0)}
          unit="kWh"
          icon={getMetricIcon('energy')}
          color={getMetricColor('energy')}
          isExpanded={isCardExpanded('energy')}
          onToggleExpand={() => toggleCardExpanded('energy')}
          expandedContent={
            <View style={styles.expandedContent}>
              <ThemedText style={styles.expandedTitle}>Energy Conservation</ThemedText>
              <View style={styles.equivalentItem}>
                <MaterialCommunityIcons name="lightbulb" size={24} color={getMetricColor('energy')} />
                <ThemedText style={styles.equivalentText}>
                  Powers a light bulb for {formatNumber(metrics.energySaved * 166, 0)} hours
                </ThemedText>
              </View>
              <View style={styles.equivalentItem}>
                <MaterialCommunityIcons name="laptop" size={24} color={getMetricColor('energy')} />
                <ThemedText style={styles.equivalentText}>
                  Charges a laptop {formatNumber(metrics.energySaved / 0.05, 0)} times
                </ThemedText>
              </View>
              <ThemedText style={styles.impactNote}>
                The average household uses about 30 kWh of electricity per day
              </ThemedText>
            </View>
          }
        />
      </View>

      <ThemedView style={styles.totalImpactContainer}>
        <ThemedText style={styles.totalImpactTitle}>
          Total Community Impact
        </ThemedText>
        <ThemedText style={styles.communityMetricText}>
          <MaterialCommunityIcons 
            name="account-group" 
            size={16} 
            color={theme.colors.text} 
          /> {metrics.communityMetrics.activeUsers} active users out of {metrics.communityMetrics.totalUsers}
        </ThemedText>
        <ThemedText style={styles.communityMetricText}>
          <MaterialCommunityIcons 
            name="recycle" 
            size={16} 
            color={theme.colors.text} 
          /> {formatNumber(metrics.communityMetrics.totalCollections, 0)} total collections
        </ThemedText>
        <ThemedText style={styles.communityMetricText}>
          <MaterialCommunityIcons 
            name="scale-balance" 
            size={16} 
            color={theme.colors.text} 
          /> {formatNumber(metrics.communityMetrics.averagePerUser, 2)} kg average per user
        </ThemedText>
      </ThemedView>
    </View>
  );
}

interface ImpactCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedContent: React.ReactNode;
}

function ImpactCard({
  title,
  value,
  unit,
  icon,
  color,
  isExpanded,
  onToggleExpand,
  expandedContent,
}: ImpactCardProps): JSX.Element {
  return (
    <ThemedView 
      style={[
        styles.card, 
        isExpanded && styles.expandedCard
      ]}
    >
      <TouchableOpacity
        onPress={onToggleExpand}
        style={styles.cardHeader}
        activeOpacity={0.7}
      >
        <View style={styles.cardTitleSection}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={icon} size={24} color="#fff" />
          </View>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        </View>
        <View style={styles.valueContainer}>
          <ThemedText style={styles.valueText}>{value}</ThemedText>
          <ThemedText style={styles.unitText}>{unit}</ThemedText>
        </View>
        <MaterialCommunityIcons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color="#888" 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.cardExpandedSection}>
          {expandedContent}
        </View>
      )}
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // Full width minus padding

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  segmentedControl: {
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    width: cardWidth,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 8,
  },
  expandedCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 8,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unitText: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardExpandedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  expandedContent: {
    paddingBottom: 8,
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeRow: {
    marginBottom: 12,
  },
  typeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeName: {
    fontSize: 14,
  },
  typeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeBar: {
    height: 8,
    borderRadius: 4,
  },
  equivalentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  equivalentText: {
    marginLeft: 12,
    fontSize: 14,
  },
  impactNote: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 8,
  },
  totalImpactContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  totalImpactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  communityMetricText: {
    fontSize: 14,
    marginBottom: 8,
  },
}); 