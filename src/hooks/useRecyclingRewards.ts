import { useAppDispatch, useAppSelector } from '@/store';
import {
    clearError,
    createReward,
    fetchRewards,
    redeemReward,
    syncWithCheckersSixty60,
    updatePoints,
} from '@/store/slices/recyclingRewardsSlice';
import { RewardType } from '@/types/gamification';
import { useCallback } from 'react';

export function useRecyclingRewards() {
  const dispatch = useAppDispatch();
  const {
    rewards,
    isLoading,
    error,
    totalPoints,
    availablePoints,
  } = useAppSelector((state) => state.recyclingRewards);

  const loadRewards = useCallback(async () => {
    await dispatch(fetchRewards());
  }, [dispatch]);

  const handleCreateReward = useCallback(
    async (
      weight: number, 
      source: 'checkers_sixty60' | 'other',
      rewardType: RewardType = RewardType.POINTS
    ) => {
      await dispatch(createReward({ weight, source, rewardType }));
    },
    [dispatch]
  );

  const handleRedeemReward = useCallback(
    async (rewardId: string, orderId: string, appId?: string) => {
      await dispatch(redeemReward({ rewardId, orderId, appId }));
    },
    [dispatch]
  );

  const handleSyncWithCheckersSixty60 = useCallback(async () => {
    await dispatch(syncWithCheckersSixty60());
  }, [dispatch]);

  const handleUpdatePoints = useCallback(
    (total: number, available: number) => {
      dispatch(updatePoints({ total, available }));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    rewards,
    isLoading,
    error,
    totalPoints,
    availablePoints,
    loadRewards,
    createReward: handleCreateReward,
    redeemReward: handleRedeemReward,
    syncWithCheckersSixty60: handleSyncWithCheckersSixty60,
    updatePoints: handleUpdatePoints,
    clearError: handleClearError,
  };
} 