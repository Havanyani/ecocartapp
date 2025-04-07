/**
 * useMaterialsData.ts
 * 
 * A custom hook for fetching and managing materials data
 */

import { apiClient } from '@/api/ApiClient';
import { useAppDispatch, useAppSelector } from '@/store';
import { setMaterials, setMaterialsError } from '@/store/slices/apiDataSlice';
import { Material } from '@/types/models';
import { useCallback, useEffect } from 'react';
import useApi from './useApi';

/**
 * Query parameters for materials
 */
export interface MaterialsQueryParams {
  category?: string;
  isHazardous?: boolean;
  minRecyclingRate?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook for fetching and managing materials data
 */
export function useMaterialsData(params?: MaterialsQueryParams) {
  const dispatch = useAppDispatch();
  
  // Get materials from Redux store
  const materials = useAppSelector(state => 
    state.apiData.materials.ids.map(id => state.apiData.materials.entities[id])
  );
  const materialsLoaded = useAppSelector(state => state.apiData.materials.loaded);
  const lastUpdated = useAppSelector(state => state.apiData.materials.lastUpdated);
  const loadingError = useAppSelector(state => state.apiData.materials.loadingError);
  
  // Use API hook for data fetching
  const {
    data,
    loading,
    error,
    refetch,
    fromCache,
  } = useApi<Material[]>(
    'GET',
    '/materials',
    params,
    {
      // Stale after 5 minutes
      cache: {
        staleTime: 5 * 60 * 1000,
      },
      
      // Callback to store data in Redux
      onSuccess: (data) => {
        if (data) {
          dispatch(setMaterials(data));
        }
      },
      
      // Callback to store error in Redux
      onError: (error) => {
        dispatch(setMaterialsError(error.message));
      },
    }
  );
  
  // Fetch materials if not already loaded
  useEffect(() => {
    const shouldFetch = !materialsLoaded || 
      (lastUpdated && Date.now() - lastUpdated > 30 * 60 * 1000); // Refresh after 30 minutes
    
    if (shouldFetch) {
      refetch(params);
    }
  }, [materialsLoaded, lastUpdated, params, refetch]);
  
  /**
   * Fetch a single material by ID
   */
  const getMaterial = useCallback(async (id: string): Promise<Material | null> => {
    // Check if we already have it in the store
    const existingMaterial = materials.find(m => m.id === id);
    if (existingMaterial) {
      return existingMaterial;
    }
    
    try {
      const response = await apiClient.get<Material>(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching material ${id}:`, error);
      return null;
    }
  }, [materials]);
  
  /**
   * Create a new material
   */
  const createMaterial = useCallback(async (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Material | null> => {
    try {
      const response = await apiClient.post<Material>('/materials', material);
      
      // Update Redux store
      if (response.data) {
        dispatch(setMaterials([...materials, response.data]));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      return null;
    }
  }, [dispatch, materials]);
  
  /**
   * Update a material
   */
  const updateMaterial = useCallback(async (id: string, material: Partial<Material>): Promise<Material | null> => {
    try {
      const response = await apiClient.put<Material>(`/materials/${id}`, material);
      
      // Update Redux store
      if (response.data) {
        const updatedMaterials = materials.map(m => 
          m.id === id ? { ...m, ...response.data } : m
        );
        dispatch(setMaterials(updatedMaterials));
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating material ${id}:`, error);
      return null;
    }
  }, [dispatch, materials]);
  
  /**
   * Delete a material
   */
  const deleteMaterial = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/materials/${id}`);
      
      // Update Redux store
      const updatedMaterials = materials.filter(m => m.id !== id);
      dispatch(setMaterials(updatedMaterials));
      
      return true;
    } catch (error) {
      console.error(`Error deleting material ${id}:`, error);
      return false;
    }
  }, [dispatch, materials]);
  
  return {
    // Data
    materials,
    loading,
    error: error || loadingError,
    fromCache,
    
    // Methods
    refetch,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
}

export default useMaterialsData; 