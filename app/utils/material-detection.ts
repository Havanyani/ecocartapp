/**
 * Common recyclable materials
 */
export enum CommonMaterials {
  PET = 'PET',
  HDPE = 'HDPE',
  PVC = 'PVC',
  LDPE = 'LDPE',
  PP = 'PP',
  OTHER = 'OTHER',
  GLASS = 'GLASS',
  METAL = 'METAL',
  PAPER = 'PAPER',
  CARDBOARD = 'CARDBOARD',
  COMPOSTABLE = 'COMPOSTABLE',
  NON_RECYCLABLE = 'NON_RECYCLABLE'
}

/**
 * Material detection result
 */
export interface MaterialDetectionResult {
  material: CommonMaterials;
  confidence: number;
  isRecyclable: boolean;
  instructions?: string;
  environmentalImpact?: {
    carbonFootprintSaved?: number;
    waterSaved?: number;
    energySaved?: number;
    landfillSpaceSaved?: number;
  };
}

/**
 * Detect material from image data
 */
export async function detectMaterial(imageData: string): Promise<MaterialDetectionResult> {
  // TODO: Implement actual material detection using ML model
  // For now, return mock data
  return {
    material: CommonMaterials.PET,
    confidence: 0.95,
    isRecyclable: true,
    instructions: 'Rinse and remove cap',
    environmentalImpact: {
      carbonFootprintSaved: 2.5,
      waterSaved: 3.2,
      energySaved: 0.8,
      landfillSpaceSaved: 0.5
    }
  };
}

/**
 * Get recycling instructions for a material
 */
export function getRecyclingInstructions(material: CommonMaterials): string {
  const instructions: Record<CommonMaterials, string> = {
    [CommonMaterials.PET]: 'Rinse and remove cap',
    [CommonMaterials.HDPE]: 'Rinse and remove label if possible',
    [CommonMaterials.PVC]: 'Check local recycling guidelines',
    [CommonMaterials.LDPE]: 'Rinse and remove food residue',
    [CommonMaterials.PP]: 'Rinse and remove food residue',
    [CommonMaterials.OTHER]: 'Check local recycling guidelines',
    [CommonMaterials.GLASS]: 'Rinse and remove cap',
    [CommonMaterials.METAL]: 'Rinse and remove label if possible',
    [CommonMaterials.PAPER]: 'Keep dry and bundle together',
    [CommonMaterials.CARDBOARD]: 'Flatten and remove tape',
    [CommonMaterials.COMPOSTABLE]: 'Remove any non-compostable parts',
    [CommonMaterials.NON_RECYCLABLE]: 'Dispose in general waste'
  };
  
  return instructions[material];
}

/**
 * Get environmental impact for a material
 */
export function getEnvironmentalImpact(material: CommonMaterials): {
  carbonFootprintSaved: number;
  waterSaved: number;
  energySaved: number;
  landfillSpaceSaved: number;
} {
  const impact: Record<CommonMaterials, {
    carbonFootprintSaved: number;
    waterSaved: number;
    energySaved: number;
    landfillSpaceSaved: number;
  }> = {
    [CommonMaterials.PET]: {
      carbonFootprintSaved: 2.5,
      waterSaved: 3.2,
      energySaved: 0.8,
      landfillSpaceSaved: 0.5
    },
    [CommonMaterials.HDPE]: {
      carbonFootprintSaved: 2.8,
      waterSaved: 3.5,
      energySaved: 0.9,
      landfillSpaceSaved: 0.6
    },
    [CommonMaterials.PVC]: {
      carbonFootprintSaved: 2.2,
      waterSaved: 2.8,
      energySaved: 0.7,
      landfillSpaceSaved: 0.4
    },
    [CommonMaterials.LDPE]: {
      carbonFootprintSaved: 2.0,
      waterSaved: 2.5,
      energySaved: 0.6,
      landfillSpaceSaved: 0.3
    },
    [CommonMaterials.PP]: {
      carbonFootprintSaved: 2.3,
      waterSaved: 2.9,
      energySaved: 0.7,
      landfillSpaceSaved: 0.4
    },
    [CommonMaterials.OTHER]: {
      carbonFootprintSaved: 1.5,
      waterSaved: 2.0,
      energySaved: 0.5,
      landfillSpaceSaved: 0.3
    },
    [CommonMaterials.GLASS]: {
      carbonFootprintSaved: 3.0,
      waterSaved: 4.0,
      energySaved: 1.0,
      landfillSpaceSaved: 0.8
    },
    [CommonMaterials.METAL]: {
      carbonFootprintSaved: 3.5,
      waterSaved: 4.5,
      energySaved: 1.2,
      landfillSpaceSaved: 1.0
    },
    [CommonMaterials.PAPER]: {
      carbonFootprintSaved: 1.8,
      waterSaved: 2.3,
      energySaved: 0.6,
      landfillSpaceSaved: 0.4
    },
    [CommonMaterials.CARDBOARD]: {
      carbonFootprintSaved: 2.0,
      waterSaved: 2.5,
      energySaved: 0.7,
      landfillSpaceSaved: 0.5
    },
    [CommonMaterials.COMPOSTABLE]: {
      carbonFootprintSaved: 1.5,
      waterSaved: 2.0,
      energySaved: 0.5,
      landfillSpaceSaved: 0.3
    },
    [CommonMaterials.NON_RECYCLABLE]: {
      carbonFootprintSaved: 0,
      waterSaved: 0,
      energySaved: 0,
      landfillSpaceSaved: 0
    }
  };
  
  return impact[material];
}

/**
 * Check if a material is recyclable
 */
export function isRecyclable(material: CommonMaterials): boolean {
  return material !== CommonMaterials.NON_RECYCLABLE;
} 