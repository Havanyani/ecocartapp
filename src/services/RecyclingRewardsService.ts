import { RewardType } from '@/types/gamification';
import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import { ApiService } from './ApiService';

export interface RecyclingReward {
  id: string;
  userId: string;
  amount: number;
  weight: number;
  status: 'pending' | 'approved' | 'redeemed' | 'expired';
  source: 'checkers_sixty60' | 'other';
  createdAt: string;
  expiresAt: string;
  rewardType: RewardType;
  points: number;
}

export interface GroceryAppIntegration {
  id: string;
  appName: string;
  apiKey: string;
  baseUrl: string;
  status: 'active' | 'inactive';
  lastSync: string;
  rewardMultiplier: number; // Multiplier for rewards when redeemed through this app
}

export class RecyclingRewardsService {
  private static instance: RecyclingRewardsService;
  private apiService: ApiService;

  private constructor() {
    this.apiService = ApiService.getInstance();
  }

  public static getInstance(): RecyclingRewardsService {
    if (!RecyclingRewardsService.instance) {
      RecyclingRewardsService.instance = new RecyclingRewardsService();
    }
    return RecyclingRewardsService.instance;
  }

  // Recycling Rewards
  async getRewards(): Promise<RecyclingReward[]> {
    try {
      const response = await this.apiService.get('/recycling-rewards');
      return response.data;
    } catch (error) {
      console.error('Error fetching recycling rewards:', error);
      throw error;
    }
  }

  async calculateReward(weight: number, userLevel: string): Promise<{ amount: number; points: number }> {
    try {
      const response = await this.apiService.post('/recycling-rewards/calculate', { 
        weight,
        userLevel 
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating reward:', error);
      throw error;
    }
  }

  async createReward(
    weight: number, 
    source: 'checkers_sixty60' | 'other',
    rewardType: RewardType = RewardType.POINTS
  ): Promise<RecyclingReward> {
    try {
      const response = await this.apiService.post('/recycling-rewards', { 
        weight, 
        source,
        rewardType 
      });
      return response.data;
    } catch (error) {
      console.error('Error creating reward:', error);
      throw error;
    }
  }

  async redeemReward(rewardId: string, orderId: string, appId?: string): Promise<void> {
    try {
      await this.apiService.post(`/recycling-rewards/${rewardId}/redeem`, { 
        orderId,
        appId 
      });
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  }

  // Grocery App Integration
  async getGroceryAppIntegrations(): Promise<GroceryAppIntegration[]> {
    try {
      const response = await this.apiService.get('/grocery-app-integrations');
      return response.data;
    } catch (error) {
      console.error('Error fetching grocery app integrations:', error);
      throw error;
    }
  }

  async syncWithGroceryApp(appId: string): Promise<void> {
    try {
      await this.apiService.post(`/grocery-app-integrations/${appId}/sync`);
    } catch (error) {
      console.error('Error syncing with grocery app:', error);
      throw error;
    }
  }

  // Checkers Sixty60 Specific Integration
  async syncWithCheckersSixty60(): Promise<void> {
    try {
      const integrations = await this.getGroceryAppIntegrations();
      const checkersIntegration = integrations.find(i => i.appName === 'checkers_sixty60');
      
      if (!checkersIntegration) {
        throw new Error('Checkers Sixty60 integration not found');
      }

      await this.syncWithGroceryApp(checkersIntegration.id);
    } catch (error) {
      console.error('Error syncing with Checkers Sixty60:', error);
      throw error;
    }
  }

  // Offline Support
  async processOfflineReward(rewardData: {
    weight: number;
    source: 'checkers_sixty60' | 'other';
    rewardType?: RewardType;
  }): Promise<void> {
    await OfflineQueueManager.addToQueue({
      type: 'CREATE_REWARD',
      payload: rewardData,
      timestamp: Date.now()
    });
  }
} 