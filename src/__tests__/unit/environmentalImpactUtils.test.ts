import {
    calculateCO2Savings,
    calculateEnergyConservation,
    calculateTotalImpact,
    calculateWaterSavings,
    formatEnvironmentalMetrics,
    getEnvironmentalImpactForMaterial
} from '../../utils/environmentalImpactUtils';

describe('Environmental Impact Calculations', () => {
  describe('calculateCO2Savings', () => {
    it('calculates CO2 savings for plastic correctly', () => {
      const result = calculateCO2Savings('plastic', 1);
      expect(result).toBeCloseTo(2.5);
    });

    it('calculates CO2 savings for aluminum correctly', () => {
      const result = calculateCO2Savings('aluminum', 1);
      expect(result).toBeCloseTo(9.5);
    });

    it('calculates CO2 savings for glass correctly', () => {
      const result = calculateCO2Savings('glass', 1);
      expect(result).toBeCloseTo(0.3);
    });

    it('calculates CO2 savings for paper correctly', () => {
      const result = calculateCO2Savings('paper', 1);
      expect(result).toBeCloseTo(1.1);
    });

    it('returns 0 for unknown materials', () => {
      const result = calculateCO2Savings('unknown', 1);
      expect(result).toBe(0);
    });

    it('scales with quantity', () => {
      const result = calculateCO2Savings('plastic', 5);
      expect(result).toBeCloseTo(12.5);
    });
  });

  describe('calculateWaterSavings', () => {
    it('calculates water savings for plastic correctly', () => {
      const result = calculateWaterSavings('plastic', 1);
      expect(result).toBeCloseTo(100);
    });

    it('calculates water savings for aluminum correctly', () => {
      const result = calculateWaterSavings('aluminum', 1);
      expect(result).toBeCloseTo(1000);
    });

    it('calculates water savings for glass correctly', () => {
      const result = calculateWaterSavings('glass', 1);
      expect(result).toBeCloseTo(50);
    });

    it('calculates water savings for paper correctly', () => {
      const result = calculateWaterSavings('paper', 1);
      expect(result).toBeCloseTo(25);
    });

    it('returns 0 for unknown materials', () => {
      const result = calculateWaterSavings('unknown', 1);
      expect(result).toBe(0);
    });

    it('scales with quantity', () => {
      const result = calculateWaterSavings('plastic', 5);
      expect(result).toBeCloseTo(500);
    });
  });

  describe('calculateEnergyConservation', () => {
    it('calculates energy conservation for plastic correctly', () => {
      const result = calculateEnergyConservation('plastic', 1);
      expect(result).toBeCloseTo(5.8);
    });

    it('calculates energy conservation for aluminum correctly', () => {
      const result = calculateEnergyConservation('aluminum', 1);
      expect(result).toBeCloseTo(14);
    });

    it('calculates energy conservation for glass correctly', () => {
      const result = calculateEnergyConservation('glass', 1);
      expect(result).toBeCloseTo(2.7);
    });

    it('calculates energy conservation for paper correctly', () => {
      const result = calculateEnergyConservation('paper', 1);
      expect(result).toBeCloseTo(4.1);
    });

    it('returns 0 for unknown materials', () => {
      const result = calculateEnergyConservation('unknown', 1);
      expect(result).toBe(0);
    });

    it('scales with quantity', () => {
      const result = calculateEnergyConservation('plastic', 5);
      expect(result).toBeCloseTo(29);
    });
  });

  describe('getEnvironmentalImpactForMaterial', () => {
    it('returns complete impact for plastic correctly', () => {
      const result = getEnvironmentalImpactForMaterial('plastic', 1);
      expect(result).toEqual({
        co2Savings: 2.5,
        waterSavings: 100,
        energyConservation: 5.8
      });
    });

    it('returns complete impact for aluminum correctly', () => {
      const result = getEnvironmentalImpactForMaterial('aluminum', 1);
      expect(result).toEqual({
        co2Savings: 9.5,
        waterSavings: 1000,
        energyConservation: 14
      });
    });

    it('returns complete impact for glass correctly', () => {
      const result = getEnvironmentalImpactForMaterial('glass', 1);
      expect(result).toEqual({
        co2Savings: 0.3,
        waterSavings: 50,
        energyConservation: 2.7
      });
    });

    it('returns complete impact for paper correctly', () => {
      const result = getEnvironmentalImpactForMaterial('paper', 1);
      expect(result).toEqual({
        co2Savings: 1.1,
        waterSavings: 25,
        energyConservation: 4.1
      });
    });

    it('returns zeros for unknown materials', () => {
      const result = getEnvironmentalImpactForMaterial('unknown', 1);
      expect(result).toEqual({
        co2Savings: 0,
        waterSavings: 0,
        energyConservation: 0
      });
    });

    it('scales with quantity', () => {
      const result = getEnvironmentalImpactForMaterial('plastic', 5);
      expect(result).toEqual({
        co2Savings: 12.5,
        waterSavings: 500,
        energyConservation: 29
      });
    });
  });

  describe('calculateTotalImpact', () => {
    it('calculates the total impact from multiple materials correctly', () => {
      const materials = [
        { material: 'plastic', quantity: 2 },
        { material: 'aluminum', quantity: 1 },
        { material: 'glass', quantity: 3 }
      ];
      
      const result = calculateTotalImpact(materials);
      
      expect(result).toEqual({
        co2Savings: 2.5 * 2 + 9.5 * 1 + 0.3 * 3,
        waterSavings: 100 * 2 + 1000 * 1 + 50 * 3,
        energyConservation: 5.8 * 2 + 14 * 1 + 2.7 * 3
      });
    });
    
    it('returns zeros for empty materials array', () => {
      const result = calculateTotalImpact([]);
      
      expect(result).toEqual({
        co2Savings: 0,
        waterSavings: 0,
        energyConservation: 0
      });
    });
    
    it('handles unknown materials in the array', () => {
      const materials = [
        { material: 'plastic', quantity: 1 },
        { material: 'unknown', quantity: 5 }
      ];
      
      const result = calculateTotalImpact(materials);
      
      expect(result).toEqual({
        co2Savings: 2.5,
        waterSavings: 100,
        energyConservation: 5.8
      });
    });
  });
  
  describe('formatEnvironmentalMetrics', () => {
    it('formats the metrics correctly with units', () => {
      const impact = {
        co2Savings: 12.34,
        waterSavings: 567.89,
        energyConservation: 8.76
      };
      
      const result = formatEnvironmentalMetrics(impact);
      
      expect(result).toEqual({
        co2: '12.3 kg CO₂',
        water: '568 liters',
        energy: '8.8 kWh'
      });
    });
    
    it('handles zero values correctly', () => {
      const impact = {
        co2Savings: 0,
        waterSavings: 0,
        energyConservation: 0
      };
      
      const result = formatEnvironmentalMetrics(impact);
      
      expect(result).toEqual({
        co2: '0.0 kg CO₂',
        water: '0 liters',
        energy: '0.0 kWh'
      });
    });
    
    it('rounds values correctly', () => {
      const impact = {
        co2Savings: 2.55,
        waterSavings: 100.49,
        energyConservation: 3.96
      };
      
      const result = formatEnvironmentalMetrics(impact);
      
      expect(result).toEqual({
        co2: '2.6 kg CO₂',
        water: '100 liters',
        energy: '4.0 kWh'
      });
    });
  });
}); 