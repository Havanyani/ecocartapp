import {
    calculateCO2Savings,
    calculateEnergyConservation,
    calculateWaterSavings,
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
}); 