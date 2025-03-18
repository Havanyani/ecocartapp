import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'medal' | 'star' | 'crown' | 'shield-check';
  progress: number;
  target: number;
  unit: string;
  category: 'collection' | 'environmental' | 'engagement';
  unlocked: boolean;
  reward?: {
    type: 'credits' | 'badge' | 'status';
    value: number | string;
  };
}

interface PerformanceMetricsAchievementsProps {
  achievements: Achievement[];
  onAchievementPress?: (id: string) => void;
}

export function PerformanceMetricsAchievements({
  achievements,
  onAchievementPress,
}: PerformanceMetricsAchievementsProps) {
  const scaleAnims = useRef(achievements.map(() => new Animated.Value(0.95))).current;
  const progressAnims = useRef(achievements.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = achievements.map((achievement, index) => {
      const progress = achievement.progress / achievement.target;
      return Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnims[index], {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]);
    });

    Animated.stagger(100, animations).start();
  }, [achievements]);

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'engagement': return '#1976d2';
      default: return '#666';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          <IconSymbol name="trophy" size={24} color="#2e7d32" />
          Achievements
        </ThemedText>
      </View>

      <View style={styles.achievementsGrid}>
        {achievements.map((achievement, index) => (
          <Animated.View
            key={achievement.id}
            style={[
              styles.achievementCard,
              {
                transform: [{ scale: scaleAnims[index] }],
                opacity: achievement.unlocked ? 1 : 0.6,
              },
            ]}
          >
            <HapticTab
              style={[
                styles.achievementContent,
                { borderColor: getCategoryColor(achievement.category) },
              ]}
              onPress={() => onAchievementPress?.(achievement.id)}
            >
              <View style={styles.achievementHeader}>
                <IconSymbol
                  name={achievement.icon}
                  size={24}
                  color={achievement.unlocked ? getCategoryColor(achievement.category) : '#666'}
                />
                <ThemedText style={styles.achievementTitle}>
                  {achievement.title}
                </ThemedText>
              </View>

              <ThemedText style={styles.achievementDescription}>
                {achievement.description}
              </ThemedText>

              <View style={styles.progressSection}>
                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: getCategoryColor(achievement.category),
                        width: progressAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>

                <ThemedText style={styles.progressText}>
                  {achievement.progress}/{achievement.target} {achievement.unit}
                </ThemedText>
              </View>

              {achievement.reward && (
                <View style={styles.rewardContainer}>
                  <IconSymbol
                    name={achievement.reward.type === 'credits' ? 'credit-card-outline' : 'gift'}
                    size={16}
                    color="#666"
                  />
                  <ThemedText style={styles.rewardText}>
                    Reward: {achievement.reward.value}
                    {achievement.reward.type === 'credits' ? ' credits' : ''}
                  </ThemedText>
                </View>
              )}
            </HapticTab>
          </Animated.View>
        ))}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  achievementsGrid: {
    gap: 16,
  },
  achievementCard: {
    borderRadius: 8,
  },
  achievementContent: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressSection: {
    gap: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  rewardText: {
    fontSize: 12,
    color: '#666',
  },
}); 