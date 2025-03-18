import { Collection, CollectionStatus, TimeSlot } from '@/types/Collection';
import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import { ApiService } from './ApiService';

export interface CollectionData {
  userId: number;
  scheduledDateTime: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  materialType: string;
  estimatedWeight?: number;
  notes?: string;
}

export interface CollectionResponse {
  id: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  scheduledDateTime: string;
  actualDateTime?: string;
  weight?: number;
  credits?: number;
  userId: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  materialType: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface QueuedResponse {
  queued: true;
  message: string;
}

interface CreditCalculation {
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  breakdown: {
    baseRate: number;
    weightMultiplier: number;
    levelBonus: number;
  };
}

type UserLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

class CollectionService {
  private static readonly ENDPOINT = '/collections';
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  async scheduleCollection(timeSlot: TimeSlot): Promise<Collection> {
    try {
      const response = await this.apiService.post<Collection>(
        `${CollectionService.ENDPOINT}/schedule`,
        { timeSlot }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to schedule collection');
    }
  }

  async getTimeSlots(date: Date): Promise<TimeSlot[]> {
    try {
      const response = await this.apiService.get<TimeSlot[]>(
        `${CollectionService.ENDPOINT}/time-slots`,
        { date: date.toISOString() }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch time slots');
    }
  }

  async getCollectionHistory(): Promise<Collection[]> {
    try {
      const response = await this.apiService.get<Collection[]>(
        `${CollectionService.ENDPOINT}/history`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch collection history');
    }
  }

  async updateCollectionStatus(
    collectionId: string,
    status: CollectionStatus,
    note?: string
  ): Promise<Collection> {
    try {
      const response = await this.apiService.patch<Collection>(
        `${CollectionService.ENDPOINT}/${collectionId}/status`,
        { status, note }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update collection status');
    }
  }

  async cancelCollection(collectionId: string): Promise<void> {
    try {
      await this.apiService.delete(
        `${CollectionService.ENDPOINT}/${collectionId}`
      );
    } catch (error) {
      throw new Error('Failed to cancel collection');
    }
  }

  async rescheduleCollection(
    collectionId: string,
    newTimeSlot: TimeSlot
  ): Promise<Collection> {
    try {
      const response = await this.apiService.patch<Collection>(
        `${CollectionService.ENDPOINT}/${collectionId}/reschedule`,
        { timeSlot: newTimeSlot }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to reschedule collection');
    }
  }

  async getCollectionDetails(collectionId: string): Promise<Collection> {
    try {
      const response = await this.apiService.get<Collection>(
        `${CollectionService.ENDPOINT}/${collectionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch collection details');
    }
  }

  static async scheduleCollection(
    collectionData: CollectionData
  ): Promise<CollectionResponse | QueuedResponse> {
    try {
      const response = await ApiService.getInstance().post<CollectionResponse>(
        `${this.ENDPOINT}/schedule`,
        collectionData
      );
      return response.data;
    } catch (error) {
      if (!navigator.onLine) {
        await OfflineQueueManager.addToQueue({
          type: 'SCHEDULE_COLLECTION',
          payload: collectionData
        });
        return {
          queued: true,
          message: 'Collection will be scheduled when online'
        };
      }
      throw error;
    }
  }

  static async updateCollectionWeight(
    collectionId: number,
    weight: number
  ): Promise<CollectionResponse | QueuedResponse> {
    try {
      const response = await ApiService.getInstance().put<CollectionResponse>(
        `${this.ENDPOINT}/${collectionId}/weight`,
        { weight }
      );
      return response.data;
    } catch (error) {
      if (!navigator.onLine) {
        await OfflineQueueManager.addToQueue({
          type: 'UPDATE_WEIGHT',
          payload: { id: collectionId, weight }
        });
        return {
          queued: true,
          message: 'Weight will be updated when online'
        };
      }
      throw error;
    }
  }

  static async calculateCredits(
    weight: number,
    userLevel: UserLevel
  ): Promise<CreditCalculation> {
    const response = await ApiService.getInstance().post<CreditCalculation>(
      `${this.ENDPOINT}/calculate-credits`,
      { weight, userLevel }
    );
    return response.data;
  }

  static async cancelCollection(collectionId: number): Promise<void> {
    await ApiService.getInstance().delete(`${this.ENDPOINT}/${collectionId}`);
  }

  static async rescheduleCollection(
    collectionId: number,
    newDateTime: string
  ): Promise<CollectionResponse> {
    const response = await ApiService.getInstance().put<CollectionResponse>(
      `${this.ENDPOINT}/${collectionId}/reschedule`,
      { newDateTime }
    );
    return response.data;
  }
}

export const collectionService = new CollectionService(); 