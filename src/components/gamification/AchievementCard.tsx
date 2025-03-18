import { useTheme } from '@/hooks/useTheme';
import { Achievement, AchievementStatus } from '@/types/gamification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  compact?: boolean;
}

export function AchievementCard({ achievement, onPress, compact = false }: AchievementCardProps) {
  const { theme } = useTheme();

  // Get color based on achievement status
  const getStatusColor = (): string => {
    switch (achievement.status) {
      case AchievementStatus.LOCKED:
        return theme.colors.text + '40';
      case AchievementStatus.IN_PROGRESS:
        return theme.colors.warning;
      case AchievementStatus.COMPLETED:
        return theme.colors.success;
      case AchievementStatus.CLAIMED:
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  // Get icon for achievement status
  const getStatusIcon = (): string => {
    switch (achievement.status) {
      case AchievementStatus.LOCKED:
        return 'lock-closed';
      case AchievementStatus.IN_PROGRESS:
        return 'time';
      case AchievementStatus.COMPLETED:
        return 'checkmark-circle';
      case AchievementStatus.CLAIMED:
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
          <Text 
            style={[
              styles.title, 
              { 
                color: theme.colors.text,
                opacity: achievement.status === AchievementStatus.LOCKED ? 0.5 : 1
              }
            ]}
            numberOfLines={1}
          >
            {achievement.title}
          </Text>
          
          {achievement.status === AchievementStatus.IN_PROGRESS && (
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: theme.colors.background,
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
              </View>
              <Text style={[styles.progressText, { color: theme.colors.text }]}>
                {achievement.progress || 0}%
              </Text>
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
          opacity: achievement.status === AchievementStatus.LOCKED ? 0.7 : 1
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
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {achievement.title}
          </Text>
          <Text style={[styles.category, { color: theme.colors.text + '99' }]}>
            {achievement.category}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {achievement.status}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: theme.colors.text + 'CC' }]}>
        {achievement.description}
      </Text>
      
      {achievement.status === AchievementStatus.IN_PROGRESS && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { backgroundColor: theme.colors.background }
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
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {achievement.progress || 0}% Complete
          </Text>
        </View>
      )}
      
      {(achievement.status === AchievementStatus.COMPLETED || 
        achievement.status === AchievementStatus.CLAIMED) && 
        achievement.unlockedAt && (
        <Text style={[styles.unlockedText, { color: theme.colors.text + '99' }]}>
          {achievement.status === AchievementStatus.COMPLETED ? 'Completed' : 'Claimed'} on{' '}
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </Text>
      )}
      
      <View style={styles.rewardContainer}>
        <Text style={[styles.rewardLabel, { color: theme.colors.text + '99' }]}>
          Reward:
        </Text>
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
          <Text style={[styles.rewardText, { color: theme.colors.text }]}>
            {achievement.reward.title}
          </Text>
        </View>
      </View>
      
      {achievement.status === AchievementStatus.COMPLETED && (
        <TouchableOpacity
          style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onPress?.(achievement)}
        >
          <Text style={styles.claimButtonText}>Claim Reward</Text>
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