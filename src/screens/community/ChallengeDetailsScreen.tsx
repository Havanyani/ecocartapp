import LeaderboardRow from '@/components/community/LeaderboardRow';
import EmptyState from '@/components/shared/EmptyState';
import ProgressBar from '@/components/ui/ProgressBar';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useAuth } from '@/providers/AuthProvider';
import { ChallengeService } from '@/services/ChallengeService';
import { SocialSharingService } from '@/services/SocialSharingService';
import {
    Challenge,
    ChallengeLeaderboard,
    ChallengeParticipation,
    ChallengeStatus
} from '@/types/Challenge';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { differenceInDays, format } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type ChallengeDetailsRouteProp = RouteProp<
  { ChallengeDetails: { challengeId: string } },
  'ChallengeDetails'
>;

enum DetailsTab {
  OVERVIEW = 'Overview',
  LEADERBOARD = 'Leaderboard',
  RULES = 'Rules & Rewards',
}

export default function ChallengeDetailsScreen() {
  const route = useRoute<ChallengeDetailsRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { challengeId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participation, setParticipation] = useState<ChallengeParticipation | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboard | null>(null);
  const [activeTab, setActiveTab] = useState<DetailsTab>(DetailsTab.OVERVIEW);
  const [isJoining, setIsJoining] = useState(false);
  
  const loadChallenge = useCallback(async (refresh: boolean = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else if (!isRefreshing) {
      setIsLoading(true);
    }
    
    try {
      const fetchedChallenge = await ChallengeService.getChallenge(challengeId);
      
      if (fetchedChallenge) {
        setChallenge(fetchedChallenge);
        
        if (user) {
          const userParticipation = await ChallengeService.getUserChallengeParticipation(
            user.id,
            challengeId
          );
          setParticipation(userParticipation);
          
          const challengeLeaderboard = await ChallengeService.getChallengeLeaderboard(
            challengeId,
            user.id
          );
          setLeaderboard(challengeLeaderboard);
        }
      }
    } catch (error) {
      console.error('Error loading challenge details:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [challengeId, user]);
  
  useEffect(() => {
    loadChallenge();
    
    // Set up navigation options
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
          disabled={isLoading || !challenge}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [loadChallenge, navigation]);
  
  const handleRefresh = () => {
    loadChallenge(true);
  };
  
  const handleShare = async () => {
    if (!challenge) return;
    
    try {
      await SocialSharingService.shareChallenge(challenge);
    } catch (error) {
      console.error('Error sharing challenge:', error);
    }
  };
  
  const handleJoinChallenge = async () => {
    if (!user || !challenge) return;
    
    setIsJoining(true);
    
    try {
      const result = await ChallengeService.joinChallenge(challengeId, user.id);
      setParticipation(result);
      
      // Refresh challenge data to update participant count
      loadChallenge();
      
      Alert.alert(
        'Joined Challenge',
        `You have successfully joined the "${challenge.title}" challenge!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert(
        'Error',
        'Failed to join the challenge. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveChallenge = async () => {
    if (!user || !challenge) return;
    
    Alert.alert(
      'Leave Challenge',
      `Are you sure you want to leave the "${challenge.title}" challenge? Your progress will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsJoining(true);
            
            try {
              const result = await ChallengeService.leaveChallenge(challengeId, user.id);
              
              if (result) {
                setParticipation(null);
                
                // Refresh challenge data to update participant count
                loadChallenge();
                
                Alert.alert(
                  'Left Challenge',
                  `You have left the "${challenge.title}" challenge.`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error leaving challenge:', error);
              Alert.alert(
                'Error',
                'Failed to leave the challenge. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsJoining(false);
            }
          },
        },
      ]
    );
  };
  
  const renderActionButton = () => {
    if (!challenge || !user) return null;
    
    // If already participating
    if (participation) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.leaveButton]}
          onPress={handleLeaveChallenge}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="exit-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Leave Challenge</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }
    
    // If challenge is completed or user is not participating
    if (challenge.status === ChallengeStatus.COMPLETED) {
      return (
        <View style={[styles.actionButton, styles.disabledButton]}>
          <Text style={styles.actionButtonText}>Challenge Ended</Text>
        </View>
      );
    }
    
    // If challenge is upcoming or active
    return (
      <TouchableOpacity
        style={[styles.actionButton, styles.joinButton]}
        onPress={handleJoinChallenge}
        disabled={isJoining}
      >
        {isJoining ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Join Challenge</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };
  
  const getTimeRemaining = () => {
    if (!challenge) return '';
    
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    const startDate = new Date(challenge.startDate);
    
    if (challenge.status === ChallengeStatus.UPCOMING) {
      const daysToStart = differenceInDays(startDate, now);
      return `Starts in ${daysToStart} ${daysToStart === 1 ? 'day' : 'days'}`;
    } else if (challenge.status === ChallengeStatus.ACTIVE) {
      const daysRemaining = differenceInDays(endDate, now);
      return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
    } else {
      return 'Challenge ended';
    }
  };
  
  const renderOverviewTab = () => {
    if (!challenge) return null;
    
    const progress = Math.min(1, challenge.currentProgress / challenge.goalTarget);
    const participationProgress = participation 
      ? Math.min(1, participation.currentProgress / challenge.goalTarget)
      : 0;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Challenge Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall</Text>
              <Text style={styles.progressValue}>
                {Math.round(progress * 100)}% Complete
              </Text>
            </View>
            <ProgressBar progress={progress} />
            <Text style={styles.progressDetail}>
              {`${challenge.currentProgress} / ${challenge.goalTarget} ${challenge.goalType.toLowerCase()}`}
            </Text>
          </View>
          
          {participation && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressValue}>
                  {Math.round(participationProgress * 100)}% Complete
                </Text>
              </View>
              <ProgressBar progress={participationProgress} progressColor="#FFA500" />
              <Text style={styles.progressDetail}>
                {`${participation.currentProgress} / ${challenge.goalTarget} ${challenge.goalType.toLowerCase()}`}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={24} color="#34C759" />
              <Text style={styles.statValue}>{challenge.participants}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#FF9500" />
              <Text style={styles.statValue}>{getTimeRemaining()}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            
            {participation && participation.completed ? (
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#34C759" />
                <Text style={styles.statValue}>Completed!</Text>
                <Text style={styles.statLabel}>Your Status</Text>
              </View>
            ) : (
              <View style={styles.statItem}>
                <Ionicons name="trending-up-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>
                  {participation ? Math.round(participationProgress * 100) + '%' : 'Not Joined'}
                </Text>
                <Text style={styles.statLabel}>Your Progress</Text>
              </View>
            )}
          </View>
        </View>
        
        {leaderboard && leaderboard.entries.length > 0 && (
          <View style={styles.topPerformersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Performers</Text>
              <TouchableOpacity 
                onPress={() => setActiveTab(DetailsTab.LEADERBOARD)}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.topPerformersList}>
              {leaderboard.entries.slice(0, 3).map((entry) => (
                <LeaderboardRow key={entry.userId} entry={entry} />
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };
  
  const renderLeaderboardTab = () => {
    if (!challenge) return null;
    
    if (!leaderboard || leaderboard.entries.length === 0) {
      return (
        <EmptyState
          icon="trophy-outline"
          title="No Participants Yet"
          message="Be the first to join this challenge and appear on the leaderboard!"
          actionLabel={participation ? undefined : "Join Challenge"}
          onAction={participation ? undefined : handleJoinChallenge}
        />
      );
    }
    
    return (
      <View style={styles.tabContent}>
        {user && leaderboard.userRank && (
          <View style={styles.userRankContainer}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <View style={styles.userRankBadge}>
              <Text style={styles.userRankText}>#{leaderboard.userRank}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardHeaderText}>Rank</Text>
          <Text style={[styles.leaderboardHeaderText, styles.leaderboardParticipantHeader]}>
            Participant
          </Text>
          <Text style={styles.leaderboardHeaderText}>Progress</Text>
        </View>
        
        {leaderboard.entries.map((entry) => (
          <LeaderboardRow 
            key={entry.userId} 
            entry={entry} 
            goalTarget={challenge.goalTarget}
            goalType={challenge.goalType}
          />
        ))}
      </View>
    );
  };
  
  const renderRulesTab = () => {
    if (!challenge) return null;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>Challenge Rules</Text>
          {challenge.rules && challenge.rules.length > 0 ? (
            <View style={styles.rulesList}>
              {challenge.rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" style={styles.ruleIcon} />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noContentText}>No specific rules for this challenge.</Text>
          )}
        </View>
        
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          {challenge.rewards ? (
            <View style={styles.rewardsContent}>
              {challenge.rewards.points && (
                <View style={styles.rewardItem}>
                  <Ionicons name="star" size={24} color="#FFC107" style={styles.rewardIcon} />
                  <View>
                    <Text style={styles.rewardValue}>{challenge.rewards.points} Points</Text>
                    <Text style={styles.rewardLabel}>Earn points upon completion</Text>
                  </View>
                </View>
              )}
              
              {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
                <View style={styles.rewardItem}>
                  <Ionicons name="ribbon" size={24} color="#5E35B1" style={styles.rewardIcon} />
                  <View>
                    <Text style={styles.rewardValue}>{challenge.rewards.badges.join(', ')}</Text>
                    <Text style={styles.rewardLabel}>Badges to display on your profile</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noContentText}>No rewards specified for this challenge.</Text>
          )}
        </View>
        
        <View style={styles.timeframeSection}>
          <Text style={styles.sectionTitle}>Timeframe</Text>
          <View style={styles.timeframeContent}>
            <View style={styles.timeframeItem}>
              <Ionicons name="calendar" size={24} color="#007AFF" style={styles.timeframeIcon} />
              <View>
                <Text style={styles.timeframeValue}>
                  {format(new Date(challenge.startDate), 'MMMM d, yyyy')}
                </Text>
                <Text style={styles.timeframeLabel}>Start Date</Text>
              </View>
            </View>
            
            <View style={styles.timeframeItem}>
              <Ionicons name="calendar" size={24} color="#FF3B30" style={styles.timeframeIcon} />
              <View>
                <Text style={styles.timeframeValue}>
                  {format(new Date(challenge.endDate), 'MMMM d, yyyy')}
                </Text>
                <Text style={styles.timeframeLabel}>End Date</Text>
              </View>
            </View>
            
            <View style={styles.timeframeItem}>
              <Ionicons name="hourglass" size={24} color="#5856D6" style={styles.timeframeIcon} />
              <View>
                <Text style={styles.timeframeValue}>
                  {differenceInDays(new Date(challenge.endDate), new Date(challenge.startDate))} Days
                </Text>
                <Text style={styles.timeframeLabel}>Duration</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
        </View>
      );
    }
    
    if (!challenge) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Challenge Not Found"
          message="The challenge you're looking for doesn't exist or has been removed."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      );
    }
    
    return (
      <>
        <View style={styles.header}>
          {challenge.imageUrl ? (
            <Image source={{ uri: challenge.imageUrl }} style={styles.headerImage} />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Ionicons name="trophy" size={60} color="#34C759" />
            </View>
          )}
          
          <View style={styles.headerOverlay}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{challenge.status}</Text>
            </View>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={styles.metaText}>
                  {format(new Date(challenge.startDate), 'MMM d')} - {format(new Date(challenge.endDate), 'MMM d, yyyy')}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="#fff" />
                <Text style={styles.metaText}>{challenge.participants} participants</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.tabContainer}>
          <SegmentedControl
            tabs={[DetailsTab.OVERVIEW, DetailsTab.LEADERBOARD, DetailsTab.RULES]}
            currentIndex={[DetailsTab.OVERVIEW, DetailsTab.LEADERBOARD, DetailsTab.RULES].indexOf(activeTab)}
            onChange={(index) => setActiveTab([DetailsTab.OVERVIEW, DetailsTab.LEADERBOARD, DetailsTab.RULES][index])}
          />
        </View>
        
        {activeTab === DetailsTab.OVERVIEW && renderOverviewTab()}
        {activeTab === DetailsTab.LEADERBOARD && renderLeaderboardTab()}
        {activeTab === DetailsTab.RULES && renderRulesTab()}
      </>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#34C759']}
            tintColor="#34C759"
          />
        }
      >
        {renderContent()}
      </ScrollView>
      
      {!isLoading && renderActionButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  header: {
    position: 'relative',
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDescription: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  shareButton: {
    marginRight: 16,
  },
  tabContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabContent: {
    padding: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  progressDetail: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    textAlign: 'right',
  },
  statsSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  topPerformersSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
  },
  topPerformersList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  userRankLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  userRankBadge: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  userRankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  leaderboardHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    width: 60,
  },
  leaderboardParticipantHeader: {
    flex: 1,
  },
  rulesSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rulesList: {
    marginTop: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  rewardsSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardsContent: {
    marginTop: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardIcon: {
    marginRight: 12,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#757575',
  },
  timeframeSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeframeContent: {
    marginTop: 8,
  },
  timeframeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeframeIcon: {
    marginRight: 12,
  },
  timeframeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  timeframeLabel: {
    fontSize: 12,
    color: '#757575',
  },
  noContentText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: '#34C759',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
}); 