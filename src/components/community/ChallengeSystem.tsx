import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import * as Progress from 'react-native-progress';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  reward: {
    credits: number;
    badge?: string;
  };
  deadline?: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ChallengeSectionProps {
  activeChallenges: Challenge[];
  achievements: Achievement[];
  onChallengeSelect: (challengeId: string) => void;
  onAchievementSelect: (achievementId: string) => void;
}

const RARITY_COLORS = {
  common: '#A0A0A0',
  rare: '#4169E1',
  epic: '#9932CC',
  legendary: '#FFD700'
};

export const ChallengeSystem: React.FC<ChallengeSectionProps> = ({
  activeChallenges,
  achievements,
  onChallengeSelect,
  onAchievementSelect
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'challenges' | 'achievements'>('challenges');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const animateTab = (toValue: number) => {
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    animateTab(selectedTab === 'challenges' ? 0 : 1);
  }, [selectedTab]);

  const getTypeStyle = (type: Challenge['type']) => {
    const styleMap: Record<Challenge['type'], any> = {
      daily: styles.typeDaily,
      weekly: styles.typeWeekly,
      monthly: styles.typeMonthly,
      special: styles.typeSpecial
    };
    return styleMap[type];
  };

  const renderChallenge = (challenge: Challenge) => (
    <HapticTab
      key={challenge.id}
      style={styles.challengeCard}
      onPress={() => onChallengeSelect(challenge.id)}
      accessibilityLabel={`${challenge.title} challenge: ${challenge.currentAmount} of ${challenge.targetAmount} complete`}
    >
      <View style={styles.challengeHeader}>
        <IconSymbol name={challenge.icon} size={24} color="#2e7d32" />
        <ThemedText style={styles.challengeTitle}>{challenge.title}</ThemedText>
        <View style={[styles.typeBadge, getTypeStyle(challenge.type)]}>
          <ThemedText style={styles.typeText}>
            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.challengeDescription}>
        {challenge.description}
      </ThemedText>

      <View style={styles.progressSection}>
        <Progress.Bar
          progress={challenge.currentAmount / challenge.targetAmount}
          width={null}
          color="#2e7d32"
          unfilledColor="#e9ecef"
          borderWidth={0}
          height={8}
        />
        <ThemedText style={styles.progressText}>
          {`${challenge.currentAmount}/${challenge.targetAmount}kg`}
        </ThemedText>
      </View>

      <View style={styles.rewardSection}>
        <ThemedText style={styles.rewardText}>
          Reward: {challenge.reward.credits} credits
          {challenge.reward.badge && ' + Special Badge'}
        </ThemedText>
        {challenge.deadline && (
          <ThemedText style={styles.deadlineText}>
            Ends: {new Date(challenge.deadline).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
    </HapticTab>
  );

  const renderAchievement = (achievement: Achievement) => (
    <HapticTab
      key={achievement.id}
      style={[
        styles.achievementCard,
        !achievement.unlockedAt && styles.lockedAchievement
      ]}
      onPress={() => onAchievementSelect(achievement.id)}
      accessibilityLabel={`${achievement.title} achievement, ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
    >
      <View style={[
        styles.achievementIcon,
        { borderColor: RARITY_COLORS[achievement.rarity] }
      ]}>
        <IconSymbol
          name={achievement.icon}
          size={32}
          color={achievement.unlockedAt ? RARITY_COLORS[achievement.rarity] : '#666'}
        />
      </View>
      
      <View style={styles.achievementInfo}>
        <ThemedText style={styles.achievementTitle}>
          {achievement.title}
        </ThemedText>
        <ThemedText style={styles.achievementDescription}>
          {achievement.description}
        </ThemedText>
        {achievement.unlockedAt && (
          <ThemedText style={styles.unlockDate}>
            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
          </ThemedText>
        )}
      </View>

      <View style={[
        styles.rarityBadge,
        { backgroundColor: RARITY_COLORS[achievement.rarity] }
      ]}>
        <ThemedText style={styles.rarityText}>
          {achievement.rarity.toUpperCase()}
        </ThemedText>
      </View>
    </HapticTab>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabContainer}>
        <HapticTab
          style={[
            styles.tabButton,
            selectedTab === 'challenges' && styles.selectedTab
          ]}
          onPress={() => setSelectedTab('challenges')}
        >
          <ThemedText style={styles.tabText}>Challenges</ThemedText>
        </HapticTab>
        <HapticTab
          style={[
            styles.tabButton,
            selectedTab === 'achievements' && styles.selectedTab
          ]}
          onPress={() => setSelectedTab('achievements')}
        >
          <ThemedText style={styles.tabText}>Achievements</ThemedText>
        </HapticTab>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -350]
              })
            }]
          }
        ]}
      >
        {selectedTab === 'challenges' ? (
          activeChallenges.map(renderChallenge)
        ) : (
          achievements.map(renderAchievement)
        )}
      </Animated.View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedTab: {
    backgroundColor: '#2e7d32',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeDaily: {
    backgroundColor: '#e3f2fd',
  },
  typeWeekly: {
    backgroundColor: '#e8f5e9',
  },
  typeMonthly: {
    backgroundColor: '#fff3e0',
  },
  typeSpecial: {
    backgroundColor: '#fce4ec',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeDescription: {
    marginBottom: 12,
    color: '#666',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  deadlineText: {
    fontSize: 12,
    color: '#666',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unlockDate: {
    fontSize: 10,
    color: '#666',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 