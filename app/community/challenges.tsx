import { ChallengeSystem } from '@/components/community/ChallengeSystem';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Community Challenges Screen
 * Displays active challenges, leaderboards, and gamification elements
 */
export default function ChallengesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'leaderboard'>('active');

  // Mock data for challenges
  const activeChallenges = [
    {
      id: '1',
      title: 'Plastic-Free Week',
      description: 'Avoid using single-use plastics for a week',
      icon: 'leaf-outline',
      targetAmount: 7,
      currentAmount: 4,
      reward: '50 EcoPoints',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'daily',
    },
    {
      id: '2',
      title: 'Community Cleanup',
      description: 'Participate in a local cleanup event',
      icon: 'people-outline',
      targetAmount: 1,
      currentAmount: 0,
      reward: '100 EcoPoints + Badge',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'event',
    },
    {
      id: '3',
      title: 'Recycling Champion',
      description: 'Recycle 10kg of materials this month',
      icon: 'refresh-outline',
      targetAmount: 10,
      currentAmount: 6.5,
      reward: '75 EcoPoints',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'monthly',
    },
  ];

  // Mock data for completed challenges
  const completedChallenges = [
    {
      id: '4',
      title: 'First Collection',
      description: 'Complete your first recycling collection',
      icon: 'checkmark-circle-outline',
      targetAmount: 1,
      currentAmount: 1,
      reward: '25 EcoPoints',
      deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'onboarding',
    },
    {
      id: '5',
      title: 'Invite Friends',
      description: 'Invite 3 friends to join EcoCart',
      icon: 'person-add-outline',
      targetAmount: 3,
      currentAmount: 3,
      reward: '50 EcoPoints',
      deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'social',
    },
  ];

  // Mock data for achievements
  const achievements = [
    {
      id: '1',
      title: 'Eco Warrior',
      description: 'Complete 10 environmental challenges',
      icon: 'trophy-outline',
      progress: 70,
      completed: false,
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Invite 5 friends to join the platform',
      icon: 'people-outline',
      progress: 100,
      completed: true,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Plastic Eliminator',
      description: 'Recycle 20kg of plastic',
      icon: 'trash-outline',
      progress: 85,
      completed: false,
    },
  ];

  // Mock data for leaderboard
  const leaderboardData = [
    { id: '1', name: 'Sarah Johnson', points: 1250, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: '2', name: 'Michael Chen', points: 980, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '3', name: 'Emma Wilson', points: 875, avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
    { id: '4', name: 'You', points: 720, avatar: 'https://randomuser.me/api/portraits/women/68.jpg', isCurrentUser: true },
    { id: '5', name: 'David Kim', points: 690, avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
    { id: '6', name: 'Lisa Garcia', points: 645, avatar: 'https://randomuser.me/api/portraits/women/26.jpg' },
    { id: '7', name: 'James Wilson', points: 590, avatar: 'https://randomuser.me/api/portraits/men/29.jpg' },
  ];

  const handleChallengeSelect = (challengeId: string) => {
    router.push(`/community/challenge/${challengeId}`);
  };

  const handleAchievementSelect = (achievementId: string) => {
    // Show achievement details
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Community Challenges
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/community/create-challenge')}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Points Display */}
      <View style={[styles.pointsContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.pointsContent}>
          <Text style={[styles.pointsLabel, { color: theme.colors.white }]}>Your EcoPoints</Text>
          <Text style={[styles.pointsValue, { color: theme.colors.white }]}>720</Text>
        </View>
        <TouchableOpacity 
          style={[styles.redeemButton, { backgroundColor: theme.colors.white }]}
          onPress={() => router.push('/community/rewards')}
        >
          <Text style={[styles.redeemButtonText, { color: theme.colors.primary }]}>Redeem</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['active', 'completed', 'leaderboard'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab as 'active' | 'completed' | 'leaderboard')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.colors.primary : theme.colors.textSecondary }
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'active' && (
          <View style={styles.challengesSection}>
            <ChallengeSystem 
              activeChallenges={activeChallenges}
              achievements={achievements}
              onChallengeSelect={handleChallengeSelect}
              onAchievementSelect={handleAchievementSelect}
            />
            
            <View style={[styles.inviteCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.inviteTitle, { color: theme.colors.text }]}>
                Invite Friends to Challenges
              </Text>
              <Text style={[styles.inviteDescription, { color: theme.colors.textSecondary }]}>
                Earn bonus points when friends join your challenges
              </Text>
              <TouchableOpacity 
                style={[styles.inviteButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/profile/invite')}
              >
                <Ionicons name="share-social-outline" size={18} color={theme.colors.white} />
                <Text style={[styles.inviteButtonText, { color: theme.colors.white }]}>
                  Invite Friends
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {activeTab === 'completed' && (
          <View style={styles.completedSection}>
            <ChallengeSystem 
              activeChallenges={completedChallenges}
              achievements={achievements}
              onChallengeSelect={handleChallengeSelect}
              onAchievementSelect={handleAchievementSelect}
            />
            
            <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                Your Challenge Stats
              </Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.primary }]}>7</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Completed
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>85%</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Success Rate
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.info }]}>350</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Points Earned
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardSection}>
            <View style={[styles.leaderboardHeader, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.leaderboardTitle, { color: theme.colors.text }]}>
                This Month's Top Recyclers
              </Text>
              <Text style={[styles.leaderboardSubtitle, { color: theme.colors.textSecondary }]}>
                Compete with friends and your community
              </Text>
            </View>
            
            {leaderboardData.map((user, index) => (
              <View 
                key={user.id} 
                style={[
                  styles.leaderboardItem, 
                  { backgroundColor: user.isCurrentUser ? `${theme.colors.primary}20` : theme.colors.card },
                  index === 0 && styles.firstPlace,
                  index === 1 && styles.secondPlace,
                  index === 2 && styles.thirdPlace,
                ]}
              >
                <View style={styles.leaderboardRank}>
                  <Text 
                    style={[
                      styles.rankNumber, 
                      { 
                        color: index < 3 ? theme.colors.white : theme.colors.text,
                        backgroundColor: index < 3 
                          ? [theme.colors.warning, theme.colors.info, '#CD7F32'][index] 
                          : 'transparent'
                      }
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    {/* Replace with actual Image component when available */}
                    <View 
                      style={[
                        styles.avatarPlaceholder, 
                        { backgroundColor: `${theme.colors.primary}50` }
                      ]} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.userName, 
                      { 
                        color: user.isCurrentUser ? theme.colors.primary : theme.colors.text,
                        fontWeight: user.isCurrentUser ? '700' : '500'
                      }
                    ]}
                  >
                    {user.name}
                  </Text>
                </View>
                
                <Text style={[styles.userPoints, { color: theme.colors.primary }]}>
                  {user.points} pts
                </Text>
              </View>
            ))}
            
            <TouchableOpacity 
              style={[styles.viewAllButton, { borderColor: theme.colors.border }]}
              onPress={() => router.push('/community/leaderboard')}
            >
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View Full Leaderboard
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  pointsContent: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  redeemButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  challengesSection: {
    paddingBottom: 20,
  },
  completedSection: {
    paddingBottom: 20,
  },
  leaderboardSection: {
    paddingBottom: 20,
  },
  inviteCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  inviteDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inviteButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  leaderboardHeader: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  leaderboardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  firstPlace: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  secondPlace: {},
  thirdPlace: {},
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userName: {
    fontSize: 16,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 