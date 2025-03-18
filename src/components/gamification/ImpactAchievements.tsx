import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol, ThemedText, ThemedView } from '@/components/ui';
import { HapticTab } from '@/components/ui/HapticTab';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  reward: number;
  isUnlocked: boolean;
}

interface ImpactAchievementsProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
  testID?: string;
}

export function ImpactAchievements({
  achievements,
  onAchievementClick,
  testID
}: ImpactAchievementsProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container} testID={testID}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Impact Achievements</ThemedText>
        <IconSymbol name="trophy" size={24} color={theme.colors.primary} />
      </View>

      <View style={styles.achievementsGrid}>
        {achievements.map(achievement => (
          <HapticTab
            key={achievement.id}
            onPress={() => onAchievementClick(achievement)}
            style={[
              styles.achievementCard,
              achievement.isUnlocked && styles.unlockedCard
            ]}
            testID={`achievement-${achievement.id}`}
          >
            <IconSymbol
              name={achievement.icon}
              size={32}
              color={achievement.isUnlocked ? theme.colors.success : theme.colors.text}
            />
            <ThemedText style={styles.achievementTitle}>
              {achievement.title}
            </ThemedText>
            <ThemedText style={styles.achievementDescription}>
              {achievement.description}
            </ThemedText>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(achievement.progress / achievement.target) * 100}%`,
                      backgroundColor: achievement.isUnlocked
                        ? theme.colors.success
                        : theme.colors.primary
                    }
                  ]}
                />
              </View>
              <ThemedText style={styles.progressText}>
                {achievement.progress}/{achievement.target}
              </ThemedText>
            </View>
            {achievement.isUnlocked && (
              <View style={styles.rewardBadge}>
                <ThemedText style={styles.rewardText}>
                  +{achievement.reward} credits
                </ThemedText>
              </View>
            )}
          </HapticTab>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  unlockedCard: {
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  achievementDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  rewardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    color: 'green',
  },
}); 