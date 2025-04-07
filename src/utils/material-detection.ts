/**
 * Material Detection Utilities for AR Container Recognition
 * 
 * Provides advanced algorithms for identifying container materials
 * based on visual characteristics and machine learning patterns.
 */

import { containerTypes } from './ar-helpers';

export interface MaterialProperties {
  shininess: number;     // 0-1, how shiny the material appears
  transparency: number;  // 0-1, how transparent the material is
  texture: string;       // Description of texture (smooth, rough, etc.)
  color: string;         // Dominant color
  reflectivity: number;  // 0-1, how reflective the material is
}

export interface MaterialDetectionResult {
  materialType: string;
  confidence: number;
  recyclingInfo: {
    isRecyclable: boolean;
    recycleCodes?: string[];
    specialInstructions?: string;
  };
  properties: MaterialProperties;
}

/**
 * Common materials found in recycling containers
 */
export enum CommonMaterials {
  PET = 'PET',           // Polyethylene terephthalate
  HDPE = 'HDPE',         // High-density polyethylene
  PVC = 'PVC',           // Polyvinyl chloride
  LDPE = 'LDPE',         // Low-density polyethylene
  PP = 'PP',             // Polypropylene
  PS = 'PS',             // Polystyrene
  OTHER_PLASTIC = 'OTHER_PLASTIC',
  ALUMINUM = 'ALUMINUM',
  STEEL = 'STEEL',
  GLASS = 'GLASS',
  PAPER = 'PAPER',
  CARDBOARD = 'CARDBOARD',
  CARTON = 'CARTON',
  MIXED = 'MIXED',
  UNKNOWN = 'UNKNOWN'
}

// Material detection reference database
const materialReferenceData: Record<CommonMaterials, MaterialProperties> = {
  [CommonMaterials.PET]: {
    shininess: 0.7,
    transparency: 0.9,
    texture: 'smooth',
    color: 'clear',
    reflectivity: 0.6
  },
  [CommonMaterials.HDPE]: {
    shininess: 0.5,
    transparency: 0.1,
    texture: 'slightly_rough',
    color: 'various',
    reflectivity: 0.3
  },
  [CommonMaterials.PVC]: {
    shininess: 0.6,
    transparency: 0.5,
    texture: 'smooth',
    color: 'various',
    reflectivity: 0.4
  },
  [CommonMaterials.LDPE]: {
    shininess: 0.4,
    transparency: 0.3,
    texture: 'soft',
    color: 'various',
    reflectivity: 0.2
  },
  [CommonMaterials.PP]: {
    shininess: 0.6,
    transparency: 0.4,
    texture: 'smooth',
    color: 'various',
    reflectivity: 0.3
  },
  [CommonMaterials.PS]: {
    shininess: 0.5,
    transparency: 0.7,
    texture: 'rigid',
    color: 'clear',
    reflectivity: 0.4
  },
  [CommonMaterials.OTHER_PLASTIC]: {
    shininess: 0.5,
    transparency: 0.5,
    texture: 'varies',
    color: 'various',
    reflectivity: 0.4
  },
  [CommonMaterials.ALUMINUM]: {
    shininess: 0.9,
    transparency: 0.0,
    texture: 'metallic',
    color: 'silver',
    reflectivity: 0.9
  },
  [CommonMaterials.STEEL]: {
    shininess: 0.8,
    transparency: 0.0,
    texture: 'metallic',
    color: 'dark_silver',
    reflectivity: 0.7
  },
  [CommonMaterials.GLASS]: {
    shininess: 0.9,
    transparency: 0.8,
    texture: 'smooth',
    color: 'various',
    reflectivity: 0.8
  },
  [CommonMaterials.PAPER]: {
    shininess: 0.1,
    transparency: 0.0,
    texture: 'fibrous',
    color: 'various',
    reflectivity: 0.1
  },
  [CommonMaterials.CARDBOARD]: {
    shininess: 0.1,
    transparency: 0.0,
    texture: 'rough',
    color: 'brown',
    reflectivity: 0.1
  },
  [CommonMaterials.CARTON]: {
    shininess: 0.3,
    transparency: 0.0,
    texture: 'smooth',
    color: 'various',
    reflectivity: 0.2
  },
  [CommonMaterials.MIXED]: {
    shininess: 0.4,
    transparency: 0.3,
    texture: 'varies',
    color: 'various',
    reflectivity: 0.3
  },
  [CommonMaterials.UNKNOWN]: {
    shininess: 0.5,
    transparency: 0.5,
    texture: 'unknown',
    color: 'unknown',
    reflectivity: 0.5
  }
};

// Material recycling information
const materialRecyclingInfo: Record<CommonMaterials, {isRecyclable: boolean, recycleCodes?: string[], specialInstructions?: string}> = {
  [CommonMaterials.PET]: {
    isRecyclable: true,
    recycleCodes: ['1'],
    specialInstructions: 'Rinse and remove cap'
  },
  [CommonMaterials.HDPE]: {
    isRecyclable: true,
    recycleCodes: ['2'],
    specialInstructions: 'Rinse thoroughly'
  },
  [CommonMaterials.PVC]: {
    isRecyclable: false,
    recycleCodes: ['3'],
    specialInstructions: 'Not accepted in most recycling programs'
  },
  [CommonMaterials.LDPE]: {
    isRecyclable: true,
    recycleCodes: ['4'],
    specialInstructions: 'Check local guidelines, not accepted everywhere'
  },
  [CommonMaterials.PP]: {
    isRecyclable: true,
    recycleCodes: ['5'],
    specialInstructions: 'Rinse if contained food'
  },
  [CommonMaterials.PS]: {
    isRecyclable: false,
    recycleCodes: ['6'],
    specialInstructions: 'Rarely accepted in curbside recycling'
  },
  [CommonMaterials.OTHER_PLASTIC]: {
    isRecyclable: false,
    recycleCodes: ['7'],
    specialInstructions: 'Check with local facility'
  },
  [CommonMaterials.ALUMINUM]: {
    isRecyclable: true,
    specialInstructions: 'Highly recyclable, rinse before recycling'
  },
  [CommonMaterials.STEEL]: {
    isRecyclable: true,
    specialInstructions: 'Highly recyclable, rinse before recycling'
  },
  [CommonMaterials.GLASS]: {
    isRecyclable: true,
    specialInstructions: 'Separate by color if required in your area'
  },
  [CommonMaterials.PAPER]: {
    isRecyclable: true,
    specialInstructions: 'Keep dry and clean'
  },
  [CommonMaterials.CARDBOARD]: {
    isRecyclable: true,
    specialInstructions: 'Flatten and keep dry'
  },
  [CommonMaterials.CARTON]: {
    isRecyclable: true,
    specialInstructions: 'Rinse, flatten, and check local guidelines'
  },
  [CommonMaterials.MIXED]: {
    isRecyclable: false,
    specialInstructions: 'Mixed materials are often not recyclable'
  },
  [CommonMaterials.UNKNOWN]: {
    isRecyclable: false,
    specialInstructions: 'When in doubt, check local guidelines or throw out'
  }
};

/**
 * Detects material type from image data
 * Note: In a real implementation, this would use computer vision and ML
 * 
 * @param imageData Image data or tensor from camera
 * @param containerType Optional known container type to improve detection
 * @param colorData Optional color histogram data
 * @returns Material detection result with confidence
 */
export function detectMaterial(
  imageData: any,
  containerType?: string,
  colorData?: any
): Promise<MaterialDetectionResult> {
  // In a real implementation, this would process the image using a trained model
  
  return new Promise((resolve) => {
    // For demo purposes, we'll simulate detection with a delay
    setTimeout(() => {
      let detectedMaterial: CommonMaterials;
      let confidence: number;
      
      // If we have a known container type, use it to improve accuracy
      if (containerType) {
        const container = containerTypes.find(c => c.id === containerType);
        if (container) {
          // Map container material to our enum
          switch(container.material.toLowerCase()) {
            case 'polyethylene terephthalate (pet)':
              detectedMaterial = CommonMaterials.PET;
              confidence = 0.85 + (Math.random() * 0.12);
              break;
            case 'high-density polyethylene (hdpe)':
              detectedMaterial = CommonMaterials.HDPE;
              confidence = 0.82 + (Math.random() * 0.15);
              break;
            case 'aluminum':
              detectedMaterial = CommonMaterials.ALUMINUM;
              confidence = 0.9 + (Math.random() * 0.09);
              break;
            case 'glass':
              detectedMaterial = CommonMaterials.GLASS;
              confidence = 0.87 + (Math.random() * 0.12);
              break;
            case 'mixed (paper + plastic lining)':
              detectedMaterial = CommonMaterials.MIXED;
              confidence = 0.75 + (Math.random() * 0.2);
              break;
            case 'expanded polystyrene (eps)':
              detectedMaterial = CommonMaterials.PS;
              confidence = 0.8 + (Math.random() * 0.15);
              break;
            default:
              // Random material if no match
              detectedMaterial = Object.values(CommonMaterials)[
                Math.floor(Math.random() * (Object.values(CommonMaterials).length - 1))
              ] as CommonMaterials;
              confidence = 0.6 + (Math.random() * 0.3);
          }
        } else {
          // Random material with lower confidence
          detectedMaterial = Object.values(CommonMaterials)[
            Math.floor(Math.random() * (Object.values(CommonMaterials).length - 1))
          ] as CommonMaterials;
          confidence = 0.5 + (Math.random() * 0.4);
        }
      } else {
        // No container type hint, pick random material
        detectedMaterial = Object.values(CommonMaterials)[
          Math.floor(Math.random() * (Object.values(CommonMaterials).length - 1))
        ] as CommonMaterials;
        confidence = 0.5 + (Math.random() * 0.4);
      }
      
      // Get material properties from reference data
      const properties = materialReferenceData[detectedMaterial] || materialReferenceData[CommonMaterials.UNKNOWN];
      
      // Get recycling info
      const recyclingInfo = materialRecyclingInfo[detectedMaterial] || materialRecyclingInfo[CommonMaterials.UNKNOWN];
      
      // Return result
      resolve({
        materialType: detectedMaterial,
        confidence,
        recyclingInfo,
        properties
      });
    }, 1200); // Simulate processing delay
  });
}

/**
 * Compares two materials and determines if they are compatible for recycling together
 * 
 * @param material1 First material
 * @param material2 Second material
 * @returns Boolean indicating if they can be recycled together
 */
export function areRecyclingCompatible(material1: CommonMaterials, material2: CommonMaterials): boolean {
  // Materials that can be recycled together
  const compatibilityGroups = [
    // Plastics are typically sorted by type
    [CommonMaterials.PET],
    [CommonMaterials.HDPE],
    [CommonMaterials.PVC],
    [CommonMaterials.LDPE],
    [CommonMaterials.PP],
    [CommonMaterials.PS],
    [CommonMaterials.OTHER_PLASTIC],
    
    // Metals can often be recycled together
    [CommonMaterials.ALUMINUM, CommonMaterials.STEEL],
    
    // Paper products
    [CommonMaterials.PAPER, CommonMaterials.CARDBOARD],
    
    // Glass is usually sorted by color but we simplify here
    [CommonMaterials.GLASS]
  ];
  
  // Check if materials are in the same group
  return compatibilityGroups.some(group => 
    group.includes(material1) && group.includes(material2)
  );
}

/**
 * Gets detailed recycling instructions for a specific material
 * 
 * @param material Material type
 * @returns Detailed recycling instructions
 */
export function getRecyclingInstructions(material: CommonMaterials): string {
  const instructions: Record<CommonMaterials, string> = {
    [CommonMaterials.PET]: 
      'Clean and rinse the container. Remove and discard any caps or lids. Flatten if possible to save space.',
    [CommonMaterials.HDPE]: 
      'Rinse thoroughly. Replace caps if your local program accepts them. Most curbside programs accept HDPE.',
    [CommonMaterials.PVC]: 
      'This material is rarely accepted in curbside recycling. Contact your local waste management for special disposal options.',
    [CommonMaterials.LDPE]: 
      'Check with your local recycling program as acceptance varies. Clean and dry before recycling.',
    [CommonMaterials.PP]: 
      'Rinse container. Some programs accept PP in curbside recycling, but check local guidelines.',
    [CommonMaterials.PS]: 
      'Most curbside programs do not accept polystyrene (Styrofoam). Look for special drop-off locations or consider reuse.',
    [CommonMaterials.OTHER_PLASTIC]: 
      'These plastics are rarely recyclable. Check the resin identification code and consult local guidelines.',
    [CommonMaterials.ALUMINUM]: 
      'Rinse clean. No need to remove labels. Can be crushed to save space. Highly valuable in recycling programs.',
    [CommonMaterials.STEEL]: 
      'Rinse clean. Remove paper labels if possible. Steel cans are accepted in most recycling programs.',
    [CommonMaterials.GLASS]: 
      'Rinse thoroughly. Remove caps and lids. Some areas require sorting by color (clear, green, brown).',
    [CommonMaterials.PAPER]: 
      'Keep dry and clean. Remove any plastic windows, metal fasteners, or non-paper attachments.',
    [CommonMaterials.CARDBOARD]: 
      'Break down boxes to save space. Keep dry and clean. Remove any tape, labels, or non-cardboard materials.',
    [CommonMaterials.CARTON]: 
      'Rinse, remove plastic caps, and flatten. Many areas now accept cartons but check local guidelines.',
    [CommonMaterials.MIXED]: 
      'Mixed material packaging is often difficult to recycle. Check if your material has a special recycling program.',
    [CommonMaterials.UNKNOWN]: 
      'If you cannot identify the material, consult local recycling guidelines or contact your waste management provider.'
  };
  
  return instructions[material] || instructions[CommonMaterials.UNKNOWN];
} 