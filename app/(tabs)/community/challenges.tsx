import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define challenge type to avoid import issues
interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  requirementType: string;
  requirementValue: number;
  reward: {
    id: string;
    type: string;
    value: string | number;
    title: string;
  };
  participants: number;
  imageUrl: string;
  status: 'active' | 'upcoming' | 'completed';
}

// Mock challenges data - in production, would come from a service
const MOCK_CHALLENGES: Challenge[] = [
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
      type: 'badge',
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
      type: 'points',
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
      type: 'badge',
      value: 'e_waste_champion',
      title: 'E-Waste Champion Badge'
    },
    participants: 124,
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-695933544bb7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    status: 'upcoming'
  },
  {
    id: '4',
    title: 'Glass Collection Challenge',
    description: 'Help us collect and recycle glass bottles and containers. Every piece makes a difference!',
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-06-30T23:59:59Z',
    requirementType: 'glass_recycled',
    requirementValue: 8,
    reward: {
      id: 'r4',
      type: 'points',
      value: 150,
      title: '150 Points'
    },
    participants: 218,
    imageUrl: 'https://images.unsplash.com/photo-1550577380-2d661300830f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    status: 'completed'
  },
  {
    id: '5',
    title: 'World Environment Day',
    description: 'Special one-day challenge on World Environment Day. Complete recycling tasks and earn bonus rewards!',
    startDate: '2023-06-05T00:00:00Z',
    endDate: '2023-06-05T23:59:59Z',
    requirementType: 'recycling_tasks',
    requirementValue: 3,
    reward: {
      id: 'r5',
      type: 'badge',
      value: 'earth_guardian',
      title: 'Earth Guardian Badge'
    },
    participants: 412,
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    status: 'completed'
  }
];

// Filter categories
type ChallengeFilter = 'all' | 'active' | 'upcoming' | 'completed';

// Helper function to format date
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  }).format(date);
}

// Helper to get status info of a challenge
function getChallengeStatusInfo(challenge: Challenge) {
  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  
  let statusText = '';
  let statusColor = '';
  
  if (now < startDate) {
    statusText = `Starts in ${Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`;
    statusColor = '#FFA000'; // Amber
  } else if (now > endDate) {
    statusText = 'Completed';
    statusColor = '#4CAF50'; // Green
  } else {
    statusText = `${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days left`;
    statusColor = '#2196F3'; // Blue
  }
  
  return { statusText, statusColor };
}

export default function ChallengesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ChallengeFilter>('all');
  
  useEffect(() => {
    const loadChallenges = async () => {
      setIsLoading(true);
      // In a real app, we'd fetch this from an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChallenges(MOCK_CHALLENGES);
      setIsLoading(false);
    };
    
    loadChallenges();
  }, []);
  
  // Filter challenges
  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(challenge => challenge.status === filter);
  
  // Handle challenge press
  const handleChallengePress = (challenge: Challenge) => {
    router.push(`/community/challenge?id=${challenge.id}`);
  };
  
  // Render challenge item
  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    const statusInfo = getChallengeStatusInfo(item);
    
    return (
      <TouchableOpacity 
        style={[styles.challengeCard, { backgroundColor: theme.colors.background }]}
        onPress={() => handleChallengePress(item)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.challengeImage}
          defaultSource={require('@/assets/images/placeholder.png')}
        />
        
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.statusColor + '30' }]}>
          <Text style={[styles.statusText, { color: statusInfo.statusColor }]}>
            {statusInfo.statusText}
          </Text>
        </View>
        
        <View style={styles.challengeContent}>
          <Text style={[styles.challengeTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={[styles.challengeDescription, { color: theme.colors.text + '99' }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.challengeMeta}>
            <View style={styles.challengeMetaItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.challengeMetaText, { color: theme.colors.text + '99' }]}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
            
            <View style={styles.challengeMetaItem}>
              <Ionicons name="people-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.challengeMetaText, { color: theme.colors.text + '99' }]}>
                {item.participants} participants
              </Text>
            </View>
          </View>
          
          <View style={styles.challengeReward}>
            <Text style={[styles.rewardLabel, { color: theme.colors.text + '99' }]}>
              Reward:
            </Text>
            <View style={styles.rewardContent}>
              {item.reward.type === 'badge' ? (
                <Ionicons name="ribbon-outline" size={16} color={theme.colors.primary} />
              ) : (
                <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
              )}
              <Text style={[styles.rewardText, { color: theme.colors.text }]}>
                {item.reward.title}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Community Challenges
        </Text>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => console.log('Create challenge')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Filter tabs */}
      <View style={[styles.filterContainer, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && { 
              borderBottomWidth: 2,
              borderBottomColor: theme.colors.primary 
            }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: filter === 'all' ? theme.colors.primary : theme.colors.text + '99' }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'active' && { 
              borderBottomWidth: 2,
              borderBottomColor: theme.colors.primary 
            }
          ]}
          onPress={() => setFilter('active')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: filter === 'active' ? theme.colors.primary : theme.colors.text + '99' }
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'upcoming' && { 
              borderBottomWidth: 2,
              borderBottomColor: theme.colors.primary 
            }
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: filter === 'upcoming' ? theme.colors.primary : theme.colors.text + '99' }
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && { 
              borderBottomWidth: 2,
              borderBottomColor: theme.colors.primary 
            }
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text 
            style={[
              styles.filterText, 
              { color: filter === 'completed' ? theme.colors.primary : theme.colors.text + '99' }
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading challenges...
          </Text>
        </View>
      ) : (
        <>
          {filteredChallenges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="flag-outline" size={64} color={theme.colors.text + '30'} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No {filter !== 'all' ? filter : ''} challenges found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text + '99' }]}>
                {filter !== 'all' 
                  ? `Try selecting a different filter` 
                  : `Check back later for new challenges!`}
              </Text>
              {filter !== 'all' && (
                <TouchableOpacity
                  style={[styles.showAllButton, { borderColor: theme.colors.primary }]}
                  onPress={() => setFilter('all')}
                >
                  <Text style={[styles.showAllText, { color: theme.colors.primary }]}>
                    Show All Challenges
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredChallenges}
              renderItem={renderChallengeItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.challengesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500'
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24
  },
  showAllButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1
  },
  showAllText: {
    fontWeight: '500'
  },
  challengesList: {
    padding: 16,
    paddingTop: 0
  },
  challengeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  challengeImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover'
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  challengeContent: {
    padding: 16
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  challengeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4
  },
  challengeMetaText: {
    fontSize: 12,
    marginLeft: 4
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rewardLabel: {
    fontSize: 12,
    marginRight: 4
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  }
}); 