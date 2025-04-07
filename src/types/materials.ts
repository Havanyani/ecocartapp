/**
 * materials.ts
 * 
 * Type definitions for material-related data structures.
 */

export type MaterialCategory = 'recyclable' | 'non_recyclable' | 'hazardous';

export interface Material {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  imageUrl: string;
  recyclingInstructions: string[];
  environmentalImpact: string;
  disposalGuidelines: string[];
}

export interface MaterialStats {
  materialId: string;
  totalCollected: number;
  totalRecycled: number;
  environmentalImpact: number;
  lastUpdated: string;
}

export interface MaterialCollection {
  materialId: string;
  weight: number;
  date: string;
  location: string;
  notes?: string;
}

/**
 * Performance best practices for the materials module
 * - Use virtualized lists for rendering large material lists
 * - Implement pagination for API requests
 * - Memoize filtering operations
 * - Use image caching for material images
 * - Implement skeleton loading screens
 */ 