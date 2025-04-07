import ProgressBar from '@/components/ui/ProgressBar';
import { LeaderboardEntry } from '@/types/Challenge';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  goalTarget?: number;
  goalType?: string;
}

export default function LeaderboardRow({ entry, goalTarget, goalType }: LeaderboardRowProps) {
  const { rank, user, score, progress, completedDate, isCurrentUser } = entry;
  
  // Calculate progress percentage if goalTarget is provided
  const progressPercentage = goalTarget ? Math.min(1, progress / goalTarget) : undefined;
  
  // Get medal icon for top 3 ranks
  const getMedalIcon = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };
  
  const medalIcon = getMedalIcon();
  
  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View style={styles.rankContainer}>
        {medalIcon ? (
          <Text style={styles.medalIcon}>{medalIcon}</Text>
        ) : (
          <Text style={styles.rank}>#{rank}</Text>
        )}
      </View>
      
      <View style={styles.userContainer}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user.name.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.userName} numberOfLines={1}>
          {user.name}
          {isCurrentUser && <Text style={styles.currentUser}> (You)</Text>}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        {completedDate ? (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : progressPercentage !== undefined ? (
          <View style={styles.progressBarContainer}>
            <ProgressBar 
              progress={progressPercentage}
              height={6}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {`${Math.round(progressPercentage * 100)}%`}
            </Text>
          </View>
        ) : (
          <Text style={styles.score}>{score} pts</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  currentUserContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  medalIcon: {
    fontSize: 18,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    flex: 1,
  },
  currentUser: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#34C759',
  },
  progressContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  progressBarContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    marginBottom: 4,
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
    fontWeight: '500',
  },
}); 