import { useTheme } from '@/hooks/useTheme';
import { CommunityChallenge, LeaderboardEntry, RewardType } from '@/types/gamification';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock challenges data - in production, would come from GamificationService
const MOCK_CHALLENGES: CommunityChallenge[] = [
  {
    id: '1',
    title: 'Plastic Free July',
    description: 'Reduce your plastic waste and help clean our planet! Recycle as much plastic as possible during July.',
    startDate: '2023-07-01T00:00:00Z',
    endDate: '2023-07-31T23:59:59Z',
    requirementType: 'plastic_recycled',
    requirementValue: 15,
    reward: {
      id: 'r1',
      type: RewardType.BADGE,
      value: 'plastic_hero',
      title: 'Plastic Hero Badge'
    },
    participants: 348,
    imageUrl: 'https://images.unsplash.com/photo-1591892150204-2d48a89da223?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    status: 'active'
  },
  {
    id: '2',
    title: 'Paper Recycling Drive',
    description: 'Join our community paper recycling drive! Every piece of paper counts toward saving trees.',
    startDate: '2023-06-15T00:00:00Z',
    endDate: '2023-08-15T23:59:59Z',
    requirementType: 'paper_recycled',
    requirementValue: 10,
    reward: {
      id: 'r2',
      type: RewardType.POINTS,
      value: 200,
      title: '200 Points'
    },
    participants: 256,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    status: 'active'
  },
  {
    id: '3',
    title: 'Electronics Recycling Month',
    description: 'Safely dispose of old electronics during our E-Waste recycling challenge.',
    startDate: '2023-08-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    requirementType: 'electronics_recycled',
    requirementValue: 5,
    reward: {
      id: 'r3',
      type: RewardType.BADGE,
      value: 'e_waste_champion',
      title: 'E-Waste Champion Badge'
    },
    participants: 124,
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-695933544bb7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    status: 'upcoming'
  }
];

// Mock leaderboard data for specific challenges
const MOCK_CHALLENGE_LEADERBOARD: Record<string, LeaderboardEntry[]> = {
  '1': [
    { 
      userId: '1', 
      username: 'Sarah Johnson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      value: 12.5,
      rank: 1,
      unit: 'kg'
    },
    { 
      userId: '2', 
      username: 'David Chen', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      value: 10.8,
      rank: 2,
      unit: 'kg'
    },
    { 
      userId: '3', 
      username: 'Emma Williams', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      value: 9.6,
      rank: 3,
      unit: 'kg'
    },
    { 
      userId: '4', 
      username: 'James Smith', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      value: 8.2,
      rank: 4,
      unit: 'kg'
    }
  ],
  '2': [
    { 
      userId: '5', 
      username: 'Olivia Brown', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      value: 8.6,
      rank: 1,
      unit: 'kg'
    },
    { 
      userId: '2', 
      username: 'David Chen', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      value: 7.2,
      rank: 2,
      unit: 'kg'
    },
    { 
      userId: '4', 
      username: 'James Smith', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      value: 5.5,
      rank: 3,
      unit: 'kg'
    }
  ]
};

// Helper function to format date
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  }).format(date);
}

// Helper to determine if a challenge is active, upcoming, or completed
function getChallengeStatusInfo(challenge: CommunityChallenge) {
  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  
  let status = 'unknown';
  let statusText = '';
  let statusColor = '';
  
  if (now < startDate) {
    status = 'upcoming';
    statusText = `Starts in ${Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`;
    statusColor = '#FFA000'; // Amber
  } else if (now > endDate) {
    status = 'completed';
    statusText = 'Completed';
    statusColor = '#4CAF50'; // Green
  } else {
    status = 'active';
    statusText = `${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days left`;
    statusColor = '#2196F3'; // Blue
  }
  
  return { status, statusText, statusColor };
}

// Helper to get the user's progress in a challenge
function getUserProgress(challengeId: string) {
  // In a real app, we'd get this from the gamification service
  const mockUserProgress = {
    '1': { currentValue: 7.2, targetValue: 15, unit: 'kg' },
    '2': { currentValue: 3.5, targetValue: 10, unit: 'kg' },
    '3': { currentValue: 0, targetValue: 5, unit: 'items' }
  };
  
  return mockUserProgress[challengeId as keyof typeof mockUserProgress] || { currentValue: 0, targetValue: 0, unit: '' };
}

export default function ChallengeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  // Add a border color to the theme
  const themeWithBorder = {
    ...theme,
    colors: {
      ...theme.colors,
      border: theme.colors.secondary // Use secondary color as border
    }
  };
  const { id } = useLocalSearchParams();
  const [challenge, setChallenge] = useState<CommunityChallenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  
  useEffect(() => {
    const loadChallengeData = async () => {
      setIsLoading(true);
      // In a real app, we'd fetch this from an API
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const foundChallenge = MOCK_CHALLENGES.find(c => c.id === id);
      if (foundChallenge) {
        setChallenge(foundChallenge);
        
        // Get leaderboard data
        const leaderboardData = MOCK_CHALLENGE_LEADERBOARD[id as string] || [];
        setLeaderboard(leaderboardData);
        
        // Check if user has joined
        // In a real app, we'd check from the gamification service
        setIsJoined(id === '1' || id === '2');
      }
      
      setIsLoading(false);
    };
    
    if (id) {
      loadChallengeData();
    }
  }, [id]);
  
  // Get status info
  const statusInfo = challenge ? getChallengeStatusInfo(challenge) : { status: '', statusText: '', statusColor: '' };
  
  // Get user progress
  const userProgress = challenge ? getUserProgress(challenge.id) : { currentValue: 0, targetValue: 0, unit: '' };
  const progressPercentage = userProgress.targetValue > 0 
    ? Math.min(100, (userProgress.currentValue / userProgress.targetValue) * 100) 
    : 0;
  
  // Handle join challenge
  const handleJoinChallenge = () => {
    // In a real app, we'd call the gamification service to join the challenge
    setIsJoined(true);
  };
  
  // Render leaderboard item
  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === '4'; // In a real app, check against actual user ID
    
    return (
      <View style={[styles.leaderboardItem, { borderBottomColor: themeWithBorder.colors.border }]}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
        
        <Image 
          source={{ uri: item.profilePictureUrl }} 
          style={styles.avatarImage}
          defaultSource={require('@/assets/images/default-avatar.png')}
        />
        
        <View style={styles.leaderboardUserInfo}>
          <Text style={[styles.leaderboardUsername, { color: isCurrentUser ? theme.colors.primary : theme.colors.text }]}>
            {item.username}
            {isCurrentUser && <Text style={{ fontStyle: 'italic' }}> (You)</Text>}
          </Text>
        </View>
        
        <Text style={[styles.leaderboardValue, { color: theme.colors.text }]}>
          {typeof item.value === 'number' && item.value % 1 !== 0 
            ? item.value.toFixed(1) 
            : item.value}
          {item.unit && ` ${item.unit}`}
        </Text>
      </View>
    );
  };
  
  // Helper to get rank color
  function getRankColor(rank: number): string {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#718096'; // Gray
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading challenge...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Challenge</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.text + '40'} />
          <Text style={[styles.notFoundText, { color: theme.colors.text }]}>
            Challenge not found
          </Text>
          <TouchableOpacity 
            style={[styles.backToAllButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backToAllButtonText}>Back to Challenges</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Challenge Image with Header */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: challenge.imageUrl }} 
            style={styles.challengeImage}
            defaultSource={require('@/assets/images/placeholder.png')}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageForeground}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Challenge Info */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.challengeTitle, { color: theme.colors.text }]}>
              {challenge.title}
            </Text>
            
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusInfo.statusColor }]}>
                {statusInfo.statusText}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.challengeDescription, { color: theme.colors.text + 'CC' }]}>
            {challenge.description}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.statLabel, { color: theme.colors.text + '99' }]}>
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.statLabel, { color: theme.colors.text + '99' }]}>
                {challenge.participants} participants
              </Text>
            </View>
          </View>
          
          {/* Goal and Progress */}
          <View style={[styles.goalContainer, { backgroundColor: theme.colors.primary + '10' }]}>
            <View style={styles.goalHeader}>
              <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.goalTitle, { color: theme.colors.text }]}>Challenge Goal</Text>
            </View>
            
            <Text style={[styles.goalText, { color: theme.colors.text }]}>
              Recycle {challenge.requirementValue} {userProgress.unit} of {formatRequirementType(challenge.requirementType)}
            </Text>
            
            {isJoined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.colors.text + '99' }]}>
                    Your Progress
                  </Text>
                  <Text style={[styles.progressText, { color: theme.colors.text }]}>
                    {userProgress.currentValue}/{userProgress.targetValue} {userProgress.unit}
                  </Text>
                </View>
                
                <View style={[styles.progressBar, { backgroundColor: themeWithBorder.colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progressPercentage}%`,
                        backgroundColor: getProgressColor(progressPercentage)
                      }
                    ]}
                  />
                </View>
              </View>
            )}
            
            <View style={styles.rewardContainer}>
              <Text style={[styles.rewardLabel, { color: theme.colors.text + '99' }]}>
                Reward:
              </Text>
              <View style={styles.rewardBox}>
                {challenge.reward.type === RewardType.BADGE ? (
                  <Ionicons name="ribbon-outline" size={20} color={theme.colors.primary} />
                ) : (
                  <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
                )}
                <Text style={[styles.rewardText, { color: theme.colors.text }]}>
                  {challenge.reward.title}
                </Text>
              </View>
            </View>
            
            {!isJoined && statusInfo.status === 'active' && (
              <TouchableOpacity 
                style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleJoinChallenge}
              >
                <Text style={styles.joinButtonText}>Join Challenge</Text>
              </TouchableOpacity>
            )}
            
            {statusInfo.status === 'upcoming' && (
              <TouchableOpacity 
                style={[styles.joinButton, { backgroundColor: theme.colors.text + '40' }]}
                disabled
              >
                <Text style={[styles.joinButtonText, { color: 'white' }]}>
                  Coming Soon
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Leaderboard */}
          <View style={styles.leaderboardContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Leaderboard</Text>
              <TouchableOpacity onPress={() => console.log('View full leaderboard')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {leaderboard.length > 0 ? (
              leaderboard.map(item => renderLeaderboardItem({ item }))
            ) : (
              <View style={styles.emptyLeaderboard}>
                <Ionicons name="trophy-outline" size={48} color={theme.colors.text + '40'} />
                <Text style={[styles.emptyLeaderboardText, { color: theme.colors.text }]}>
                  No participants yet
                </Text>
                <Text style={[styles.emptyLeaderboardSubtext, { color: theme.colors.text + '99' }]}>
                  Be the first to join this challenge!
                </Text>
              </View>
            )}
          </View>
          
          {/* Tips and Information */}
          <View style={styles.tipsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tips & Info</Text>
            </View>
            
            <View style={[styles.tipCard, { backgroundColor: theme.colors.background, borderColor: themeWithBorder.colors.border }]}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.text }]}>
                {getTipsForChallengeType(challenge.requirementType)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper to format requirement type for display
function formatRequirementType(type: string): string {
  switch (type) {
    case 'plastic_recycled': return 'plastic';
    case 'paper_recycled': return 'paper';
    case 'electronics_recycled': return 'electronics';
    default: return type.replace('_', ' ');
  }
}

// Helper to get progress color based on percentage
function getProgressColor(percentage: number): string {
  if (percentage < 30) return '#F44336'; // Red
  if (percentage < 70) return '#FFA000'; // Amber
  return '#4CAF50'; // Green
}

// Helper to get tips based on challenge type
function getTipsForChallengeType(type: string): string {
  switch (type) {
    case 'plastic_recycled':
      return 'Rinse plastic containers before recycling. Remove caps and lids. Check for recycling symbols (1-7) to determine recyclability.';
    case 'paper_recycled':
      return 'Flatten cardboard boxes to save space. Remove staples, paper clips, and plastic windows from envelopes. Keep paper dry and clean.';
    case 'electronics_recycled':
      return 'Remove batteries before recycling electronics. Wipe personal data from devices. Check local regulations for proper e-waste disposal.';
    default:
      return 'Sort materials properly. Clean containers before recycling. Check local recycling guidelines for accepted materials.';
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24
  },
  backToAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backToAllButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative'
  },
  challengeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imageForeground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  contentContainer: {
    padding: 16
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  challengeDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8
  },
  statLabel: {
    fontSize: 14,
    marginLeft: 6
  },
  goalContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8
  },
  goalText: {
    fontSize: 16,
    marginBottom: 16
  },
  progressContainer: {
    marginBottom: 16
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  progressLabel: {
    fontSize: 14
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  rewardLabel: {
    fontSize: 14,
    marginRight: 8
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  },
  joinButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  leaderboardContainer: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500'
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  leaderboardUserInfo: {
    flex: 1
  },
  leaderboardUsername: {
    fontSize: 16,
    fontWeight: '500'
  },
  leaderboardValue: {
    fontSize: 16,
    fontWeight: '600'
  },
  emptyLeaderboard: {
    alignItems: 'center',
    padding: 24
  },
  emptyLeaderboardText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4
  },
  emptyLeaderboardSubtext: {
    fontSize: 14,
    textAlign: 'center'
  },
  tipsContainer: {
    marginBottom: 24
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20
  }
}); 