/**
 * RewardsManager is the central component for managing user rewards, points, and achievements
 * in the EcoCart application. It handles reward distribution, points tracking, and progress visualization.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <RewardsManager
 *   userId={currentUserId}
 *   showProgress={true}
 *   onRewardEarned={handleReward}
 * />
 * 
 * // With custom theme and animations
 * <RewardsManager
 *   userId={currentUserId}
 *   showProgress={true}
 *   onRewardEarned={handleReward}
 *   theme="eco"
 *   enableAnimations={true}
 * />
 * ```
 * 
 * @features
 * - Real-time points tracking and updates
 * - Reward distribution and management
 * - Achievement unlocking system
 * - Progress visualization with animations
 * - Transaction history tracking
 * 
 * @performance
 * - Uses memoization for reward calculations
 * - Implements batch updates for points
 * - Optimizes animation performance
 * - Caches reward data locally
 * - Manages background updates
 * 
 * @accessibility
 * - Supports screen readers
 * - Implements keyboard navigation
 * - Provides haptic feedback
 * - Maintains color contrast
 * - Includes ARIA labels
 * 
 * @bestPractices
 * - Follow reward distribution guidelines
 * - Implement proper validation
 * - Handle edge cases gracefully
 * - Maintain transaction history
 * - Ensure data consistency
 */

import { usePoints } from '@/hooks/usePoints';
import { useRewards } from '@/hooks/useRewards';
import type { PointsTransaction, Reward } from '@/types/rewards';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PointsHistory } from './PointsHistory';
import { RewardCard } from './RewardCard';

/**
 * Props for the RewardsManager component
 * @interface
 */
interface RewardsManagerProps {
  /** User ID for reward tracking */
  userId: string;
  /** Whether to show progress indicators */
  showProgress?: boolean;
  /** Callback when a reward is earned */
  onRewardEarned?: (reward: Reward) => void;
  /** Theme for reward visuals */
  theme?: 'default' | 'eco' | 'minimal';
  /** Enable reward animations */
  enableAnimations?: boolean;
}

/**
 * RewardsManager component implementation
 * @param {RewardsManagerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const RewardsManager: React.FC<RewardsManagerProps> = ({
  userId,
  showProgress = true,
  onRewardEarned,
  theme = 'default',
  enableAnimations = true,
}) => {
  // Theme and styles
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Custom hooks
  const { rewards, updateRewards } = useRewards(userId);
  const { points, addPoints, subtractPoints } = usePoints(userId);

  /**
   * Handles reward distribution and unlocking
   * @param {Reward} reward - The reward to process
   */
  const handleRewardUnlock = useCallback(async (reward: Reward) => {
    try {
      await updateRewards(reward);
      onRewardEarned?.(reward);
    } catch (err) {
      setError(err as Error);
    }
  }, [updateRewards, onRewardEarned]);

  /**
   * Processes point transactions
   * @param {PointsTransaction} transaction - The transaction to process
   */
  const handleTransaction = useCallback(async (transaction: PointsTransaction) => {
    try {
      if (transaction.type === 'earn') {
        await addPoints(transaction.amount);
      } else if (transaction.type === 'spend') {
        await subtractPoints(transaction.amount);
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [addPoints, subtractPoints]);

  // Initialize component
  useEffect(() => {
    const initializeRewards = async () => {
      try {
        await updateRewards();
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    initializeRewards();
  }, [updateRewards]);

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Points summary */}
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>
          Available Points: {points.available}
        </Text>
        <Text style={styles.totalPointsText}>
          Total Earned: {points.total}
        </Text>
      </View>

      {/* Active rewards */}
      <View style={styles.rewardsContainer}>
        <Text style={styles.sectionTitle}>Active Rewards</Text>
        {rewards.active.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onUnlock={handleRewardUnlock}
            enableAnimations={enableAnimations}
          />
        ))}
      </View>

      {/* Points history */}
      {showProgress && (
        <PointsHistory
          userId={userId}
          onTransaction={handleTransaction}
          showDetails={true}
        />
      )}
    </SafeAreaView>
  );
};

/**
 * Styles for the RewardsManager component
 * @param {object} colors - Theme colors
 * @returns {StyleSheet} Component styles
 */
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  pointsContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  pointsText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalPointsText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 8,
  },
  rewardsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 