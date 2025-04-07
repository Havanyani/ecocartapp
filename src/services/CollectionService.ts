/**
 * CollectionService.ts
 * 
 * Service for handling collection-related operations.
 * Provides methods for scheduling, updating, and retrieving collections.
 */

import { Collection, CollectionStatus } from '@/types/Collection';
import { CollectionItem, TimeSlot } from '@/types/collections';
import { Material } from '@/types/materials';
import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService';

// Constants
const COLLECTIONS_STORAGE_KEY = '@ecocart/collections';
const MATERIALS_STORAGE_KEY = '@ecocart/materials';

// Mock data for initial setup
const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'PET Bottles',
    description: 'Clear plastic bottles commonly used for beverages',
    category: 'recyclable',
    imageUrl: 'https://example.com/pet-bottles.jpg',
    recyclingInstructions: [
      'Rinse thoroughly',
      'Remove caps and labels',
      'Flatten if possible',
    ],
    environmentalImpact: 'PET bottles take 400+ years to decompose in landfills',
    disposalGuidelines: [
      'Place in recycling bin',
      'Do not mix with non-recyclable plastics',
    ],
  },
  {
    id: '2',
    name: 'HDPE Containers',
    description: 'Opaque plastic containers used for milk, detergent, etc.',
    category: 'recyclable',
    imageUrl: 'https://example.com/hdpe-containers.jpg',
    recyclingInstructions: [
      'Rinse thoroughly',
      'Remove caps and labels',
      'Flatten if possible',
    ],
    environmentalImpact: 'HDPE containers take 100+ years to decompose in landfills',
    disposalGuidelines: [
      'Place in recycling bin',
      'Do not mix with non-recyclable plastics',
    ],
  },
  {
    id: '3',
    name: 'Plastic Bags',
    description: 'Thin plastic bags used for shopping and packaging',
    category: 'recyclable',
    imageUrl: 'https://example.com/plastic-bags.jpg',
    recyclingInstructions: [
      'Clean and dry',
      'Bundle together',
      'Do not place loose in recycling bin',
    ],
    environmentalImpact: 'Plastic bags can take 10-20 years to decompose and often end up in oceans',
    disposalGuidelines: [
      'Return to collection points at grocery stores',
      'Do not place in regular recycling bins',
    ],
  },
];

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

  /**
   * Initialize the service with mock data if needed
   */
  async initialize(): Promise<void> {
    try {
      // Check if materials data exists
      const materialsData = await AsyncStorage.getItem(MATERIALS_STORAGE_KEY);
      if (!materialsData) {
        // Store mock materials data
        await AsyncStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(mockMaterials));
      }

      // Check if collections data exists
      const collectionsData = await AsyncStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (!collectionsData) {
        // Initialize empty collections array
        await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing CollectionService:', error);
      throw new Error('Failed to initialize collection service');
    }
  }

  /**
   * Get all materials
   */
  async getMaterials(): Promise<Material[]> {
    try {
      const materialsData = await AsyncStorage.getItem(MATERIALS_STORAGE_KEY);
      if (!materialsData) {
        return mockMaterials;
      }
      return JSON.parse(materialsData);
    } catch (error) {
      console.error('Error getting materials:', error);
      throw new Error('Failed to get materials');
    }
  }

  /**
   * Get a material by ID
   */
  async getMaterialById(id: string): Promise<Material | null> {
    try {
      const materials = await this.getMaterials();
      return materials.find(material => material.id === id) || null;
    } catch (error) {
      console.error(`Error getting material with ID ${id}:`, error);
      throw new Error('Failed to get material');
    }
  }

  /**
   * Get all collections
   */
  async getCollections(): Promise<CollectionItem[]> {
    try {
      const collectionsData = await AsyncStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (!collectionsData) {
        return [];
      }
      return JSON.parse(collectionsData);
    } catch (error) {
      console.error('Error getting collections:', error);
      throw new Error('Failed to get collections');
    }
  }

  /**
   * Get collections by user ID
   */
  async getCollectionsByUserId(userId: string): Promise<CollectionItem[]> {
    try {
      const collections = await this.getCollections();
      return collections.filter(collection => collection.userId === userId);
    } catch (error) {
      console.error(`Error getting collections for user ${userId}:`, error);
      throw new Error('Failed to get user collections');
    }
  }

  /**
   * Get a collection by ID
   */
  async getCollectionById(id: string): Promise<CollectionItem | null> {
    try {
      const collections = await this.getCollections();
      return collections.find(collection => collection.id === id) || null;
    } catch (error) {
      console.error(`Error getting collection with ID ${id}:`, error);
      throw new Error('Failed to get collection');
    }
  }

  /**
   * Schedule a new collection
   */
  async scheduleCollection(collection: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CollectionItem> {
    try {
      const collections = await this.getCollections();
      
      const newCollection: CollectionItem = {
        ...collection,
        id: `collection_${Date.now()}`,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedCollections = [...collections, newCollection];
      await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(updatedCollections));
      
      return newCollection;
    } catch (error) {
      console.error('Error scheduling collection:', error);
      throw new Error('Failed to schedule collection');
    }
  }

  /**
   * Update a collection
   */
  async updateCollection(id: string, updates: Partial<CollectionItem>): Promise<CollectionItem> {
    try {
      const collections = await this.getCollections();
      const index = collections.findIndex(collection => collection.id === id);
      
      if (index === -1) {
        throw new Error(`Collection with ID ${id} not found`);
      }
      
      const updatedCollection: CollectionItem = {
        ...collections[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      collections[index] = updatedCollection;
      await AsyncStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
      
      return updatedCollection;
    } catch (error) {
      console.error(`Error updating collection with ID ${id}:`, error);
      throw new Error('Failed to update collection');
    }
  }

  /**
   * Complete a collection
   */
  async completeCollection(id: string, actualWeight: number, driverNotes?: string): Promise<CollectionItem> {
    try {
      const collection = await this.getCollectionById(id);
      
      if (!collection) {
        throw new Error(`Collection with ID ${id} not found`);
      }
      
      // Calculate credits based on weight (1 credit per kg)
      const creditAmount = Math.floor(actualWeight);
      
      const updatedCollection = await this.updateCollection(id, {
        status: 'completed',
        actualWeight,
        creditAmount,
        driverNotes,
        completedDate: new Date().toISOString(),
      });
      
      return updatedCollection;
    } catch (error) {
      console.error(`Error completing collection with ID ${id}:`, error);
      throw new Error('Failed to complete collection');
    }
  }

  /**
   * Cancel a collection
   */
  async cancelCollection(id: string): Promise<CollectionItem> {
    try {
      return await this.updateCollection(id, {
        status: 'cancelled',
      });
    } catch (error) {
      console.error(`Error canceling collection with ID ${id}:`, error);
      throw new Error('Failed to cancel collection');
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

// Export a singleton instance
const collectionService = new CollectionService();
export default collectionService; 