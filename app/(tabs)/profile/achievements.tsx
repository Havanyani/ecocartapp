import AchievementCard from '@/components/gamification/AchievementCard';
import { useTheme } from '@/hooks/useTheme';
import {
    Achievement,
    AchievementCategory,
    AchievementStatus,
    Badge
} from '@/types/gamification';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// Mock achievements - in production, these would come from a service
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Recycling',
    description: 'Recycle your first item',
    category: AchievementCategory.RECYCLING,
    icon: 'leaf',
    status: AchievementStatus.COMPLETED,
    requirements: [{ type: 'recycle_count', value: 1, currentValue: 1 }],
    reward: { id: '101', type: 'points', value: 50, title: '50 Points' },
    unlockedAt: '2023-06-15T10:30:00Z',
    progress: 100
  },
  {
    id: '2',
    title: 'Collection Expert',
    description: 'Schedule 5 collections',
    category: AchievementCategory.COLLECTION,
    icon: 'calendar',
    status: AchievementStatus.IN_PROGRESS,
    requirements: [{ type: 'collection_count', value: 5, currentValue: 3 }],
    reward: { id: '102', type: 'badge', value: 'collector_badge', title: 'Collector Badge' },
    progress: 60
  },
  {
    id: '3',
    title: 'Tree Saver',
    description: 'Save the equivalent of 5 trees through your recycling',
    category: AchievementCategory.IMPACT,
    icon: 'tree',
    status: AchievementStatus.LOCKED,
    requirements: [{ type: 'trees_saved', value: 5, currentValue: 0 }],
    reward: { id: '103', type: 'points', value: 200, title: '200 Points' },
    progress: 0
  },
  {
    id: '4',
    title: 'Community Champion',
    description: 'Participate in 3 community challenges',
    category: AchievementCategory.COMMUNITY,
    icon: 'people',
    status: AchievementStatus.LOCKED,
    requirements: [{ type: 'challenge_participation', value: 3, currentValue: 0 }],
    reward: { id: '104', type: 'badge', value: 'community_badge', title: 'Community Champion Badge' },
    progress: 0
  },
  {
    id: '5',
    title: 'App Explorer',
    description: 'View all sections of the app',
    category: AchievementCategory.APP_USAGE,
    icon: 'compass',
    status: AchievementStatus.IN_PROGRESS,
    requirements: [{ type: 'app_sections_viewed', value: 6, currentValue: 4 }],
    reward: { id: '105', type: 'points', value: 100, title: '100 Points' },
    progress: 66
  },
  {
    id: '6',
    title: 'Plastic Warrior',
    description: 'Recycle 10kg of plastic',
    category: AchievementCategory.RECYCLING,
    icon: 'water',
    status: AchievementStatus.IN_PROGRESS,
    requirements: [{ type: 'plastic_recycled', value: 10, currentValue: 7.5 }],
    reward: { id: '106', type: 'points', value: 150, title: '150 Points' },
    progress: 75
  },
  {
    id: '7',
    title: 'Waste Reduction Hero',
    description: 'Prevent 100kg of waste from going to landfill',
    category: AchievementCategory.IMPACT,
    icon: 'trash',
    status: AchievementStatus.LOCKED,
    requirements: [{ type: 'waste_reduced', value: 100, currentValue: 35 }],
    reward: { id: '107', type: 'badge', value: 'hero_badge', title: 'Hero Badge' },
    progress: 35
  }
];

// Mock badges
const MOCK_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Recycling Rookie',
    description: 'Earned by completing your first recycling',
    icon: 'medal',
    category: AchievementCategory.RECYCLING,
    rarity: 'common',
    unlockedAt: '2023-06-15T10:30:00Z'
  },
  {
    id: 'b2',
    name: 'CO₂ Reducer',
    description: 'Saved 10kg of CO₂ through your recycling efforts',
    icon: 'cloud',
    category: AchievementCategory.IMPACT,
    rarity: 'uncommon',
    unlockedAt: '2023-07-20T14:15:00Z'
  },
  {
    id: 'b3',
    name: 'Schedule Master',
    description: 'Scheduled 10 collections successfully',
    icon: 'calendar',
    category: AchievementCategory.COLLECTION,
    rarity: 'rare'
  }
];

interface CategoryFilterProps {
  categories: { key: AchievementCategory; label: string }[];
  selectedCategory: AchievementCategory | null;
  onSelectCategory: (category: AchievementCategory | null) => void;
}

function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { theme } = useTheme();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      <TouchableOpacity
        style={[
          styles.filterItem,
          {
            backgroundColor: selectedCategory === null ? theme.colors.primary : 'transparent',
            borderColor: theme.colors.primary
          }
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Text 
          style={[
            styles.filterText, 
            { 
              color: selectedCategory === null ? 'white' : theme.colors.text 
            }
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      {categories.map(category => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.filterItem,
            {
              backgroundColor: selectedCategory === category.key ? theme.colors.primary : 'transparent',
              borderColor: theme.colors.primary
            }
          ]}
          onPress={() => onSelectCategory(category.key)}
        >
          <Text 
            style={[
              styles.filterText, 
              { 
                color: selectedCategory === category.key ? 'white' : theme.colors.text 
              }
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function AchievementsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges'>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Categories for filter
  const categories = [
    { key: AchievementCategory.RECYCLING, label: 'Recycling' },
    { key: AchievementCategory.COLLECTION, label: 'Collection' },
    { key: AchievementCategory.IMPACT, label: 'Impact' },
    { key: AchievementCategory.COMMUNITY, label: 'Community' },
    { key: AchievementCategory.APP_USAGE, label: 'App Usage' }
  ];
  
  // Load achievements and badges (mock data for now)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAchievements(MOCK_ACHIEVEMENTS);
      setBadges(MOCK_BADGES);
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Filter achievements by category
  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;
  
  // Filter badges by category
  const filteredBadges = selectedCategory
    ? badges.filter(b => b.category === selectedCategory)
    : badges;
  
  // Handle achievement press
  const handleAchievementPress = (achievement: Achievement) => {
    if (achievement.status === AchievementStatus.COMPLETED) {
      // Handle claim
      console.log('Claiming achievement:', achievement.id);
    } else {
      // Show details
      console.log('Achievement details:', achievement.id);
    }
  };
  
  // Handle badge press
  const handleBadgePress = (badge: Badge) => {
    console.log('Badge details:', badge.id);
  };
  
  // Render achievement item
  const renderAchievement = ({ item }: { item: Achievement }) => (
    <AchievementCard 
      achievement={item} 
      onPress={handleAchievementPress} 
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Achievements & Badges
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'achievements' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons 
            name="trophy" 
            size={20} 
            color={activeTab === 'achievements' ? theme.colors.primary : theme.colors.text + '99'} 
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: activeTab === 'achievements' ? theme.colors.primary : theme.colors.text + '99' 
              }
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'badges' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setActiveTab('badges')}
        >
          <Ionicons 
            name="ribbon" 
            size={20} 
            color={activeTab === 'badges' ? theme.colors.primary : theme.colors.text + '99'} 
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: activeTab === 'badges' ? theme.colors.primary : theme.colors.text + '99' 
              }
            ]}
          >
            Badges
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Category Filter */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading {activeTab}...
          </Text>
        </View>
      ) : (
        <>
          {activeTab === 'achievements' ? (
            <>
              {filteredAchievements.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="trophy" size={64} color={theme.colors.text + '30'} />
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    No achievements found
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.text + '99' }]}>
                    {selectedCategory 
                      ? `Try selecting a different category` 
                      : `Keep recycling to earn achievements`}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredAchievements}
                  renderItem={renderAchievement}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          ) : (
            <>
              {filteredBadges.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="ribbon" size={64} color={theme.colors.text + '30'} />
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    No badges found
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.text + '99' }]}>
                    {selectedCategory 
                      ? `Try selecting a different category` 
                      : `Complete achievements to earn badges`}
                  </Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.badgesContainer}>
                  {filteredBadges.map(badge => (
                    <TouchableOpacity
                      key={badge.id}
                      style={[
                        styles.badgeItem,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: getBadgeColor(badge.rarity),
                        }
                      ]}
                      onPress={() => handleBadgePress(badge)}
                    >
                      <View 
                        style={[
                          styles.badgeIconContainer,
                          {
                            backgroundColor: getBadgeColor(badge.rarity) + '20'
                          }
                        ]}
                      >
                        <Ionicons 
                          name={badge.icon as any} 
                          size={32} 
                          color={getBadgeColor(badge.rarity)} 
                        />
                      </View>
                      <Text style={[styles.badgeName, { color: theme.colors.text }]}>
                        {badge.name}
                      </Text>
                      <Text style={[styles.badgeCategory, { color: theme.colors.text + '99' }]}>
                        {badge.category}
                      </Text>
                      <Text style={[styles.badgeRarity, { color: getBadgeColor(badge.rarity) }]}>
                        {badge.rarity}
                      </Text>
                      <Text style={[styles.badgeDescription, { color: theme.colors.text + '99' }]}>
                        {badge.description}
                      </Text>
                      {badge.unlockedAt && (
                        <Text style={[styles.badgeUnlocked, { color: theme.colors.text + '70' }]}>
                          Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </>
      )}
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  badgesContainer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeCategory: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  badgeRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeUnlocked: {
    fontSize: 10,
    textAlign: 'center',
  }
}); 