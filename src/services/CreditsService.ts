/**
 * Credit Service for managing user sustainability credits
 * This service handles earning, spending, and tracking EcoCart credits
 */

import { ApiService } from './ApiService';
import { StorageService } from './StorageService';

export interface Credit {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
  expiryDate?: string;
  transactionType: 'earned' | 'spent';
}

export interface CreditBalance {
  total: number;
  available: number;
  pending: number;
  expiringSoon: number;
}

class CreditsService {
  private api: ApiService;
  private storage: StorageService;
  private static instance: CreditsService;

  private constructor() {
    this.api = new ApiService();
    this.storage = new StorageService();
  }

  /**
   * Get singleton instance of CreditsService
   */
  public static getInstance(): CreditsService {
    if (!CreditsService.instance) {
      CreditsService.instance = new CreditsService();
    }
    return CreditsService.instance;
  }

  /**
   * Get user's current credit balance
   */
  public async getBalance(): Promise<CreditBalance> {
    try {
      // Try to get from API first
      const response = await this.api.get('/credits/balance');
      return response.data;
    } catch (error) {
      // Fall back to cached balance
      const cachedBalance = await this.storage.getItem('credits:balance');
      if (cachedBalance) {
        return JSON.parse(cachedBalance);
      }
      
      // Return a default balance if all else fails
      return {
        total: 0,
        available: 0,
        pending: 0,
        expiringSoon: 0
      };
    }
  }

  /**
   * Get transaction history
   */
  public async getTransactionHistory(
    page = 1, 
    limit = 20, 
    filter?: 'earned' | 'spent'
  ): Promise<Credit[]> {
    try {
      const params = { page, limit, ...(filter && { type: filter }) };
      const response = await this.api.get('/credits/history', { params });
      return response.data.transactions;
    } catch (error) {
      const cachedHistory = await this.storage.getItem('credits:history');
      return cachedHistory ? JSON.parse(cachedHistory) : [];
    }
  }

  /**
   * Earn credits from an eco-friendly action
   */
  public async earnCredits(
    amount: number, 
    source: string, 
    description: string
  ): Promise<Credit> {
    const transaction = {
      amount,
      source,
      description,
      transactionType: 'earned' as const,
      date: new Date().toISOString()
    };
    
    try {
      const response = await this.api.post('/credits/earn', transaction);
      await this.updateLocalCache();
      return response.data;
    } catch (error) {
      // Queue transaction to be synced later
      await this.queueOfflineTransaction(transaction);
      throw new Error('Failed to earn credits, transaction queued for later');
    }
  }

  /**
   * Spend credits on rewards or benefits
   */
  public async spendCredits(
    amount: number, 
    description: string
  ): Promise<Credit> {
    const transaction = {
      amount,
      source: 'reward_redemption',
      description,
      transactionType: 'spent' as const,
      date: new Date().toISOString()
    };
    
    try {
      const response = await this.api.post('/credits/spend', transaction);
      await this.updateLocalCache();
      return response.data;
    } catch (error) {
      throw new Error('Failed to spend credits, please try again later');
    }
  }

  /**
   * Queue an offline transaction to be synced later
   */
  private async queueOfflineTransaction(transaction: Partial<Credit>): Promise<void> {
    const queueKey = 'credits:transaction_queue';
    const existingQueue = await this.storage.getItem(queueKey);
    const queue = existingQueue ? JSON.parse(existingQueue) : [];
    
    queue.push({
      ...transaction,
      offlineId: Date.now().toString(),
      pendingSync: true
    });
    
    await this.storage.setItem(queueKey, JSON.stringify(queue));
  }

  /**
   * Update local cache with latest data
   */
  private async updateLocalCache(): Promise<void> {
    try {
      const balance = await this.api.get('/credits/balance');
      const history = await this.api.get('/credits/history', { 
        params: { page: 1, limit: 50 } 
      });
      
      await this.storage.setItem('credits:balance', JSON.stringify(balance.data));
      await this.storage.setItem('credits:history', JSON.stringify(history.data.transactions));
    } catch (error) {
      console.error('Failed to update credits cache', error);
    }
  }
}

export default CreditsService.getInstance(); 