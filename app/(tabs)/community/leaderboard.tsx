import { useTheme } from '@/hooks/useTheme';
import { LeaderboardEntry } from '@/types/gamification';
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

// Mock leaderboard data - in production, would come from GamificationService
const MOCK_LEADERBOARD_DATA: {
  [key: string]: LeaderboardEntry[]
} = {
  'points': [
    { 
      userId: '1', 
      displayName: 'Sarah Johnson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      value: 2850,
      rank: 1
    },
    { 
      userId: '2', 
      displayName: 'David Chen', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      value: 2710,
      rank: 2
    },
    { 
      userId: '3', 
      displayName: 'Emma Williams', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      value: 2545,
      rank: 3
    },
    { 
      userId: '4', 
      displayName: 'James Smith', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      value: 2330,
      rank: 4
    },
    { 
      userId: '5', 
      displayName: 'Olivia Brown', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      value: 2180,
      rank: 5
    },
    { 
      userId: '6', 
      displayName: 'Michael Davis', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
      value: 2050,
      rank: 6
    },
    { 
      userId: '7', 
      displayName: 'Sophia Martinez', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
      value: 1920,
      rank: 7
    },
    { 
      userId: '8', 
      displayName: 'Daniel Wilson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      value: 1790,
      rank: 8
    }
  ],
  'recycled': [
    { 
      userId: '3', 
      displayName: 'Emma Williams', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      value: 342.5,
      rank: 1,
      unit: 'kg'
    },
    { 
      userId: '1', 
      displayName: 'Sarah Johnson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      value: 315.8,
      rank: 2,
      unit: 'kg'
    },
    { 
      userId: '5', 
      displayName: 'Olivia Brown', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      value: 287.2,
      rank: 3,
      unit: 'kg'
    },
    { 
      userId: '2', 
      displayName: 'David Chen', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      value: 264.9,
      rank: 4,
      unit: 'kg'
    },
    { 
      userId: '7', 
      displayName: 'Sophia Martinez', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
      value: 241.3,
      rank: 5,
      unit: 'kg'
    },
    { 
      userId: '4', 
      displayName: 'James Smith', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      value: 210.5,
      rank: 6,
      unit: 'kg'
    },
    { 
      userId: '6', 
      displayName: 'Michael Davis', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
      value: 185.7,
      rank: 7,
      unit: 'kg'
    },
    { 
      userId: '8', 
      displayName: 'Daniel Wilson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      value: 160.2,
      rank: 8,
      unit: 'kg'
    }
  ],
  'challenges': [
    { 
      userId: '5', 
      displayName: 'Olivia Brown', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      value: 18,
      rank: 1
    },
    { 
      userId: '2', 
      displayName: 'David Chen', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      value: 16,
      rank: 2
    },
    { 
      userId: '1', 
      displayName: 'Sarah Johnson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      value: 14,
      rank: 3
    },
    { 
      userId: '4', 
      displayName: 'James Smith', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      value: 12,
      rank: 4
    },
    { 
      userId: '7', 
      displayName: 'Sophia Martinez', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
      value: 11,
      rank: 5
    },
    { 
      userId: '3', 
      displayName: 'Emma Williams', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      value: 9,
      rank: 6
    },
    { 
      userId: '6', 
      displayName: 'Michael Davis', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
      value: 7,
      rank: 7
    },
    { 
      userId: '8', 
      displayName: 'Daniel Wilson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      value: 5,
      rank: 8
    }
  ],
  'streak': [
    { 
      userId: '1', 
      displayName: 'Sarah Johnson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      value: 68,
      rank: 1,
      unit: 'days'
    },
    { 
      userId: '4', 
      displayName: 'James Smith', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      value: 52,
      rank: 2,
      unit: 'days'
    },
    { 
      userId: '3', 
      displayName: 'Emma Williams', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      value: 45,
      rank: 3,
      unit: 'days'
    },
    { 
      userId: '7', 
      displayName: 'Sophia Martinez', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
      value: 39,
      rank: 4,
      unit: 'days'
    },
    { 
      userId: '2', 
      displayName: 'David Chen', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      value: 33,
      rank: 5,
      unit: 'days'
    },
    { 
      userId: '5', 
      displayName: 'Olivia Brown', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      value: 28,
      rank: 6,
      unit: 'days'
    },
    { 
      userId: '6', 
      displayName: 'Michael Davis', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
      value: 24,
      rank: 7,
      unit: 'days'
    },
    { 
      userId: '8', 
      displayName: 'Daniel Wilson', 
      profilePictureUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      value: 20,
      rank: 8,
      unit: 'days'
    }
  ]
};

// Leaderboard categories
const LEADERBOARD_CATEGORIES = [
  { id: 'points', label: 'Points', icon: 'star' },
  { id: 'recycled', label: 'Recycled', icon: 'leaf' },
  { id: 'challenges', label: 'Challenges', icon: 'trophy' },
  { id: 'streak', label: 'Streak', icon: 'flame' }
];

interface RankBadgeProps {
  rank: number;
}

function RankBadge({ rank }: RankBadgeProps) {
  // Color based on rank (gold, silver, bronze)
  const getBadgeColor = () => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#718096'; // Gray for other ranks
    }
  };
  
  // Icon based on rank
  const getBadgeIcon = () => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'trophy';
      case 3: return 'trophy';
      default: return 'ellipse';
    }
  };
  
  return (
    <View style={[styles.rankBadge, { backgroundColor: getBadgeColor() }]}>
      {rank <= 3 ? (
        <Ionicons name={getBadgeIcon() as any} size={12} color="white" />
      ) : (
        <Text style={styles.rankText}>{rank}</Text>
      )}
    </View>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('points');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  
  // In a real app, we'd fetch data from the server or GamificationService
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLeaderboardData(MOCK_LEADERBOARD_DATA[selectedCategory] || []);
      
      // Mock currently logged-in user's rank (in a real app, this would come from the auth service)
      // For demo, let's say the current user is 'James Smith' (userId: '4')
      const currentUserRank = MOCK_LEADERBOARD_DATA[selectedCategory]?.find(entry => entry.userId === '4') || null;
      setUserRank(currentUserRank);
      
      setIsLoading(false);
    };
    
    loadLeaderboard();
  }, [selectedCategory]);
  
  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === '4'; // In a real app, check against actual user ID
    
    return (
      <View 
        style={[
          styles.leaderboardItem, 
          {
            backgroundColor: isCurrentUser ? theme.colors.primary + '15' : theme.colors.background,
            borderBottomColor: theme.colors.border
          }
        ]}
      >
        <RankBadge rank={item.rank} />
        
        <Image 
          source={{ uri: item.profilePictureUrl }} 
          style={styles.userAvatar}
          defaultSource={require('@/assets/images/default-avatar.png')}
        />
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isCurrentUser ? theme.colors.primary : theme.colors.text }]}>
            {item.displayName}
            {isCurrentUser && <Text style={{ fontStyle: 'italic' }}> (You)</Text>}
          </Text>
        </View>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: theme.colors.text }]}>
            {typeof item.value === 'number' && item.value % 1 !== 0 
              ? item.value.toFixed(1) 
              : item.value}
            {item.unit ? ` ${item.unit}` : ''}
          </Text>
          <Text style={[styles.valueLabel, { color: theme.colors.text + '99' }]}>
            {LEADERBOARD_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Points'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Leaderboard
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Category Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.colors.border }]}>
        {LEADERBOARD_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              selectedCategory === category.id && { 
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.primary 
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.id ? theme.colors.primary : theme.colors.text + '99'} 
            />
            <Text 
              style={[
                styles.tabText, 
                { 
                  color: selectedCategory === category.id ? theme.colors.primary : theme.colors.text + '99'
                }
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Leaderboard Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading leaderboard...
          </Text>
        </View>
      ) : (
        <>
          {/* Top 3 Winners */}
          <View style={styles.topWinnersContainer}>
            {/* Second Place */}
            {leaderboardData[1] && (
              <View style={styles.topWinnerItem}>
                <View style={styles.secondPlaceContainer}>
                  <RankBadge rank={2} />
                  <Image 
                    source={{ uri: leaderboardData[1].profilePictureUrl }} 
                    style={styles.secondPlaceAvatar} 
                    defaultSource={require('@/assets/images/default-avatar.png')}
                  />
                </View>
                <Text style={[styles.topWinnerName, { color: theme.colors.text }]} numberOfLines={1}>
                  {leaderboardData[1].displayName}
                </Text>
                <Text style={[styles.topWinnerValue, { color: theme.colors.text + '99' }]}>
                  {typeof leaderboardData[1].value === 'number' && leaderboardData[1].value % 1 !== 0 
                    ? leaderboardData[1].value.toFixed(1) 
                    : leaderboardData[1].value}
                  {leaderboardData[1].unit ? ` ${leaderboardData[1].unit}` : ''}
                </Text>
              </View>
            )}
            
            {/* First Place */}
            {leaderboardData[0] && (
              <View style={styles.topWinnerItem}>
                <View style={styles.firstPlaceContainer}>
                  <View style={styles.crownContainer}>
                    <Ionicons name="crown" size={24} color="#FFD700" />
                  </View>
                  <Image 
                    source={{ uri: leaderboardData[0].profilePictureUrl }} 
                    style={styles.firstPlaceAvatar} 
                    defaultSource={require('@/assets/images/default-avatar.png')}
                  />
                </View>
                <Text style={[styles.topWinnerName, { color: theme.colors.text }]} numberOfLines={1}>
                  {leaderboardData[0].displayName}
                </Text>
                <Text style={[styles.topWinnerValue, { color: theme.colors.text + '99' }]}>
                  {typeof leaderboardData[0].value === 'number' && leaderboardData[0].value % 1 !== 0 
                    ? leaderboardData[0].value.toFixed(1) 
                    : leaderboardData[0].value}
                  {leaderboardData[0].unit ? ` ${leaderboardData[0].unit}` : ''}
                </Text>
              </View>
            )}
            
            {/* Third Place */}
            {leaderboardData[2] && (
              <View style={styles.topWinnerItem}>
                <View style={styles.thirdPlaceContainer}>
                  <RankBadge rank={3} />
                  <Image 
                    source={{ uri: leaderboardData[2].profilePictureUrl }} 
                    style={styles.thirdPlaceAvatar} 
                    defaultSource={require('@/assets/images/default-avatar.png')}
                  />
                </View>
                <Text style={[styles.topWinnerName, { color: theme.colors.text }]} numberOfLines={1}>
                  {leaderboardData[2].displayName}
                </Text>
                <Text style={[styles.topWinnerValue, { color: theme.colors.text + '99' }]}>
                  {typeof leaderboardData[2].value === 'number' && leaderboardData[2].value % 1 !== 0 
                    ? leaderboardData[2].value.toFixed(1) 
                    : leaderboardData[2].value}
                  {leaderboardData[2].unit ? ` ${leaderboardData[2].unit}` : ''}
                </Text>
              </View>
            )}
          </View>
          
          {/* Remaining Rankings */}
          <View style={styles.rankingsContainer}>
            <Text style={[styles.rankingsTitle, { color: theme.colors.text }]}>Rankings</Text>
            
            <FlatList
              data={leaderboardData.slice(3)} // Skip top 3 as they're displayed above
              renderItem={renderLeaderboardItem}
              keyExtractor={item => item.userId}
              contentContainerStyle={styles.leaderboardList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    No more data available
                  </Text>
                </View>
              }
              ListFooterComponent={
                userRank && userRank.rank > 8 ? (
                  <View style={[styles.currentUserContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={[styles.currentUserLabel, { color: theme.colors.text + '99' }]}>
                      Your Rank
                    </Text>
                    {renderLeaderboardItem({ item: userRank })}
                  </View>
                ) : null
              }
            />
          </View>
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
  backButton: {
    padding: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
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
  topWinnersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16
  },
  topWinnerItem: {
    alignItems: 'center',
    marginHorizontal: 12
  },
  firstPlaceContainer: {
    marginBottom: 8,
    position: 'relative'
  },
  secondPlaceContainer: {
    marginBottom: 8,
    position: 'relative',
    marginTop: 15 // Push down to make first place stand out
  },
  thirdPlaceContainer: {
    marginBottom: 8,
    position: 'relative',
    marginTop: 20 // Push down further
  },
  crownContainer: {
    position: 'absolute',
    top: -15,
    left: '50%',
    transform: [{ translateX: -12 }],
    zIndex: 10
  },
  firstPlaceAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD700'
  },
  secondPlaceAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#C0C0C0'
  },
  thirdPlaceAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#CD7F32'
  },
  topWinnerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center'
  },
  topWinnerValue: {
    fontSize: 12
  },
  rankingsContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  rankingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  leaderboardList: {
    paddingBottom: 16
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: '500'
  },
  valueContainer: {
    alignItems: 'flex-end'
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600'
  },
  valueLabel: {
    fontSize: 12
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14
  },
  currentUserContainer: {
    marginTop: 16,
    borderRadius: 8,
    paddingTop: 8
  },
  currentUserLabel: {
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 4
  }
}); 