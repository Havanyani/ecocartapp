/**
 * AR Helpers - Utility functions for Augmented Reality container recognition
 */

// Container types with their properties
export interface ContainerType {
  id: string;
  name: string;
  material: string;
  isRecyclable: boolean;
  recognitionPatterns: string[];
  instructions: string;
  environmentalImpact: {
    carbonFootprint: number; // in kg CO2
    waterUsage: number; // in liters
    energySavings: number; // percentage when recycled
  };
}

// Database of container types
export const containerTypes: ContainerType[] = [
  {
    id: 'pet-bottle',
    name: 'Plastic Bottle (PET)',
    material: 'Polyethylene terephthalate (PET)',
    isRecyclable: true,
    recognitionPatterns: ['pet_bottle', 'water_bottle', 'soda_bottle'],
    instructions: 'Rinse, remove cap, and place in recycling bin. Caps can often be recycled separately.',
    environmentalImpact: {
      carbonFootprint: 0.041, // kg CO2 per bottle
      waterUsage: 1.8, // liters per bottle
      energySavings: 75, // percent energy saved when recycled vs new
    }
  },
  {
    id: 'hdpe-container',
    name: 'HDPE Container',
    material: 'High-density polyethylene (HDPE)',
    isRecyclable: true,
    recognitionPatterns: ['hdpe_bottle', 'milk_jug', 'detergent_bottle'],
    instructions: 'Rinse thoroughly, replace cap, and recycle. Accepted in most curbside programs.',
    environmentalImpact: {
      carbonFootprint: 0.051,
      waterUsage: 2.2,
      energySavings: 70,
    }
  },
  {
    id: 'aluminum-can',
    name: 'Aluminum Can',
    material: 'Aluminum',
    isRecyclable: true,
    recognitionPatterns: ['aluminum_can', 'soda_can', 'beer_can'],
    instructions: 'Rinse and crush if possible to save space. Can be recycled indefinitely.',
    environmentalImpact: {
      carbonFootprint: 0.060,
      waterUsage: 1.5,
      energySavings: 95,
    }
  },
  {
    id: 'glass-bottle',
    name: 'Glass Bottle',
    material: 'Glass',
    isRecyclable: true,
    recognitionPatterns: ['glass_bottle', 'wine_bottle', 'beer_bottle'],
    instructions: 'Rinse, remove caps, and recycle separately from other materials.',
    environmentalImpact: {
      carbonFootprint: 0.85,
      waterUsage: 4.2,
      energySavings: 30,
    }
  },
  {
    id: 'paper-carton',
    name: 'Paper Carton',
    material: 'Mixed (Paper + Plastic/Metal Lining)',
    isRecyclable: true,
    recognitionPatterns: ['paper_carton', 'juice_carton', 'milk_carton'],
    instructions: 'Rinse, flatten, and check local guidelines as recycling varies by region.',
    environmentalImpact: {
      carbonFootprint: 0.025,
      waterUsage: 0.9,
      energySavings: 50,
    }
  },
  {
    id: 'styrofoam-container',
    name: 'Styrofoam Container',
    material: 'Expanded Polystyrene (EPS)',
    isRecyclable: false,
    recognitionPatterns: ['styrofoam', 'foam_container', 'takeout_box'],
    instructions: 'Not recyclable in most areas. Check for special drop-off locations.',
    environmentalImpact: {
      carbonFootprint: 0.09,
      waterUsage: 1.5,
      energySavings: 0,
    }
  },
  {
    id: 'coffee-cup',
    name: 'Paper Coffee Cup',
    material: 'Mixed (Paper + Plastic Lining)',
    isRecyclable: false,
    recognitionPatterns: ['coffee_cup', 'paper_cup', 'disposable_cup'],
    instructions: 'Not recyclable due to plastic lining. Consider reusable alternatives.',
    environmentalImpact: {
      carbonFootprint: 0.033,
      waterUsage: 1.2,
      energySavings: 0,
    }
  }
];

/**
 * Simulates container recognition based on image content
 * In a production app, this would use machine learning or AR recognition
 * 
 * @returns Recognized container with confidence level
 */
export function recognizeContainer(imageData?: any) {
  // Simulate processing delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly select a container type (in a real app, this would use ML)
      const randomIndex = Math.floor(Math.random() * containerTypes.length);
      const containerType = containerTypes[randomIndex];
      
      // Generate a random confidence level between 0.75 and 0.98
      const confidence = 0.75 + (Math.random() * 0.23);
      
      // Return recognized container with confidence
      resolve({
        id: containerType.id,
        name: containerType.name,
        material: containerType.material,
        isRecyclable: containerType.isRecyclable,
        confidence: confidence,
        instructions: containerType.instructions,
        environmentalImpact: containerType.environmentalImpact
      });
    }, 1500); // Simulate processing time
  });
}

/**
 * Gets detailed information about a container type
 * 
 * @param containerId ID of the container to get details for
 * @returns Container type details or null if not found
 */
export function getContainerDetails(containerId: string): ContainerType | null {
  return containerTypes.find(container => container.id === containerId) || null;
}

/**
 * Calculates environmental impact metrics based on container type
 * 
 * @param containerId ID of the container 
 * @param quantity Number of containers
 * @returns Environmental impact metrics
 */
export function calculateEnvironmentalImpact(containerId: string, quantity: number = 1) {
  const container = getContainerDetails(containerId);
  
  if (!container) {
    return {
      carbonSaved: 0,
      waterSaved: 0,
      energySaved: 0,
    };
  }
  
  // Calculate impact if recycled vs. thrown away
  return {
    carbonSaved: container.isRecyclable 
      ? container.environmentalImpact.carbonFootprint * 0.7 * quantity 
      : 0,
    waterSaved: container.isRecyclable 
      ? container.environmentalImpact.waterUsage * 0.6 * quantity 
      : 0,
    energySaved: container.isRecyclable 
      ? container.environmentalImpact.energySavings * quantity / 100 
      : 0,
  };
} 