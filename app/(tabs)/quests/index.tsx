import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import QuestService from '@/services/QuestService';
import { Quest, QuestDifficultyEnum, QuestStatusEnum, QuestTypeEnum } from '@/types/gamification';

// Interface for the section data for FlatList
interface QuestSectionData {
  title: string;
  data: Quest[];
  type: QuestTypeEnum;
}

export default function QuestScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [questData, setQuestData] = useState<{ daily: Quest[], weekly: Quest[], special: Quest[] }>({
    daily: [],
    weekly: [],
    special: []
  });
  
  // Initialize the quest service and load quests
  useEffect(() => {
    const initializeQuests = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, we'd initialize with the actual user ID
        const questService = QuestService.getInstance();
        await questService.initialize('current_user');
        
        const quests = questService.getActiveQuests();
        setQuestData(quests);
      } catch (error) {
        console.error('Failed to load quests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeQuests();
  }, []);
  
  // Function to handle quest press
  const handleQuestPress = (quest: Quest) => {
    if (quest.status === QuestStatusEnum.COMPLETED) {
      claimQuestReward(quest.id);
    } else {
      // Show quest details
      console.log('Quest details:', quest.id);
    }
  };
  
  // Function to claim quest rewards
  const claimQuestReward = async (questId: string) => {
    try {
      const questService = QuestService.getInstance();
      const reward = await questService.claimQuestReward(questId);
      
      if (reward) {
        // Update local data
        setQuestData(prevData => {
          const newData = { ...prevData };
          
          // Find and update the quest in the appropriate section
          for (const section of ['daily', 'weekly', 'special'] as const) {
            const questIndex = newData[section].findIndex(q => q.id === questId);
            if (questIndex !== -1) {
              newData[section][questIndex].status = QuestStatusEnum.CLAIMED;
              break;
            }
          }
          
          return newData;
        });
        
        // Show success message or animation
        console.log('Claimed reward:', reward);
      }
    } catch (error) {
      console.error('Failed to claim quest reward:', error);
    }
  };
  
  // Function to refresh quests
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Reinitialize quest service
      const questService = QuestService.getInstance();
      await questService.initialize('current_user');
      
      const quests = questService.getActiveQuests();
      setQuestData(quests);
    } catch (error) {
      console.error('Failed to refresh quests:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Function to get color for quest difficulty
  const getDifficultyColor = (difficulty: QuestDifficultyEnum) => {
    switch (difficulty) {
      case QuestDifficultyEnum.EASY:
        return '#4CAF50'; // Green
      case QuestDifficultyEnum.MEDIUM:
        return '#FF9800'; // Orange
      case QuestDifficultyEnum.HARD:
        return '#F44336'; // Red
      default:
        return theme.colors.primary;
    }
  };
  
  // Function to get status text color
  const getStatusColor = (status: QuestStatusEnum) => {
    switch (status) {
      case QuestStatusEnum.LOCKED:
        return theme.colors.textDim;
      case QuestStatusEnum.IN_PROGRESS:
        return theme.colors.primary;
      case QuestStatusEnum.COMPLETED:
        return '#4CAF50'; // Green
      case QuestStatusEnum.CLAIMED:
        return theme.colors.textDim;
      case QuestStatusEnum.EXPIRED:
        return '#F44336'; // Red
      default:
        return theme.colors.text;
    }
  };
  
  // Function to get quest status text
  const getStatusText = (status: QuestStatusEnum) => {
    switch (status) {
      case QuestStatusEnum.LOCKED:
        return 'Locked';
      case QuestStatusEnum.IN_PROGRESS:
        return 'In Progress';
      case QuestStatusEnum.COMPLETED:
        return 'Claim Reward';
      case QuestStatusEnum.CLAIMED:
        return 'Completed';
      case QuestStatusEnum.EXPIRED:
        return 'Expired';
      default:
        return '';
    }
  };
  
  // Function to get icon for quest status
  const getStatusIcon = (status: QuestStatusEnum) => {
    switch (status) {
      case QuestStatusEnum.LOCKED:
        return 'lock-closed';
      case QuestStatusEnum.IN_PROGRESS:
        return 'time';
      case QuestStatusEnum.COMPLETED:
        return 'gift';
      case QuestStatusEnum.CLAIMED:
        return 'checkmark-circle';
      case QuestStatusEnum.EXPIRED:
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };
  
  // Function to render a quest item
  const renderQuestItem = ({ item }: { item: Quest }) => {
    const isCompleted = item.status === QuestStatusEnum.COMPLETED;
    const isClaimed = item.status === QuestStatusEnum.CLAIMED;
    const isLocked = item.status === QuestStatusEnum.LOCKED;
    const isExpired = item.status === QuestStatusEnum.EXPIRED;
    
    return (
      <TouchableOpacity
        style={[
          styles.questCard,
          {
            backgroundColor: theme.colors.card,
            opacity: isLocked || isExpired ? 0.7 : 1,
          }
        ]}
        onPress={() => handleQuestPress(item)}
        disabled={isLocked || isClaimed || isExpired}
      >
        <View style={styles.questHeader}>
          <View style={styles.questIconContainer}>
            <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
            <View 
              style={[
                styles.difficultyIndicator, 
                { backgroundColor: getDifficultyColor(item.difficulty) }
              ]} 
            />
          </View>
          
          <View style={styles.questTitleContainer}>
            <Text style={[styles.questTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.questCategory, { color: theme.colors.textDim }]}>
              {item.category}
            </Text>
          </View>
          
          <View style={styles.questStatusContainer}>
            <Ionicons 
              name={getStatusIcon(item.status)} 
              size={16} 
              color={getStatusColor(item.status)} 
            />
            <Text 
              style={[
                styles.questStatusText, 
                { color: getStatusColor(item.status) }
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.questDescription, { color: theme.colors.text }]}>
          {item.description}
        </Text>
        
        {!isClaimed && !isLocked && !isExpired && (
          <View style={styles.progressContainer}>
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
                    width: `${item.progress}%`,
                    backgroundColor: isCompleted ? '#4CAF50' : theme.colors.primary
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textDim }]}>
              {item.currentValue} / {item.targetValue}
            </Text>
          </View>
        )}
        
        <View style={styles.questFooter}>
          <View style={styles.rewardContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.rewardText, { color: theme.colors.text }]}>
              {item.reward.title}
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textDim} />
            <Text style={[styles.timeText, { color: theme.colors.textDim }]}>
              {new Date(item.expiresAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Function to render a section header
  const renderSectionHeader = ({ title, type }: { title: string, type: QuestTypeEnum }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        
        <TouchableOpacity style={styles.sectionViewAll}>
          <Text style={[styles.sectionViewAllText, { color: theme.colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Prepare sections for display
  const sections: QuestSectionData[] = [
    { title: 'Daily Quests', data: questData.daily, type: QuestTypeEnum.DAILY },
    { title: 'Weekly Quests', data: questData.weekly, type: QuestTypeEnum.WEEKLY },
    { title: 'Special Quests', data: questData.special, type: QuestTypeEnum.SPECIAL }
  ];
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading Quests...
        </Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <Stack.Screen 
        options={{
          headerTitle: 'Quests & Missions',
          headerTitleStyle: { color: theme.colors.text },
          headerStyle: { backgroundColor: theme.colors.background },
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Hero section with streak info */}
        <LinearGradient
          colors={['#7F00FF', '#E100FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroContainer}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Daily Streak</Text>
              <Text style={styles.heroSubtitle}>Keep completing quests daily for bonus rewards!</Text>
            </View>
            
            <View style={styles.streakContainer}>
              <Text style={styles.streakCount}>7</Text>
              <Text style={styles.streakLabel}>DAYS</Text>
            </View>
          </View>
        </LinearGradient>
        
        {/* Each quest section */}
        {sections.map((section) => (
          <View key={section.type} style={styles.section}>
            {renderSectionHeader({ title: section.title, type: section.type })}
            
            {section.data.length > 0 ? (
              section.data.map((quest) => (
                <View key={quest.id}>
                  {renderQuestItem({ item: quest })}
                </View>
              ))
            ) : (
              <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.textDim} />
                <Text style={[styles.emptyText, { color: theme.colors.textDim }]}>
                  No {section.title.toLowerCase()} available
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionViewAll: {
    padding: 4,
  },
  sectionViewAllText: {
    fontSize: 14,
  },
  questCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  difficultyIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: 'white',
  },
  questTitleContainer: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  questCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  questStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questStatusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  questDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
}); 