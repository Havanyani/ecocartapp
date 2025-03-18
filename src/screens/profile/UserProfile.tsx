import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Achievement } from '@/components/profile/Achievement';
import { CollectionHistoryList } from '@/components/profile/CollectionHistoryList';
import { CreditsBalance } from '@/components/profile/CreditsBalance';
import { ImpactMetrics } from '@/components/profile/ImpactMetrics';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ThemedText } from '@/components/ui';
import { useCredits } from '@/hooks/useCredits';
import { usePlasticCollection } from '@/hooks/usePlasticCollection';
import { useUserProfile } from '@/hooks/useUserProfile';

interface UserProfileProps {
  userId?: string;
}

interface AchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: Date;
  progress?: number;
}

/**
 * User Profile Screen
 * Displays user information, collection history, credits, and environmental impact
 */
export default function UserProfile({ userId }: UserProfileProps) {
  const { profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { credits, isLoading: isCreditsLoading } = useCredits();
  const { pickups, isLoading: isPickupsLoading } = usePlasticCollection();
  
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  
  // Tabs for the profile screen
  const tabs = [
    { id: 'collections', label: 'Collections' },
    { id: 'impact', label: 'Impact' },
    { id: 'achievements', label: 'Achievements' }
  ];
  
  useEffect(() => {
    // Load achievements data
    loadAchievements();
  }, []);
  
  /**
   * Load user achievements 
   */
  const loadAchievements = () => {
    // This would be an API call in a real app
    const mockAchievements: AchievementData[] = [
      {
        id: 'first-collection',
        title: 'First Collection',
        description: 'Complete your first plastic collection',
        icon: 'trophy',
        earnedDate: new Date(2023, 2, 15)
      },
      {
        id: '10-collections',
        title: 'Collection Pro',
        description: 'Complete 10 plastic collections',
        icon: 'star',
        earnedDate: new Date(2023, 5, 22)
      },
      {
        id: '100-kg',
        title: 'Weight Milestone',
        description: 'Collect 100 kg of plastic waste',
        icon: 'weight',
        progress: 0.7
      },
      {
        id: 'streak-30',
        title: '30 Day Streak',
        description: 'Collect plastic for 30 consecutive days',
        icon: 'calendar',
        progress: 0.4
      }
    ];
    
    setAchievements(mockAchievements);
  };
  
  /**
   * Handle tab selection
   */
  const handleTabSelect = (index: number) => {
    setSelectedTabIndex(index);
  };
  
  /**
   * Calculate environmental impact
   * Convert kg of plastic to environmental metrics
   */
  const calculateImpact = () => {
    // These would be more accurate in a real app
    const totalPlasticCollected = 
      pickups?.reduce((total, pickup) => total + (pickup.weight || 0), 0) || 0;
    
    return {
      plasticWeight: totalPlasticCollected,
      co2Saved: totalPlasticCollected * 2.5, // kg of CO2 saved per kg of plastic recycled
      waterSaved: totalPlasticCollected * 100, // liters of water saved 
      energySaved: totalPlasticCollected * 7.4 // kWh of energy saved
    };
  };
  
  const isLoading = isProfileLoading || isCreditsLoading || isPickupsLoading;
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading profile...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }
  
  const impact = calculateImpact();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile header with user info */}
        <ProfileHeader 
          name={profile?.name || 'User'}
          avatar={profile?.avatar}
          location={profile?.location}
          joinDate={profile?.joinDate}
        />
        
        {/* Credits balance card */}
        <CreditsBalance 
          balance={credits?.balance || 0}
          pendingCredits={credits?.pending || 0}
          lifetime={credits?.lifetime || 0}
        />
        
        {/* Tab navigation */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTabIndex === index && styles.selectedTab
              ]}
              onPress={() => handleTabSelect(index)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  selectedTabIndex === index && styles.selectedTabText
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Tab content */}
        <View style={styles.tabContent}>
          {selectedTabIndex === 0 && (
            <CollectionHistoryList 
              collections={pickups || []}
              onItemPress={(id) => console.log('Collection pressed:', id)}
            />
          )}
          
          {selectedTabIndex === 1 && (
            <ImpactMetrics
              plasticWeight={impact.plasticWeight}
              co2Saved={impact.co2Saved}
              waterSaved={impact.waterSaved}
              energySaved={impact.energySaved}
            />
          )}
          
          {selectedTabIndex === 2 && (
            <View style={styles.achievementsContainer}>
              {achievements.map(achievement => (
                <Achievement
                  key={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                  earnedDate={achievement.earnedDate}
                  progress={achievement.progress}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTabText: {
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 20,
  },
  achievementsContainer: {
    gap: 12,
  }
}); 