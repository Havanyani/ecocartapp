import { useTheme } from '@/hooks/useTheme';
import { Achievement, Badge, GamificationProfile as GamificationProfileType } from '@/types/gamification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AchievementCard from './AchievementCard';

interface GamificationProfileProps {
  profile: GamificationProfileType;
  onAchievementPress?: (achievement: Achievement) => void;
  onBadgePress?: (badge: Badge) => void;
  onViewAllAchievements?: () => void;
}

export function GamificationProfile({
  profile,
  onAchievementPress,
  onBadgePress,
  onViewAllAchievements
}: GamificationProfileProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Level progress */}
      <View style={[styles.levelCard, { backgroundColor: theme.colors.primary + '10' }]}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={[styles.levelLabel, { color: theme.colors.text + '99' }]}>
              CURRENT LEVEL
            </Text>
            <Text style={[styles.levelTitle, { color: theme.colors.primary }]}>
              Level {profile.level.currentLevel}
            </Text>
          </View>
          
          <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="star" size={18} color="white" />
            <Text style={styles.levelPoints}>{profile.points.available}</Text>
          </View>
        </View>
        
        <View style={styles.levelProgressContainer}>
          <View 
            style={[
              styles.levelProgressBar, 
              { backgroundColor: theme.colors.background }
            ]}
          >
            <View 
              style={[
                styles.levelProgressFill, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${profile.level.progress}%`
                }
              ]}
            />
          </View>
          <Text style={[styles.levelProgressText, { color: theme.colors.text }]}>
            {profile.level.currentPoints} / {profile.level.nextLevelPoints} XP
          </Text>
        </View>
        
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={20} color={theme.colors.warning} />
          <Text style={[styles.streakText, { color: theme.colors.text }]}>
            {profile.streakDays} day{profile.streakDays !== 1 ? 's' : ''} streak!
          </Text>
        </View>
      </View>
      
      {/* Impact summary */}
      <View style={styles.impactSummary}>
        <View style={[styles.impactItem, { backgroundColor: '#4CAF5020' }]}>
          <Text style={[styles.impactValue, { color: '#4CAF50' }]}>
            {profile.impact.totalWeight.toFixed(1)} kg
          </Text>
          <Text style={[styles.impactLabel, { color: theme.colors.text + '99' }]}>
            Recycled
          </Text>
        </View>
        
        <View style={[styles.impactItem, { backgroundColor: '#2196F320' }]}>
          <Text style={[styles.impactValue, { color: '#2196F3' }]}>
            {profile.impact.co2Saved.toFixed(1)} kg
          </Text>
          <Text style={[styles.impactLabel, { color: theme.colors.text + '99' }]}>
            CO₂ Saved
          </Text>
        </View>
        
        <View style={[styles.impactItem, { backgroundColor: '#FF980020' }]}>
          <Text style={[styles.impactValue, { color: '#FF9800' }]}>
            {profile.impact.treesEquivalent.toFixed(1)}
          </Text>
          <Text style={[styles.impactLabel, { color: theme.colors.text + '99' }]}>
            Trees Equivalent
          </Text>
        </View>
      </View>
      
      {/* Badges */}
      {profile.badges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Badges
            </Text>
            <Text style={[styles.badgeCount, { color: theme.colors.text + '99' }]}>
              {profile.badges.length} Badge{profile.badges.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {profile.badges.map(badge => (
              <TouchableOpacity 
                key={badge.id}
                style={[
                  styles.badgeItem,
                  {
                    backgroundColor: getBadgeColor(badge.rarity) + '10',
                    borderColor: getBadgeColor(badge.rarity) + '30',
                  }
                ]}
                onPress={() => onBadgePress?.(badge)}
              >
                <View 
                  style={[
                    styles.badgeIconContainer,
                    { backgroundColor: getBadgeColor(badge.rarity) + '20' }
                  ]}
                >
                  <Ionicons 
                    name={badge.icon as any} 
                    size={24} 
                    color={getBadgeColor(badge.rarity)} 
                  />
                </View>
                <Text 
                  style={[
                    styles.badgeName, 
                    { color: theme.colors.text }
                  ]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                <Text 
                  style={[
                    styles.badgeCategory, 
                    { color: theme.colors.text + '99' }
                  ]}
                  numberOfLines={1}
                >
                  {badge.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Recent achievements */}
      {profile.achievements.recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Achievements
            </Text>
            <TouchableOpacity onPress={onViewAllAchievements}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All ({profile.achievements.completed}/{profile.achievements.total})
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsContainer}>
            {profile.achievements.recent.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onPress={onAchievementPress}
                compact
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Helper to get badge color based on rarity
function getBadgeColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return '#8BC34A'; // Light Green
    case 'uncommon':
      return '#03A9F4'; // Light Blue
    case 'rare':
      return '#9C27B0'; // Purple
    case 'epic':
      return '#FF9800'; // Orange
    case 'legendary':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  levelCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelPoints: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  levelProgressContainer: {
    marginBottom: 12,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  impactSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  badgeCount: {
    fontSize: 14,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgesContainer: {
    paddingBottom: 8,
  },
  badgeItem: {
    width: 100,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeCategory: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  achievementsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  }
});

export default GamificationProfile; 