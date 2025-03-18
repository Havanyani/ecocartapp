import { RecyclingReward, RecyclingRewardsService } from '@/services/RecyclingRewardsService';
import { RewardType } from '@/types/gamification';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface RecyclingRewardsState {
  rewards: RecyclingReward[];
  isLoading: boolean;
  error: string | null;
  totalPoints: number;
  availablePoints: number;
}

const initialState: RecyclingRewardsState = {
  rewards: [],
  isLoading: false,
  error: null,
  totalPoints: 0,
  availablePoints: 0,
};

const recyclingRewardsService = RecyclingRewardsService.getInstance();

// Async thunks
export const fetchRewards = createAsyncThunk(
  'recyclingRewards/fetchRewards',
  async () => {
    const response = await recyclingRewardsService.getRewards();
    return response;
  }
);

export const createReward = createAsyncThunk(
  'recyclingRewards/createReward',
  async ({ 
    weight, 
    source, 
    rewardType = RewardType.POINTS 
  }: { 
    weight: number; 
    source: 'checkers_sixty60' | 'other';
    rewardType?: RewardType;
  }) => {
    const response = await recyclingRewardsService.createReward(weight, source, rewardType);
    return response;
  }
);

export const redeemReward = createAsyncThunk(
  'recyclingRewards/redeemReward',
  async ({ 
    rewardId, 
    orderId, 
    appId 
  }: { 
    rewardId: string; 
    orderId: string;
    appId?: string;
  }) => {
    await recyclingRewardsService.redeemReward(rewardId, orderId, appId);
    return { rewardId, orderId };
  }
);

export const syncWithCheckersSixty60 = createAsyncThunk(
  'recyclingRewards/syncWithCheckersSixty60',
  async () => {
    await recyclingRewardsService.syncWithCheckersSixty60();
  }
);

const recyclingRewardsSlice = createSlice({
  name: 'recyclingRewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePoints: (state, action) => {
      state.totalPoints = action.payload.total;
      state.availablePoints = action.payload.available;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rewards
      .addCase(fetchRewards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rewards = action.payload;
        // Update points based on rewards
        const total = action.payload.reduce((sum, reward) => sum + reward.points, 0);
        const available = action.payload
          .filter(reward => reward.status === 'approved')
          .reduce((sum, reward) => sum + reward.points, 0);
        state.totalPoints = total;
        state.availablePoints = available;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch rewards';
      })
      // Create Reward
      .addCase(createReward.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReward.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rewards.push(action.payload);
        // Update points
        state.totalPoints += action.payload.points;
        if (action.payload.status === 'approved') {
          state.availablePoints += action.payload.points;
        }
      })
      .addCase(createReward.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create reward';
      })
      // Redeem Reward
      .addCase(redeemReward.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.isLoading = false;
        const reward = state.rewards.find(r => r.id === action.payload.rewardId);
        if (reward) {
          reward.status = 'redeemed';
          // Update available points
          state.availablePoints -= reward.points;
        }
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to redeem reward';
      })
      // Sync with Checkers Sixty60
      .addCase(syncWithCheckersSixty60.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncWithCheckersSixty60.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(syncWithCheckersSixty60.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to sync with Checkers Sixty60';
      });
  },
});

export const { clearError, updatePoints } = recyclingRewardsSlice.actions;
export default recyclingRewardsSlice.reducer; 