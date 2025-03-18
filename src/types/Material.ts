/**
 * Material-related type definitions.
 */

// Material categories
export type MaterialCategory = 'plastic' | 'paper' | 'glass' | 'metal' | 'electronics' | 'organic' | 'other';

// Material condition
export type MaterialCondition = 'excellent' | 'good' | 'fair' | 'poor';

// Material types
export type PlasticType = 'PET' | 'HDPE' | 'PVC' | 'LDPE' | 'PP' | 'PS' | 'OTHER';
export type PaperType = 'cardboard' | 'newspaper' | 'magazine' | 'office' | 'mixed';
export type GlassType = 'container' | 'window' | 'mirror' | 'mixed';
export type MetalType = 'aluminum' | 'steel' | 'copper' | 'mixed';
export type ElectronicsType = 'computer' | 'phone' | 'tablet' | 'appliance' | 'other';

// Base material interface
export interface Material {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  points: number;
  icon?: string;
  creditPerKg?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Plastic material interface
export interface PlasticMaterial extends Material {
  category: MaterialCategory;
  type: PlasticType;
  recyclable: boolean;
  cleaningRequired: boolean;
  commonProducts: string[];
}

// Paper material interface
export interface PaperMaterial extends Material {
  category: MaterialCategory;
  type: PaperType;
  recyclable: boolean;
  grade: 'high' | 'medium' | 'low';
  contaminants: string[];
}

// Glass material interface
export interface GlassMaterial extends Material {
  category: MaterialCategory;
  type: GlassType;
  color: string;
  breakagePolicy: string;
}

// Metal material interface
export interface MetalMaterial extends Material {
  category: MaterialCategory;
  type: MetalType;
  magnetic: boolean;
}

// Electronics material interface
export interface ElectronicsMaterial extends Material {
  category: MaterialCategory;
  type: ElectronicsType;
  batteryType?: string;
  hazardousComponents: string[];
  dataPolicy: string;
  manufacturer?: string[];
}

// Material quantity tracking
export interface MaterialQuantity {
  materialId: string;
  quantity: number; // in kg
  condition: MaterialCondition;
  notes?: string;
  timestamp: Date;
}

// Material price history
export interface MaterialPriceHistory {
  materialId: string;
  price: number;
  effectiveDate: Date;
  expiryDate?: Date;
}

// Material statistics
export interface MaterialStats {
  materialId: string;
  totalCollected: number;
  averagePrice: number;
  recyclingRate: number;
  popularityRank: number;
  lastUpdated: Date;
} 