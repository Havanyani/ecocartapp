import { MaterialsApi, Material } from '@/api/MaterialsApi';
import { EnhancedStorageService } from './EnhancedStorageService';
import { ApiService } from './ApiService';

/**
 * Response from looking up a material by barcode
 */
export interface BarcodeResponse {
  material: Material;
  confidence: number;
}

/**
 * Service for managing barcode scanning and material lookup
 */
export class BarcodeService {
  private static readonly BARCODE_ENDPOINT = '/barcodes';
  private static readonly CACHE_KEY = 'barcode_cache';
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  /**
   * Look up a material by barcode
   */
  public static async lookupMaterial(barcode: string): Promise<BarcodeResponse | null> {
    try {
      // First, check the cache
      const cacheResult = await this.checkCache(barcode);
      if (cacheResult) {
        return cacheResult;
      }
      
      // If not in cache, query the API
      const response = await ApiService.getInstance().get<BarcodeResponse>(
        `${this.BARCODE_ENDPOINT}/${barcode}`
      );
      
      // Validate the response
      if (response.data && response.data.material) {
        // Store in cache
        await this.storeInCache(barcode, response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error looking up barcode:', error);
      
      // Fallback to a local lookup based on prefix
      return this.fallbackLookup(barcode);
    }
  }
  
  /**
   * Contribute a barcode-material mapping
   */
  public static async contributeMaterial(barcode: string, materialType: string): Promise<void> {
    try {
      await ApiService.getInstance().post(
        `${this.BARCODE_ENDPOINT}/contribute`,
        { barcode, materialType }
      );
    } catch (error) {
      console.error('Error contributing barcode mapping:', error);
      throw error;
    }
  }
  
  /**
   * Store barcode-material mapping in cache
   */
  private static async storeInCache(barcode: string, result: BarcodeResponse): Promise<void> {
    try {
      // Get current cache
      const cache = await this.getBarcodeCache();
      
      // Update cache with new entry
      cache[barcode] = {
        material: result.material,
        confidence: result.confidence,
        timestamp: Date.now()
      };
      
      // Store updated cache
      await EnhancedStorageService.setValue(
        this.CACHE_KEY,
        cache,
        this.CACHE_EXPIRY
      );
    } catch (error) {
      console.error('Error storing barcode in cache:', error);
    }
  }
  
  /**
   * Check if barcode exists in cache
   */
  private static async checkCache(barcode: string): Promise<BarcodeResponse | null> {
    try {
      const cache = await this.getBarcodeCache();
      const cacheEntry = cache[barcode];
      
      if (cacheEntry) {
        // Check if cache entry has expired
        const now = Date.now();
        if (now - cacheEntry.timestamp <= this.CACHE_EXPIRY) {
          return {
            material: cacheEntry.material,
            confidence: cacheEntry.confidence
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking barcode cache:', error);
      return null;
    }
  }
  
  /**
   * Get the current barcode cache
   */
  private static async getBarcodeCache(): Promise<Record<string, any>> {
    try {
      const cache = await EnhancedStorageService.getValue<Record<string, any>>(this.CACHE_KEY);
      return cache || {};
    } catch (error) {
      console.error('Error getting barcode cache:', error);
      return {};
    }
  }
  
  /**
   * Fallback lookup for when API is unavailable
   * This is a simple fallback that uses the barcode prefix to guess the material
   */
  private static async fallbackLookup(barcode: string): Promise<BarcodeResponse | null> {
    try {
      // Get a subset of materials from the API or cache
      const materials = await MaterialsApi.getMaterials();
      if (!materials || materials.length === 0) {
        return null;
      }
      
      // Simple heuristic based on the first digits of the barcode
      const prefix = barcode.substring(0, 3);
      const prefixNum = parseInt(prefix, 10);
      
      // Very basic material mapping based on prefix
      // In a real app, this would be much more sophisticated
      let categoryToMatch: string;
      
      if (prefixNum >= 000 && prefixNum <= 199) {
        categoryToMatch = 'plastic';
      } else if (prefixNum >= 200 && prefixNum <= 299) {
        categoryToMatch = 'glass';
      } else if (prefixNum >= 300 && prefixNum <= 399) {
        categoryToMatch = 'metal';
      } else if (prefixNum >= 400 && prefixNum <= 499) {
        categoryToMatch = 'paper';
      } else {
        categoryToMatch = 'other';
      }
      
      // Find matching materials
      const matchingMaterials = materials.filter(m => 
        m.category.toLowerCase() === categoryToMatch
      );
      
      if (matchingMaterials.length > 0) {
        // Pick a random material from the category (just for demonstration)
        const randomIndex = Math.floor(Math.random() * matchingMaterials.length);
        const material = matchingMaterials[randomIndex];
        
        return {
          material,
          confidence: 0.5 // Lower confidence since this is a fallback
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in fallback lookup:', error);
      return null;
    }
  }
} 