/**
 * MaterialsService
 * 
 * Service for managing and tracking various recyclable and compostable materials in the EcoCart system.
 * Supports identification, classification, and environmental impact calculation of materials.
 */

import { SafeStorage } from '@/utils/storage';
import { ApiService } from './ApiService';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  recyclable: boolean;
  compostable: boolean;
  imageUrl?: string;
  description?: string;
  ecoImpact: {
    waterSaved: number; // liters of water saved by recycling
    co2Reduced: number; // kg of CO2 reduced by recycling
    energySaved: number; // kWh of energy saved by recycling
  };
}

export enum MaterialType {
  PLASTIC = 'plastic',
  PAPER = 'paper',
  GLASS = 'glass',
  METAL = 'metal',
  ELECTRONIC = 'electronic',
  ORGANIC = 'organic',
  TEXTILE = 'textile',
  OTHER = 'other'
}

export interface MaterialStats {
  totalCollected: number; // total kg collected
  impactSummary: {
    waterSaved: number;
    co2Reduced: number;
    energySaved: number;
  };
  byType: Record<MaterialType, number>; // kg collected by type
}

export class MaterialsService {
  private static STORAGE_KEY_MATERIALS = '@materials';
  private static STORAGE_KEY_STATS = '@material_stats';

  /**
   * Get all available material types
   */
  static async getAllMaterials(): Promise<Material[]> {
    try {
      // First try to get from API
      const response = await ApiService.getInstance().get('/materials');
      const materials = response.data;
      
      // Cache the results
      await SafeStorage.setItem(this.STORAGE_KEY_MATERIALS, JSON.stringify(materials));
      
      return materials;
    } catch (error) {
      // Fall back to cached data if API fails
      const cached = await SafeStorage.getItem(this.STORAGE_KEY_MATERIALS);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Return default empty array if no cached data
      return [];
    }
  }

  /**
   * Get material by its id
   */
  static async getMaterialById(id: string): Promise<Material | null> {
    const materials = await this.getAllMaterials();
    return materials.find(material => material.id === id) || null;
  }

  /**
   * Get materials by type
   */
  static async getMaterialsByType(type: MaterialType): Promise<Material[]> {
    const materials = await this.getAllMaterials();
    return materials.filter(material => material.type === type);
  }

  /**
   * Record a new collection of materials
   */
  static async recordCollection(
    materialId: string, 
    weight: number,
    collectionDate: string = new Date().toISOString()
  ): Promise<void> {
    try {
      const material = await this.getMaterialById(materialId);
      if (!material) {
        throw new Error(`Material with ID ${materialId} not found`);
      }
      
      // Send to API
      await ApiService.getInstance().post('/collections', {
        materialId,
        weight,
        collectionDate
      });
      
      // Update local stats
      await this.updateStats(material, weight);
    } catch (error) {
      console.error('Failed to record material collection:', error);
      // Store for offline sync
      this.queueOfflineCollection(materialId, weight, collectionDate);
    }
  }

  /**
   * Get collection statistics
   */
  static async getStats(): Promise<MaterialStats> {
    try {
      // Try to get from API
      const response = await ApiService.getInstance().get('/materials/stats');
      const stats = response.data;
      
      // Cache the results
      await SafeStorage.setItem(this.STORAGE_KEY_STATS, JSON.stringify(stats));
      
      return stats;
    } catch (error) {
      // Fall back to cached data
      const cached = await SafeStorage.getItem(this.STORAGE_KEY_STATS);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Return empty stats if no cached data
      return {
        totalCollected: 0,
        impactSummary: {
          waterSaved: 0,
          co2Reduced: 0,
          energySaved: 0
        },
        byType: Object.values(MaterialType).reduce((acc, type) => {
          acc[type] = 0;
          return acc;
        }, {} as Record<MaterialType, number>)
      };
    }
  }

  /**
   * Calculate environmental impact for a given material amount
   */
  static calculateImpact(material: Material, weight: number) {
    return {
      waterSaved: material.ecoImpact.waterSaved * weight,
      co2Reduced: material.ecoImpact.co2Reduced * weight,
      energySaved: material.ecoImpact.energySaved * weight
    };
  }

  /**
   * Update local statistics with new collection
   */
  private static async updateStats(material: Material, weight: number): Promise<void> {
    const stats = await this.getStats();
    
    // Update total collected
    stats.totalCollected += weight;
    
    // Update by type
    stats.byType[material.type] = (stats.byType[material.type] || 0) + weight;
    
    // Update impact summary
    const impact = this.calculateImpact(material, weight);
    stats.impactSummary.waterSaved += impact.waterSaved;
    stats.impactSummary.co2Reduced += impact.co2Reduced;
    stats.impactSummary.energySaved += impact.energySaved;
    
    // Save updated stats
    await SafeStorage.setItem(this.STORAGE_KEY_STATS, JSON.stringify(stats));
  }

  /**
   * Queue an offline collection to be synced later
   */
  private static async queueOfflineCollection(
    materialId: string,
    weight: number,
    collectionDate: string
  ): Promise<void> {
    const offlineQueue = await SafeStorage.getItem('@offline_collections') || '[]';
    const queue = JSON.parse(offlineQueue);
    
    queue.push({
      materialId,
      weight,
      collectionDate,
      timestamp: Date.now()
    });
    
    await SafeStorage.setItem('@offline_collections', JSON.stringify(queue));
  }

  /**
   * Sync offline collections when back online
   */
  static async syncOfflineCollections(): Promise<void> {
    const offlineQueue = await SafeStorage.getItem('@offline_collections') || '[]';
    const queue = JSON.parse(offlineQueue);
    
    if (queue.length === 0) {
      return;
    }
    
    const failedSync: any[] = [];
    
    for (const item of queue) {
      try {
        await ApiService.getInstance().post('/collections', {
          materialId: item.materialId,
          weight: item.weight,
          collectionDate: item.collectionDate
        });
      } catch (error) {
        failedSync.push(item);
      }
    }
    
    // Save any failed syncs back to queue
    await SafeStorage.setItem('@offline_collections', JSON.stringify(failedSync));
  }
} 