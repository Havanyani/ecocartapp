import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useCommunity } from '@/hooks/useCommunity';
import { useTheme } from '@/theme';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

function LeaderboardItem({
  user,
  rank,
}: {
  user: {
    name: string;
    avatar?: string;
    stats: {
      points: number;
      totalCollections: number;
      totalWeight: number;
    };
  };
  rank: number;
}) {
  const theme = useTheme();

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return theme.theme.colors.text;
    }
  };

  return (
    <ThemedView style={styles.itemContainer}>
      <View style={styles.rankContainer}>
        <ThemedText
          style={[
            styles.rankText,
            { color: getRankColor(rank) },
          ]}
        >
          #{rank}
        </ThemedText>
      </View>

      <View style={styles.userInfo}>
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.theme.colors.primary }]}>
            <ThemedText style={styles.avatarText}>
              {user.name[0].toUpperCase()}
            </ThemedText>
          </View>
        )}
        <View style={styles.userDetails}>
          <ThemedText style={styles.userName}>{user.name}</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <IconSymbol name="star" size={16} color={theme.theme.colors.primary} />
              <ThemedText style={styles.statText}>
                {user.stats.points}
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <IconSymbol name="collection" size={16} color={theme.theme.colors.primary} />
              <ThemedText style={styles.statText}>
                {user.stats.totalCollections}
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <IconSymbol name="weight" size={16} color={theme.theme.colors.primary} />
              <ThemedText style={styles.statText}>
                {user.stats.totalWeight}kg
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

export function Leaderboard() {
  const { leaderboard, isLoading, error } = useCommunity();

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading leaderboard...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Error loading leaderboard. Please try again.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={leaderboard}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <LeaderboardItem user={item} rank={index + 1} />
      )}
      ListEmptyComponent={
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No users found in the leaderboard.
          </ThemedText>
        </ThemedView>
      }
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
  },
}); 