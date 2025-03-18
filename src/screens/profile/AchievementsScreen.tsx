/**
 * AchievementsScreen.tsx
 * 
 * Screen to display user achievements, badges, and level progress.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import GamificationService from '@/services/GamificationService';
import { Achievement, Badge, GamifiedUserProfile } from '@/types/gamification';

interface AchievementsScreenProps {
  navigation: any;
}

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<GamifiedUserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges'>('achievements');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const gamificationService = GamificationService.getInstance();
          const userProfile = await gamificationService.initializeUserProfile(user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Failed to load gamification profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadProfile();
  }, [user]);
  
  // Get filtered achievements
  const getFilteredAchievements = (): Achievement[] => {
    if (!profile) return [];
    
    const achievements = [...profile.achievements];
    
    // Filter by category if selected
    if (categoryFilter) {
      return achievements.filter(a => a.category === categoryFilter);
    }
    
    return achievements.sort((a, b) => a.displayOrder - b.displayOrder);
  };
  
  // Get filtered badges
  const getFilteredBadges = (): Badge[] => {
    if (!profile) return [];
    
    const badges = [...profile.badges];
    
    // Filter by category if selected
    if (categoryFilter) {
      return badges.filter(b => b.category === categoryFilter);
    }
    
    return badges.sort((a, b) => {
      // Sort by level (bronze, silver, gold, platinum)
      const levelOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
      return levelOrder[a.level] - levelOrder[b.level];
    });
  };
  
  // Get category name for display
  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'recycling':
        return 'Recycling';
      case 'collection':
        return 'Collections';
      case 'eco_impact':
        return 'Eco Impact';
      case 'learning':
        return 'Learning';
      case 'community':
        return 'Community';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'recycling':
        return 'leaf';
      case 'collection':
        return 'cube';
      case 'eco_impact':
        return 'planet';
      case 'learning':
        return 'book';
      case 'community':
        return 'people';
      default:
        return 'ribbon';
    }
  };
  
  // Render achievement item
  const renderAchievementItem = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementItem, !item.isUnlocked && styles.achievementLocked]}>
      <View style={styles.achievementIconContainer}>
        <Ionicons 
          name={item.iconName as any} 
          size={30} 
          color={item.isUnlocked ? '#34C759' : '#8E8E93'} 
        />
      </View>
      
      <View style={styles.achievementContent}>
        <Text style={[
          styles.achievementTitle,
          !item.isUnlocked && styles.achievementLockedText
        ]}>
          {item.title}
        </Text>
        
        <Text style={styles.achievementDescription}>
          {item.description}
        </Text>
        
        {item.isUnlocked && item.unlockedAt && (
          <Text style={styles.achievementUnlockedText}>
            Unlocked on {new Date(item.unlockedAt).toLocaleDateString()}
          </Text>
        )}
        
        {!item.isUnlocked && item.totalRequired && item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (item.progress / item.totalRequired) * 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.progress} / {item.totalRequired}
            </Text>
          </View>
        )}
      </View>
      
      {item.isUnlocked && (
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>+{item.pointsAwarded}</Text>
        </View>
      )}
    </View>
  );
  
  // Render badge item
  const renderBadgeItem = ({ item }: { item: Badge }) => (
    <View style={[styles.badgeItem, !item.isUnlocked && styles.badgeLocked]}>
      <View style={[
        styles.badgeIconContainer,
        { backgroundColor: item.isUnlocked ? getBadgeColor(item.level) : '#E5E5EA' }
      ]}>
        <Ionicons 
          name={item.iconName as any} 
          size={40} 
          color={item.isUnlocked ? '#FFFFFF' : '#8E8E93'} 
        />
      </View>
      
      <Text style={[
        styles.badgeName,
        !item.isUnlocked && styles.badgeLockedText
      ]}>
        {item.name}
      </Text>
      
      <Text style={styles.badgeDescription}>
        {item.description}
      </Text>
      
      {item.isUnlocked && item.unlockedAt && (
        <Text style={styles.badgeUnlockedText}>
          Unlocked on {new Date(item.unlockedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
  
  // Get badge color based on level
  const getBadgeColor = (level: string): string => {
    switch (level) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#8E8E93';
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </SafeAreaView>
    );
  }
  
  // Show empty state if no profile
  if (!profile) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="trophy-outline" size={64} color="#E5E5EA" />
        <Text style={styles.emptyTitle}>No Achievements Yet</Text>
        <Text style={styles.emptyText}>
          Start recycling to earn achievements and badges!
        </Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Achievements</Text>
        </View>
        
        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelInfo}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{profile.level}</Text>
            </View>
            <View style={styles.levelDetails}>
              <Text style={styles.levelTitle}>Level {profile.level}</Text>
              <Text style={styles.pointsNeeded}>
                {profile.pointsToNextLevel} points to next level
              </Text>
            </View>
          </View>
          
          <View style={styles.levelProgress}>
            <View style={styles.levelProgressBar}>
              <View 
                style={[
                  styles.levelProgressFill,
                  { 
                    width: `${Math.min(100, 100 - (profile.pointsToNextLevel / (profile.currentPoints + profile.pointsToNextLevel)) * 100)}%` 
                  }
                ]}
              />
            </View>
            <Text style={styles.totalPoints}>
              {profile.totalPoints} total points
            </Text>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'achievements' && styles.activeTab
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Ionicons 
              name="trophy" 
              size={20} 
              color={activeTab === 'achievements' ? '#34C759' : '#8E8E93'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'achievements' && styles.activeTabText
              ]}
            >
              Achievements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'badges' && styles.activeTab
            ]}
            onPress={() => setActiveTab('badges')}
          >
            <Ionicons 
              name="ribbon" 
              size={20} 
              color={activeTab === 'badges' ? '#34C759' : '#8E8E93'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === 'badges' && styles.activeTabText
              ]}
            >
              Badges
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilters}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryFilter,
              categoryFilter === null && styles.categoryFilterActive
            ]}
            onPress={() => setCategoryFilter(null)}
          >
            <Text 
              style={[
                styles.categoryFilterText,
                categoryFilter === null && styles.categoryFilterTextActive
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {['recycling', 'collection', 'eco_impact'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilter,
                categoryFilter === category && styles.categoryFilterActive
              ]}
              onPress={() => setCategoryFilter(category)}
            >
              <Ionicons 
                name={getCategoryIcon(category) as any} 
                size={16} 
                color={categoryFilter === category ? '#34C759' : '#8E8E93'} 
                style={styles.categoryFilterIcon}
              />
              <Text 
                style={[
                  styles.categoryFilterText,
                  categoryFilter === category && styles.categoryFilterTextActive
                ]}
              >
                {getCategoryName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'achievements' ? (
            <FlatList
              data={getFilteredAchievements()}
              renderItem={renderAchievementItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Ionicons name="trophy-outline" size={64} color="#E5E5EA" />
                  <Text style={styles.emptyListTitle}>No Achievements Yet</Text>
                  <Text style={styles.emptyListText}>
                    Keep recycling to unlock achievements in this category!
                  </Text>
                </View>
              )}
            />
          ) : (
            <FlatList
              data={getFilteredBadges()}
              renderItem={renderBadgeItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              numColumns={2}
              columnWrapperStyle={styles.badgeColumnsWrapper}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Ionicons name="ribbon-outline" size={64} color="#E5E5EA" />
                  <Text style={styles.emptyListTitle}>No Badges Yet</Text>
                  <Text style={styles.emptyListText}>
                    Complete achievements to earn badges!
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center'
  },
  levelCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  levelDetails: {
    flex: 1
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  pointsNeeded: {
    fontSize: 14,
    color: '#8E8E93'
  },
  levelProgress: {
    marginBottom: 8
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden'
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4
  },
  totalPoints: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right'
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4
  },
  activeTabText: {
    color: '#2C3E50',
    fontWeight: '600'
  },
  categoryFilters: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  categoryFiltersContent: {
    paddingRight: 16
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F2F2F7'
  },
  categoryFilterActive: {
    backgroundColor: '#E3FFF1'
  },
  categoryFilterIcon: {
    marginRight: 4
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  categoryFilterTextActive: {
    color: '#34C759',
    fontWeight: '500'
  },
  content: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  achievementLocked: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  achievementContent: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  achievementLockedText: {
    color: '#8E8E93'
  },
  achievementDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8
  },
  achievementUnlockedText: {
    fontSize: 12,
    color: '#34C759'
  },
  progressContainer: {
    marginTop: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right'
  },
  pointsBadge: {
    backgroundColor: '#E3FFF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34C759'
  },
  badgeColumnsWrapper: {
    justifyContent: 'space-between'
  },
  badgeItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  badgeLocked: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7
  },
  badgeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center'
  },
  badgeLockedText: {
    color: '#8E8E93'
  },
  badgeDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8
  },
  badgeUnlockedText: {
    fontSize: 10,
    color: '#34C759',
    textAlign: 'center'
  },
  emptyListContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8
  },
  emptyListText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center'
  }
}); 