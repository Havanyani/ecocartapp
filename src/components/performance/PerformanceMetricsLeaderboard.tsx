import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  previousRank: number;
  category: 'collection' | 'environmental' | 'engagement';
  achievements: Array<{
    icon: 'trophy' | 'medal' | 'star' | 'crown';
    color: string;
  }>;
}

interface PerformanceMetricsLeaderboardProps {
  entries: LeaderboardEntry[];
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  category: LeaderboardEntry['category'];
  onEntryPress?: (id: string) => void;
}

export function PerformanceMetricsLeaderboard({
  entries,
  timeframe,
  category,
  onEntryPress,
}: PerformanceMetricsLeaderboardProps) {
  const scaleAnims = useRef(entries.map(() => new Animated.Value(0.95))).current;
  const fadeAnims = useRef(entries.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = entries.map((_, index) =>
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(100, animations).start();
  }, [entries]);

  const getCategoryColor = (cat: LeaderboardEntry['category']) => {
    switch (cat) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'engagement': return '#1976d2';
      default: return '#666';
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change === 0) return null;
    return {
      direction: change > 0 ? 'up' : 'down',
      value: Math.abs(change),
    };
  };

  const getTopRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
      default: return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          <IconSymbol name="trophy" size={24} color="#2e7d32" />
          {category.charAt(0).toUpperCase() + category.slice(1)} Leaders
        </ThemedText>
        <ThemedText style={styles.timeframe}>
          This {timeframe}
        </ThemedText>
      </View>

      <View style={styles.leaderboardList}>
        {entries.map((entry, index) => {
          const rankChange = getRankChange(entry.rank, entry.previousRank);
          const topRankStyle = getTopRankStyle(entry.rank);

          return (
            <Animated.View
              key={entry.id}
              style={[
                styles.entryCard,
                topRankStyle,
                {
                  opacity: fadeAnims[index],
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <HapticTab
                style={styles.entryContent}
                onPress={() => onEntryPress?.(entry.id)}
              >
                <View style={styles.rankSection}>
                  <ThemedText style={[styles.rankNumber, topRankStyle && styles.topRankText]}>
                    #{entry.rank}
                  </ThemedText>
                  {rankChange && (
                    <IconSymbol
                      name={rankChange.direction === 'up' ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={rankChange.direction === 'up' ? '#2e7d32' : '#d32f2f'}
                    />
                  )}
                </View>

                <View style={styles.userSection}>
                  {entry.avatar ? (
                    <Image
                      source={{ uri: entry.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: getCategoryColor(category) }]}>
                      <ThemedText style={styles.avatarInitial}>
                        {entry.name.charAt(0)}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.userName}>{entry.name}</ThemedText>
                </View>

                <View style={styles.scoreSection}>
                  <ThemedText style={styles.score}>
                    {entry.score.toLocaleString()}
                  </ThemedText>
                  <View style={styles.achievements}>
                    {entry.achievements.map((achievement, achievementIndex) => (
                      <IconSymbol
                        key={achievementIndex}
                        name={achievement.icon}
                        size={16}
                        color={achievement.color}
                      />
                    ))}
                  </View>
                </View>
              </HapticTab>
            </Animated.View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeframe: {
    fontSize: 14,
    color: '#666',
  },
  leaderboardList: {
    gap: 8,
  },
  entryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  firstPlace: {
    backgroundColor: '#fff9c4',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  secondPlace: {
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#c0c0c0',
  },
  thirdPlace: {
    backgroundColor: '#ffe0b2',
    borderWidth: 2,
    borderColor: '#cd7f32',
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  topRankText: {
    fontSize: 20,
    color: '#000',
  },
  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  achievements: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
}); 