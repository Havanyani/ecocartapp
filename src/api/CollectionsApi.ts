/**
 * CollectionsApi.ts
 * 
 * API service for managing collection operations.
 */

import { CollectionItem } from '../types/collections';
import { apiClient } from './ApiClient';

export interface CollectionsQueryParams {
  status?: 'scheduled' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface CreateCollectionData {
  materialId: string;
  scheduledDate: Date;
  estimatedWeight: number;
  address: string;
  notes?: string;
}

export interface UpdateCollectionData {
  status?: 'scheduled' | 'completed' | 'cancelled';
  actualWeight?: number;
  completedDate?: Date;
  notes?: string;
  driverNotes?: string;
}

export class CollectionsApi {
  private static readonly BASE_PATH = '/collections';

  /**
   * Get collections with optional filtering
   */
  static async getCollections(params?: CollectionsQueryParams): Promise<{
    collections: CollectionItem[];
    total: number;
  }> {
    const response = await apiClient.get(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Get a single collection by ID
   */
  static async getCollection(id: string): Promise<CollectionItem> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create a new collection
   */
  static async createCollection(data: CreateCollectionData): Promise<CollectionItem> {
    const response = await apiClient.post(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update an existing collection
   */
  static async updateCollection(
    id: string,
    data: UpdateCollectionData
  ): Promise<CollectionItem> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Cancel a collection
   */
  static async cancelCollection(id: string): Promise<CollectionItem> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/cancel`);
    return response.data;
  }

  /**
   * Complete a collection
   */
  static async completeCollection(
    id: string,
    data: { actualWeight: number; driverNotes?: string }
  ): Promise<CollectionItem> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/complete`, data);
    return response.data;
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(): Promise<{
    totalCollections: number;
    completedCollections: number;
    totalWeight: number;
    totalCredits: number;
    monthlyStats: {
      month: string;
      collections: number;
      weight: number;
      credits: number;
    }[];
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/stats`);
    return response.data;
  }
} 