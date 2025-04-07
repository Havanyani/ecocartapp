import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useCommunity } from '@/hooks/useCommunity';
import { Achievement } from '@/services/CommunityService';
import { useTheme } from '@/theme';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

function AchievementItem({ achievement }: { achievement: Achievement }) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.achievementContainer}>
      <View style={styles.achievementIcon}>
        <IconSymbol
          name={achievement.icon}
          size={24}
          color={achievement.completed ? theme.theme.colors.primary : theme.theme.colors.text}
        />
      </View>
      <View style={styles.achievementInfo}>
        <ThemedText style={styles.achievementTitle}>
          {achievement.title}
        </ThemedText>
        <ThemedText style={styles.achievementDescription}>
          {achievement.description}
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${achievement.progress}%`,
                backgroundColor: theme.theme.colors.primary,
              },
            ]}
          />
        </View>
        {achievement.completed && (
          <ThemedText style={styles.completedText}>
            Completed {new Date(achievement.completedAt!).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

export function UserProfile({ userId }: { userId: string }) {
  const { profile, achievements, isLoading, error } = useCommunity();
  const theme = useTheme();

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Error loading profile. Please try again.
        </ThemedText>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText>No profile found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.theme.colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {profile.name[0].toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{profile.name}</ThemedText>
          <ThemedText style={styles.userLevel}>Level {profile.level}</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <View style={styles.statItem}>
          <IconSymbol name="collection" size={24} color={theme.theme.colors.primary} />
          <ThemedText style={styles.statValue}>
            {profile.stats.totalCollections}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Collections</ThemedText>
        </View>
        <View style={styles.statItem}>
          <IconSymbol name="weight" size={24} color={theme.theme.colors.primary} />
          <ThemedText style={styles.statValue}>
            {profile.stats.totalWeight}kg
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Weight</ThemedText>
        </View>
        <View style={styles.statItem}>
          <IconSymbol name="fire" size={24} color={theme.theme.colors.primary} />
          <ThemedText style={styles.statValue}>
            {profile.stats.streak}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
        </View>
        <View style={styles.statItem}>
          <IconSymbol name="trophy" size={24} color={theme.theme.colors.primary} />
          <ThemedText style={styles.statValue}>
            #{profile.stats.rank}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Rank</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.achievementsSection}>
        <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
        {achievements.map(achievement => (
          <AchievementItem key={achievement.id} achievement={achievement} />
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  achievementsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  completedText: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 