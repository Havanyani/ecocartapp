import ProgressBar from '@/components/ui/ProgressBar';
import { Challenge, ChallengeStatus } from '@/types/Challenge';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

export default function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const {
    title,
    description,
    category,
    difficulty,
    status,
    startDate,
    endDate,
    goalType,
    goalTarget,
    currentProgress,
    participants,
    imageUrl,
  } = challenge;
  
  const progress = Math.min(1, currentProgress / goalTarget);
  const formattedProgress = `${Math.round(progress * 100)}%`;
  
  const getStatusColor = () => {
    switch (status) {
      case ChallengeStatus.ACTIVE:
        return Theme.colors.success;
      case ChallengeStatus.UPCOMING:
        return Theme.colors.info;
      case ChallengeStatus.COMPLETED:
        return Theme.colors.secondary;
      default:
        return Theme.colors.text;
    }
  };
  
  const getStatusLabel = () => {
    switch (status) {
      case ChallengeStatus.ACTIVE:
        return 'Active';
      case ChallengeStatus.UPCOMING:
        return 'Upcoming';
      case ChallengeStatus.COMPLETED:
        return 'Completed';
      default:
        return '';
    }
  };
  
  const getDifficultyIcon = () => {
    switch (difficulty) {
      case 'EASY':
        return 'leaf-outline';
      case 'MEDIUM':
        return 'flower-outline';
      case 'HARD':
        return 'flame-outline';
      default:
        return 'leaf-outline';
    }
  };
  
  const getTimeInfo = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (status === ChallengeStatus.UPCOMING) {
      if (isToday(start)) {
        return 'Starts today';
      }
      return `Starts ${format(start, 'MMM d')}`;
    } else if (status === ChallengeStatus.ACTIVE) {
      if (isToday(end)) {
        return 'Ends today';
      }
      return `Ends ${format(end, 'MMM d')}`;
    } else {
      return `Ended ${format(end, 'MMM d')}`;
    }
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{category}</Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusLabel()}</Text>
          </View>
        </View>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="trophy-outline" size={36} color={Theme.colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name={getDifficultyIcon()} size={16} color={Theme.colors.text} />
            <Text style={styles.metaText}>{difficulty}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={Theme.colors.text} />
            <Text style={styles.metaText}>{getTimeInfo()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={Theme.colors.text} />
            <Text style={styles.metaText}>{participants} joined</Text>
          </View>
        </View>
        
        {status !== ChallengeStatus.UPCOMING && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{formattedProgress}</Text>
            </View>
            <ProgressBar progress={progress} />
            <Text style={styles.progressGoal}>
              {`${currentProgress} / ${goalTarget} ${goalType.toLowerCase()}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    position: 'relative',
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: Theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  categoryContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  category: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  progressGoal: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
}); 