/**
 * Utilities for calculating environmental impact of recycling different materials
 */

// CO2 savings in kg per container
export function calculateCO2Savings(material: string, quantity: number = 1): number {
  const savingsPerUnit = {
    plastic: 2.5,
    aluminum: 9.5,
    glass: 0.3,
    paper: 1.1,
  };
  
  return (savingsPerUnit[material as keyof typeof savingsPerUnit] || 0) * quantity;
}

// Water savings in liters per container
export function calculateWaterSavings(material: string, quantity: number = 1): number {
  const savingsPerUnit = {
    plastic: 100,
    aluminum: 1000,
    glass: 50,
    paper: 25,
  };
  
  return (savingsPerUnit[material as keyof typeof savingsPerUnit] || 0) * quantity;
}

// Energy conservation in kWh per container
export function calculateEnergyConservation(material: string, quantity: number = 1): number {
  const savingsPerUnit = {
    plastic: 5.8,
    aluminum: 14,
    glass: 2.7,
    paper: 4.1,
  };
  
  return (savingsPerUnit[material as keyof typeof savingsPerUnit] || 0) * quantity;
}

// Get complete environmental impact metrics for a material
export function getEnvironmentalImpactForMaterial(material: string, quantity: number = 1) {
  return {
    co2Savings: calculateCO2Savings(material, quantity),
    waterSavings: calculateWaterSavings(material, quantity),
    energyConservation: calculateEnergyConservation(material, quantity)
  };
}

// Calculate the total environmental impact from multiple containers
export function calculateTotalImpact(materials: Array<{ material: string; quantity: number }>) {
  return materials.reduce(
    (total, { material, quantity }) => {
      const impact = getEnvironmentalImpactForMaterial(material, quantity);
      
      return {
        co2Savings: total.co2Savings + impact.co2Savings,
        waterSavings: total.waterSavings + impact.waterSavings,
        energyConservation: total.energyConservation + impact.energyConservation
      };
    },
    { co2Savings: 0, waterSavings: 0, energyConservation: 0 }
  );
}

// Format environmental metrics for display
export function formatEnvironmentalMetrics(impact: { 
  co2Savings: number;
  waterSavings: number;
  energyConservation: number;
}) {
  return {
    co2: `${impact.co2Savings.toFixed(1)} kg CO₂`,
    water: `${impact.waterSavings.toFixed(0)} liters`,
    energy: `${impact.energyConservation.toFixed(1)} kWh`,
  };
} 