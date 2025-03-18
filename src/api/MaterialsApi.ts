/**
 * MaterialsApi.ts
 * 
 * API interface for the Materials resource.
 * Handles all API calls related to materials.
 */

import { useCallback, useState } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import ApiService from '@/services/ApiService';

export interface Material {
  id: string;
  name: string;
  category: string;
  recyclingRate: number;
  description: string;
  imageUrl?: string;
  isHazardous: boolean;
  acceptedForms: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface MaterialsQueryParams {
  category?: string;
  isHazardous?: boolean;
  minRecyclingRate?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// Materials API class for direct API access
export class MaterialsApi {
  private static readonly BASE_PATH = '/materials';

  /**
   * Get a list of materials
   */
  static async getMaterials(params?: MaterialsQueryParams): Promise<Material[]> {
    try {
      const response = await ApiService.get<Material[]>(this.BASE_PATH, params);
      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Get a material by ID
   */
  static async getMaterial(id: string): Promise<Material> {
    try {
      const response = await ApiService.get<Material>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching material ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new material
   */
  static async createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Material> {
    try {
      const response = await ApiService.post<Material>(this.BASE_PATH, material);
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Update a material
   */
  static async updateMaterial(id: string, material: Partial<Material>): Promise<Material> {
    try {
      const response = await ApiService.put<Material>(`${this.BASE_PATH}/${id}`, material);
      return response.data;
    } catch (error) {
      console.error(`Error updating material ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a material
   */
  static async deleteMaterial(id: string): Promise<void> {
    try {
      await ApiService.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error deleting material ${id}:`, error);
      throw error;
    }
  }
}

// React hook for materials
export function useMaterials(params?: MaterialsQueryParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get network status
  const { isOnline } = useNetworkStatus();
  
  // Use local storage for caching
  const {
    value: materials,
    setValue: setMaterials,
    removeValue: clearMaterials
  } = useLocalStorage<Material[]>('materials_cache', {
    defaultValue: [],
    expiry: 24 * 60 * 60 * 1000, // 1 day
    validate: false
  });

  /**
   * Load materials
   */
  const loadMaterials = useCallback(async (refresh = false) => {
    // If offline and we have cached data, use that
    if (!isOnline && materials && materials.length > 0 && !refresh) {
      return materials;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If online, fetch from API
      if (isOnline) {
        const apiMaterials = await MaterialsApi.getMaterials(params);
        setMaterials(apiMaterials);
        return apiMaterials;
      } else {
        // If offline and no cached data, return empty array
        return materials || [];
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load materials');
      setError(error);
      
      // If we have cached data, return that even if there was an error
      if (materials && materials.length > 0) {
        return materials;
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, materials, params, setMaterials]);

  /**
   * Get a material by ID
   */
  const getMaterial = useCallback(async (id: string) => {
    // First check if we have it in cache
    const cachedMaterial = materials?.find(m => m.id === id);
    
    // If offline and we have cached data, use that
    if (!isOnline && cachedMaterial) {
      return cachedMaterial;
    }
    
    try {
      // If online, fetch from API
      if (isOnline) {
        return await MaterialsApi.getMaterial(id);
      } else if (cachedMaterial) {
        // If offline and have cached data, use that
        return cachedMaterial;
      } else {
        throw new Error('Material not found in offline cache');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to get material ${id}`);
      
      // If we have cached data, return that even if there was an error
      if (cachedMaterial) {
        return cachedMaterial;
      }
      
      throw error;
    }
  }, [isOnline, materials]);

  /**
   * Create a new material
   */
  const createMaterial = useCallback(async (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    if (!isOnline) {
      throw new Error('Cannot create materials while offline');
    }
    
    try {
      const newMaterial = await MaterialsApi.createMaterial(material);
      
      // Update local cache
      setMaterials([newMaterial, ...(materials || [])]);
      
      return newMaterial;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create material');
      setError(error);
      throw error;
    }
  }, [isOnline, materials, setMaterials]);

  /**
   * Update a material
   */
  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    if (!isOnline) {
      throw new Error('Cannot update materials while offline');
    }
    
    try {
      const updatedMaterial = await MaterialsApi.updateMaterial(id, updates);
      
      // Update local cache
      setMaterials((materials || []).map(m => 
        m.id === id ? updatedMaterial : m
      ));
      
      return updatedMaterial;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update material ${id}`);
      setError(error);
      throw error;
    }
  }, [isOnline, materials, setMaterials]);

  /**
   * Delete a material
   */
  const deleteMaterial = useCallback(async (id: string) => {
    if (!isOnline) {
      throw new Error('Cannot delete materials while offline');
    }
    
    try {
      await MaterialsApi.deleteMaterial(id);
      
      // Update local cache
      setMaterials((materials || []).filter(m => m.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete material ${id}`);
      setError(error);
      throw error;
    }
  }, [isOnline, materials, setMaterials]);

  return {
    materials,
    isLoading,
    error,
    isOnline,
    loadMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    clearMaterials
  };
}

export default MaterialsApi; 