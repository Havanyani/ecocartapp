import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type LoyaltyLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface LoyaltyProgramProps {
  points: number;
  level: LoyaltyLevel;
  nextLevelPoints: number;
  onViewBenefits?: () => void;
}

interface LevelConfig {
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  multiplier: number;
  benefits: string[];
}

const LEVEL_CONFIG: Record<LoyaltyLevel, LevelConfig> = {
  'Bronze': {
    color: '#CD7F32',
    icon: 'medal',
    multiplier: 1.0,
    benefits: ['1.0x Credit Multiplier', 'Priority Collection Scheduling']
  },
  'Silver': {
    color: '#C0C0C0',
    icon: 'medal',
    multiplier: 1.2,
    benefits: ['1.2x Credit Multiplier', 'Priority Collection Scheduling', 'Exclusive Promotions']
  },
  'Gold': {
    color: '#FFD700',
    icon: 'medal',
    multiplier: 1.5,
    benefits: ['1.5x Credit Multiplier', 'Priority Collection Scheduling', 'Exclusive Promotions', 'VIP Support']
  },
  'Platinum': {
    color: '#E5E4E2',
    icon: 'crown',
    multiplier: 2.0,
    benefits: ['2.0x Credit Multiplier', 'Priority Collection Scheduling', 'Exclusive Promotions', 'VIP Support']
  }
};

export function LoyaltyProgram({ points, level, nextLevelPoints, onViewBenefits }: LoyaltyProgramProps): JSX.Element {
  const progress = (points / nextLevelPoints) * 100;
  const levelConfig = LEVEL_CONFIG[level];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="star" size={24} color="#2e7d32" />
        EcoRewards
      </ThemedText>

      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.pointsText}>{points.toLocaleString()}</ThemedText>
        <ThemedText style={styles.pointsLabel}>Points</ThemedText>
      </ThemedView>

      <View style={styles.header}>
        <MaterialCommunityIcons 
          name={levelConfig.icon}
          size={32}
          color={levelConfig.color}
        />
        <ThemedText style={styles.levelText}>{level} Member</ThemedText>
      </View>

      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.min(progress, 100)}%`, backgroundColor: levelConfig.color }
          ]} 
        />
        <ThemedText style={styles.progressText}>
          {points.toLocaleString()} / {nextLevelPoints.toLocaleString()} points to next level
        </ThemedText>
      </View>

      <View style={styles.benefitsContainer}>
        <ThemedText style={styles.benefitsTitle}>Your Benefits:</ThemedText>
        {levelConfig.benefits.map((benefit, index) => (
          <ThemedText key={index} style={styles.benefitItem}>
            • {benefit}
          </ThemedText>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={onViewBenefits}
        accessibilityLabel="View all loyalty program benefits"
        accessibilityRole="button"
      >
        <ThemedText style={styles.detailsText}>View All Benefits</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  progressContainer: {
    backgroundColor: '#f0f0f0',
    height: 20,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#2e7d32',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 20,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailsButton: {
    backgroundColor: '#f0f9f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
}); 