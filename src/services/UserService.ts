import { User } from '@/types/User';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { ApiService } from './ApiService';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
  };
}

export interface LoyaltyStatus {
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  nextLevel: {
    name: string;
    pointsNeeded: number;
  };
  benefits: string[];
}

export interface CreditsBalance {
  available: number;
  pending: number;
  lifetime: number;
  lastTransaction?: {
    amount: number;
    date: string;
    type: 'earned' | 'spent';
  };
}

export interface EnvironmentalImpact {
  recycledItems: number;
  carbonOffset: number;
  treesEquivalent: number;
  waterSaved: number;
  energySaved: number;
}

export class UserService {
  private static sanitizeData<T extends Record<string, unknown>>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim().replace(/[<>]/g, '') : value
      ])
    ) as T;
  }

  static async getUserProfile(userId: number): Promise<UserProfile> {
    return ApiService.get<UserProfile>(`/users/${userId}/profile`);
  }

  static async updateProfile(userId: number, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const sanitizedData = this.sanitizeData(profileData);
    return ApiService.put<UserProfile>(`/users/${userId}/profile`, sanitizedData);
  }

  static async getLoyaltyStatus(userId: number): Promise<LoyaltyStatus> {
    return ApiService.get<LoyaltyStatus>(`/users/${userId}/loyalty`);
  }

  static async getCreditsBalance(userId: number): Promise<CreditsBalance> {
    return ApiService.get<CreditsBalance>(`/users/${userId}/credits`);
  }

  static async updateNotificationPreferences(
    userId: number,
    preferences: UserProfile['preferences']
  ): Promise<UserProfile> {
    return ApiService.put<UserProfile>(`/users/${userId}/notifications`, preferences);
  }

  static async getEnvironmentalImpact(userId: number): Promise<EnvironmentalImpact> {
    try {
      const response = await ApiService.get<EnvironmentalImpact>(`/users/${userId}/impact`);
      PerformanceMonitor.addBreadcrumb('user', 'Environmental impact fetched');
      return response;
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw error;
    }
  }

  // Legacy method - will be deprecated
  static async getUserData(): Promise<User> {
    // TODO: Implement actual API call
    return {
      id: '1',
      name: 'Test User',
      metrics: {
        totalPlasticCollected: 52.4,
        credits: 262,
        carbonFootprintReduced: 131
      }
    };
  }
} 