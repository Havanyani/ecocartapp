import { useTheme } from '@/hooks/useTheme';
import { EnvironmentalImpact } from '@/types/gamification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// Image assets for visualizations
const treeImage = require('@/assets/images/tree.png');
const carImage = require('@/assets/images/car.png');
const bottleImage = require('@/assets/images/plastic-bottle.png');
const showerImage = require('@/assets/images/shower.png');
const lightbulbImage = require('@/assets/images/lightbulb.png');

interface ImpactVisualizationProps {
  impact: EnvironmentalImpact;
  showComparisons?: boolean;
}

// Type for material icons to ensure type safety
type MaterialIconName = 'water' | 'newspaper' | 'beer' | 'hardware-chip' | 'phone-portrait' | 'cube';

export function ImpactVisualization({ 
  impact, 
  showComparisons = true 
}: ImpactVisualizationProps) {
  const { theme } = useTheme();

  // Get weight percentage for each material type
  const getWeightPercentage = (materialWeight: number): number => {
    return Math.round((materialWeight / impact.totalWeight) * 100) || 0;
  };

  // Format the weight with correct unit (kg or g)
  const formatWeight = (weight: number): string => {
    if (weight >= 1) {
      return `${weight.toFixed(1)} kg`;
    } else {
      return `${(weight * 1000).toFixed(0)} g`;
    }
  };

  // Get icon for material type
  const getMaterialIcon = (materialType: string): MaterialIconName => {
    switch (materialType) {
      case 'plastic':
        return 'water';
      case 'paper':
        return 'newspaper';
      case 'glass':
        return 'beer';
      case 'metal':
        return 'hardware-chip';
      case 'electronics':
        return 'phone-portrait';
      default:
        return 'cube';
    }
  };

  return (
    <View style={styles.container}>
      {/* Total impact summary */}
      <View style={[styles.totalImpactCard, { backgroundColor: theme.colors.success + '15' }]}>
        <View style={styles.totalImpactHeader}>
          <Ionicons name="earth" size={24} color={theme.colors.success} />
          <Text style={[styles.totalImpactTitle, { color: theme.colors.text.primary }]}>
            Your Environmental Impact
          </Text>
        </View>
        
        <View style={styles.totalImpactStats}>
          <View style={styles.impactStat}>
            <Text style={[styles.impactValue, { color: theme.colors.success }]}>
              {formatWeight(impact.totalWeight)}
            </Text>
            <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>
              Total Recycled
            </Text>
          </View>
          
          <View style={styles.impactStat}>
            <Text style={[styles.impactValue, { color: theme.colors.success }]}>
              {impact.co2Saved.toFixed(1)} kg
            </Text>
            <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>
              CO₂ Saved
            </Text>
          </View>
          
          <View style={styles.impactStat}>
            <Text style={[styles.impactValue, { color: theme.colors.success }]}>
              {impact.treesEquivalent.toFixed(1)}
            </Text>
            <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>
              Trees Equivalent
            </Text>
          </View>
        </View>
      </View>
      
      {/* Material breakdown */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Material Breakdown
        </Text>
        
        <View style={[styles.materialBreakdownCard, { backgroundColor: theme.colors.card }]}>
          {/* Progress bars for each material */}
          {impact.plasticWeight > 0 && (
            <View style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <View style={styles.materialIconLabel}>
                  <Ionicons 
                    name={getMaterialIcon('plastic')} 
                    size={16} 
                    color="#E91E63" 
                  />
                  <Text style={[styles.materialLabel, { color: theme.colors.text.primary }]}>
                    Plastic
                  </Text>
                </View>
                <Text style={[styles.materialWeight, { color: theme.colors.text.secondary }]}>
                  {formatWeight(impact.plasticWeight)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.background }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#E91E63",
                      width: `${getWeightPercentage(impact.plasticWeight)}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
          
          {impact.paperWeight > 0 && (
            <View style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <View style={styles.materialIconLabel}>
                  <Ionicons 
                    name={getMaterialIcon('paper')} 
                    size={16} 
                    color="#FF9800" 
                  />
                  <Text style={[styles.materialLabel, { color: theme.colors.text.primary }]}>
                    Paper & Cardboard
                  </Text>
                </View>
                <Text style={[styles.materialWeight, { color: theme.colors.text.secondary }]}>
                  {formatWeight(impact.paperWeight)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.background }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#FF9800",
                      width: `${getWeightPercentage(impact.paperWeight)}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
          
          {impact.glassWeight > 0 && (
            <View style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <View style={styles.materialIconLabel}>
                  <Ionicons 
                    name={getMaterialIcon('glass')} 
                    size={16} 
                    color="#2196F3" 
                  />
                  <Text style={[styles.materialLabel, { color: theme.colors.text.primary }]}>
                    Glass
                  </Text>
                </View>
                <Text style={[styles.materialWeight, { color: theme.colors.text.secondary }]}>
                  {formatWeight(impact.glassWeight)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.background }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#2196F3",
                      width: `${getWeightPercentage(impact.glassWeight)}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
          
          {impact.metalWeight > 0 && (
            <View style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <View style={styles.materialIconLabel}>
                  <Ionicons 
                    name={getMaterialIcon('metal')} 
                    size={16} 
                    color="#607D8B" 
                  />
                  <Text style={[styles.materialLabel, { color: theme.colors.text.primary }]}>
                    Metal
                  </Text>
                </View>
                <Text style={[styles.materialWeight, { color: theme.colors.text.secondary }]}>
                  {formatWeight(impact.metalWeight)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.background }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#607D8B",
                      width: `${getWeightPercentage(impact.metalWeight)}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
          
          {impact.electronicsWeight > 0 && (
            <View style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <View style={styles.materialIconLabel}>
                  <Ionicons 
                    name={getMaterialIcon('electronics')} 
                    size={16} 
                    color="#673AB7" 
                  />
                  <Text style={[styles.materialLabel, { color: theme.colors.text.primary }]}>
                    Electronics
                  </Text>
                </View>
                <Text style={[styles.materialWeight, { color: theme.colors.text.secondary }]}>
                  {formatWeight(impact.electronicsWeight)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.background }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#673AB7",
                      width: `${getWeightPercentage(impact.electronicsWeight)}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
          
          {impact.otherWeight > 0 && (
            <View style={styles.materialItem}>
              <View style={styles.materialHeader}>
                <View style={styles.materialIconLabel}>
                  <Ionicons 
                    name={getMaterialIcon('other')} 
                    size={16} 
                    color="#9E9E9E" 
                  />
                  <Text style={[styles.materialLabel, { color: theme.colors.text.primary }]}>
                    Other
                  </Text>
                </View>
                <Text style={[styles.materialWeight, { color: theme.colors.text.secondary }]}>
                  {formatWeight(impact.otherWeight)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.background }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: "#9E9E9E",
                      width: `${getWeightPercentage(impact.otherWeight)}%`
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Impact comparisons */}
      {showComparisons && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            What Your Impact Means
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.comparisonsContainer}
          >
            {/* Trees saved */}
            <View 
              style={[
                styles.comparisonCard, 
                { backgroundColor: theme.colors.card }
              ]}
            >
              <Image 
                source={treeImage} 
                style={styles.comparisonImage} 
                resizeMode="contain" 
              />
              <Text style={[styles.comparisonValue, { color: theme.colors.success }]}>
                {impact.treesEquivalent.toFixed(1)}
              </Text>
              <Text style={[styles.comparisonLabel, { color: theme.colors.text.primary }]}>
                Trees Equivalent
              </Text>
            </View>
            
            {/* Car not driven */}
            <View 
              style={[
                styles.comparisonCard, 
                { backgroundColor: theme.colors.card }
              ]}
            >
              <Image 
                source={carImage} 
                style={styles.comparisonImage} 
                resizeMode="contain" 
              />
              <Text style={[styles.comparisonValue, { color: theme.colors.primary }]}>
                {impact.comparisons.carNotDriven.toFixed(0)} km
              </Text>
              <Text style={[styles.comparisonLabel, { color: theme.colors.text.primary }]}>
                Car Distance Not Driven
              </Text>
            </View>
            
            {/* Plastic bottles saved */}
            <View 
              style={[
                styles.comparisonCard, 
                { backgroundColor: theme.colors.card }
              ]}
            >
              <Image 
                source={bottleImage} 
                style={styles.comparisonImage} 
                resizeMode="contain" 
              />
              <Text style={[styles.comparisonValue, { color: '#E91E63' }]}>
                {impact.comparisons.plasticBottlesSaved.toFixed(0)}
              </Text>
              <Text style={[styles.comparisonLabel, { color: theme.colors.text.primary }]}>
                Plastic Bottles
              </Text>
            </View>
            
            {/* Showers skipped */}
            <View 
              style={[
                styles.comparisonCard, 
                { backgroundColor: theme.colors.card }
              ]}
            >
              <Image 
                source={showerImage} 
                style={styles.comparisonImage} 
                resizeMode="contain" 
              />
              <Text style={[styles.comparisonValue, { color: '#2196F3' }]}>
                {impact.comparisons.showersMissed.toFixed(0)}
              </Text>
              <Text style={[styles.comparisonLabel, { color: theme.colors.text.primary }]}>
                Showers' Worth of Water
              </Text>
            </View>
            
            {/* Lightbulbs for a year */}
            <View 
              style={[
                styles.comparisonCard, 
                { backgroundColor: theme.colors.card }
              ]}
            >
              <Image 
                source={lightbulbImage} 
                style={styles.comparisonImage} 
                resizeMode="contain" 
              />
              <Text style={[styles.comparisonValue, { color: '#FF9800' }]}>
                {impact.comparisons.bulbsForYear.toFixed(0)}
              </Text>
              <Text style={[styles.comparisonLabel, { color: theme.colors.text.primary }]}>
                Lightbulbs Powered for a Year
              </Text>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  totalImpactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  totalImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalImpactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  totalImpactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  materialBreakdownCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  materialItem: {
    marginBottom: 16,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  materialIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  materialWeight: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  comparisonsContainer: {
    paddingBottom: 8,
    paddingTop: 8,
  },
  comparisonCard: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  comparisonImage: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comparisonLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ImpactVisualization; 