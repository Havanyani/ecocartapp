import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';
import { Achievement } from '@/types/gamification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  compact?: boolean;
}

export function AchievementCard({ achievement, onPress, compact = false }: AchievementCardProps) {
  const theme = useTheme()()();

  // Get color based on achievement status
  const getStatusColor = (): string => {
    switch (achievement.status) {
      case 'locked':
        return theme.colors.text + '40';
      case 'in_progress':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'claimed':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  // Get icon for achievement status
  const getStatusIcon = (): string => {
    switch (achievement.status) {
      case 'locked':
        return 'lock-closed';
      case 'in_progress':
        return 'time';
      case 'completed':
        return 'checkmark-circle';
      case 'claimed':
        return 'trophy';
      default:
        return 'help-circle';
    }
  };

  if (compact) {
    // Compact card for list views
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { borderColor: theme.colors.background }
        ]}
        onPress={() => onPress?.(achievement)}
        disabled={!onPress}
      >
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: getStatusColor() + '20' }
          ]}
        >
          <Ionicons name={achievement.icon as any} size={24} color={getStatusColor()} />
        </View>
        
        <View style={styles.compactContent}>
          <ThemedText 
            style={[
              styles.title, 
              { 
                opacity: achievement.status === 'locked' ? 0.5 : 1
              }
            ]}
            numberOfLines={1}
          >
            {achievement.title}
          </ThemedText>
          
          {achievement.status === 'in_progress' && (
            <View style={styles.progressContainer}>
              <ThemedView 
                style={[
                  styles.progressBar, 
                  { 
                    width: '100%'
                  }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: getStatusColor(),
                      width: `${achievement.progress || 0}%`
                    }
                  ]}
                />
              </ThemedView>
              <ThemedText style={styles.progressText}>
                {achievement.progress || 0}%
              </ThemedText>
            </View>
          )}
        </View>
        
        <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
      </TouchableOpacity>
    );
  }

  // Full card for detailed views
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.card,
          borderColor: getStatusColor() + '40',
          opacity: achievement.status === 'locked' ? 0.7 : 1
        }
      ]}
      onPress={() => onPress?.(achievement)}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
          <Ionicons name={achievement.icon as any} size={32} color={getStatusColor()} />
        </View>
        
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>
            {achievement.title}
          </ThemedText>
          <ThemedText style={[styles.category, { color: theme.colors.textSecondary }]}>
            {achievement.category}
          </ThemedText>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {achievement.status}
          </Text>
        </View>
      </View>
      
      <ThemedText style={[styles.description, { opacity: 0.8 }]}>
        {achievement.description}
      </ThemedText>
      
      {achievement.status === 'in_progress' && (
        <View style={styles.progressContainer}>
          <ThemedView style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getStatusColor(),
                  width: `${achievement.progress || 0}%`
                }
              ]}
            />
          </ThemedView>
          <ThemedText style={styles.progressText}>
            {achievement.progress || 0}% Complete
          </ThemedText>
        </View>
      )}
      
      {(achievement.status === 'completed' || 
        achievement.status === 'claimed') && 
        achievement.unlockedAt && (
        <ThemedText style={[styles.unlockedText, { color: theme.colors.textSecondary }]}>
          {achievement.status === 'completed' ? 'Completed' : 'Claimed'} on{' '}
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </ThemedText>
      )}
      
      <View style={styles.rewardContainer}>
        <ThemedText style={[styles.rewardLabel, { color: theme.colors.textSecondary }]}>
          Reward:
        </ThemedText>
        <View style={styles.rewardContent}>
          <Ionicons 
            name={
              achievement.reward.type === 'points' 
                ? 'star' 
                : achievement.reward.type === 'badge' 
                  ? 'ribbon' 
                  : 'gift'
            } 
            size={16} 
            color={theme.colors.primary} 
          />
          <ThemedText style={styles.rewardText}>
            {achievement.reward.title}
          </ThemedText>
        </View>
      </View>
      
      {achievement.status === 'completed' && (
        <TouchableOpacity
          style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onPress?.(achievement)}
        >
          <ThemedText style={[styles.claimButtonText, { color: theme.colors.white }]}>
            Claim Reward
          </ThemedText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  unlockedText: {
    fontSize: 12,
    marginBottom: 12,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  claimButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
});

export default AchievementCard; 