/**
 * Web-specific mock for materials module
 * Provides fallback definitions for material types and related constants
 */

// Material type definitions
export const MaterialType = {
  PLASTIC: 'PLASTIC',
  PAPER: 'PAPER',
  GLASS: 'GLASS',
  METAL: 'METAL',
  ELECTRONIC: 'ELECTRONIC',
  ORGANIC: 'ORGANIC',
  OTHER: 'OTHER',
};

// Sample materials data
export const materials = [
  {
    id: 'plastic-1',
    name: 'PET Plastic',
    type: MaterialType.PLASTIC,
    recyclingValue: 0.85,
    description: 'Polyethylene terephthalate plastic used in bottles and containers',
    ecoImpact: 'High recyclability, reduces landfill waste',
  },
  {
    id: 'glass-1',
    name: 'Clear Glass',
    type: MaterialType.GLASS,
    recyclingValue: 0.95,
    description: 'Clear glass bottles and jars',
    ecoImpact: 'Highly recyclable, no quality loss when recycled',
  },
  {
    id: 'paper-1',
    name: 'Cardboard',
    type: MaterialType.PAPER,
    recyclingValue: 0.75,
    description: 'Corrugated cardboard boxes and packaging',
    ecoImpact: 'Biodegradable, reduces deforestation when recycled',
  },
];

// Mock functions
export const getMaterialById = (id: string) => {
  return materials.find((material) => material.id === id) || null;
};

export const getMaterialsByType = (type: string) => {
  return materials.filter((material) => material.type === type);
};

export default {
  MaterialType,
  materials,
  getMaterialById,
  getMaterialsByType,
}; 