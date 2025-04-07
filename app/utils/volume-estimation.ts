/**
 * Container dimensions
 */
export interface ContainerDimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'mm' | 'cm' | 'm';
}

/**
 * Volume estimation result
 */
export interface VolumeEstimationResult {
  volume: number;
  unit: 'ml' | 'l';
  confidence: number;
  dimensions?: ContainerDimensions;
}

/**
 * Estimate volume from container dimensions
 */
export function estimateVolumeFromDimensions(dimensions: ContainerDimensions): VolumeEstimationResult {
  const { width, height, depth, unit } = dimensions;
  
  // Convert all dimensions to meters for calculation
  const widthInMeters = convertToMeters(width, unit);
  const heightInMeters = convertToMeters(height, unit);
  const depthInMeters = convertToMeters(depth, unit);
  
  // Calculate volume in cubic meters
  const volumeInCubicMeters = widthInMeters * heightInMeters * depthInMeters;
  
  // Convert to liters
  const volumeInLiters = volumeInCubicMeters * 1000;
  
  return {
    volume: volumeInLiters,
    unit: 'l',
    confidence: 0.95,
    dimensions
  };
}

/**
 * Estimate volume from image data
 */
export async function estimateVolumeFromImage(imageData: string): Promise<VolumeEstimationResult> {
  // TODO: Implement actual volume estimation using ML model
  // For now, return mock data
  return {
    volume: 500,
    unit: 'ml',
    confidence: 0.85,
    dimensions: {
      width: 100,
      height: 200,
      depth: 100,
      unit: 'mm'
    }
  };
}

/**
 * Convert measurement to meters
 */
function convertToMeters(value: number, fromUnit: 'mm' | 'cm' | 'm'): number {
  switch (fromUnit) {
    case 'mm':
      return value / 1000;
    case 'cm':
      return value / 100;
    case 'm':
      return value;
    default:
      throw new Error(`Unsupported unit: ${fromUnit}`);
  }
}

/**
 * Format volume for display
 */
export function formatVolume(volume: number, unit: 'ml' | 'l'): string {
  if (unit === 'ml') {
    return `${Math.round(volume)}ml`;
  } else {
    return `${volume.toFixed(1)}L`;
  }
}

/**
 * Calculate environmental impact based on volume
 */
export function calculateEnvironmentalImpact(
  volume: number,
  unit: 'ml' | 'l',
  material: string
): {
  carbonFootprintSaved: number;
  waterSaved: number;
  energySaved: number;
  landfillSpaceSaved: number;
} {
  // Convert volume to liters for calculation
  const volumeInLiters = unit === 'ml' ? volume / 1000 : volume;
  
  // Base impact factors per liter (example values)
  const baseImpact = {
    carbonFootprintSaved: 2.5, // kg CO2
    waterSaved: 3.2, // liters
    energySaved: 0.8, // kWh
    landfillSpaceSaved: 0.5 // cubic meters
  };
  
  // Adjust impact based on material
  const materialMultiplier = getMaterialMultiplier(material);
  
  return {
    carbonFootprintSaved: baseImpact.carbonFootprintSaved * volumeInLiters * materialMultiplier,
    waterSaved: baseImpact.waterSaved * volumeInLiters * materialMultiplier,
    energySaved: baseImpact.energySaved * volumeInLiters * materialMultiplier,
    landfillSpaceSaved: baseImpact.landfillSpaceSaved * volumeInLiters * materialMultiplier
  };
}

/**
 * Get material-specific impact multiplier
 */
function getMaterialMultiplier(material: string): number {
  const multipliers: Record<string, number> = {
    PET: 1.0,
    HDPE: 1.1,
    PVC: 0.9,
    LDPE: 0.8,
    PP: 0.9,
    GLASS: 1.2,
    METAL: 1.3,
    PAPER: 0.7,
    CARDBOARD: 0.8,
    COMPOSTABLE: 0.6,
    NON_RECYCLABLE: 0
  };
  
  return multipliers[material] || 1.0;
} 