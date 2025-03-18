import { EnvironmentalImpactService } from '../../services/EnvironmentalImpactService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/Performance');

describe('EnvironmentalImpactService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateImpact', () => {
    it('calculates impact correctly for PET plastic', () => {
      const weight = 10; // kg
      const impact = EnvironmentalImpactService.calculateImpact(weight, 'PET');

      expect(impact).toEqual({
        plasticSaved: 9.5, // 10 * 0.95 (efficiency)
        co2Reduced: 36.1, // 9.5 * 3.8
        treesEquivalent: 1.64, // 36.1 / 22
        oceanWastePrevented: 12, // 10 * 1.2
        energySaved: 55.1, // 9.5 * 5.8
        waterConserved: 156.75, // 9.5 * 16.5
        landfillSpaceSaved: 0.04 // 10 * 0.004
      });
    });

    it('uses default plastic type when not specified', () => {
      const weight = 5;
      const impactWithType = EnvironmentalImpactService.calculateImpact(weight, 'PET');
      const impactDefault = EnvironmentalImpactService.calculateImpact(weight);

      expect(impactWithType).toEqual(impactDefault);
    });

    it('handles different plastic types correctly', () => {
      const weight = 10;
      const petImpact = EnvironmentalImpactService.calculateImpact(weight, 'PET');
      const hdpeImpact = EnvironmentalImpactService.calculateImpact(weight, 'HDPE');

      expect(petImpact.co2Reduced).toBeGreaterThan(hdpeImpact.co2Reduced);
      expect(petImpact.recyclingEfficiency).toBeGreaterThan(hdpeImpact.recyclingEfficiency);
    });

    it('handles zero weight correctly', () => {
      const impact = EnvironmentalImpactService.calculateImpact(0, 'PET');

      expect(impact.plasticSaved).toBe(0);
      expect(impact.co2Reduced).toBe(0);
      expect(impact.treesEquivalent).toBe(0);
      expect(impact.oceanWastePrevented).toBe(0);
      expect(impact.energySaved).toBe(0);
      expect(impact.waterConserved).toBe(0);
      expect(impact.landfillSpaceSaved).toBe(0);
    });
  });

  describe('calculateCumulativeImpact', () => {
    it('calculates cumulative impact for multiple collections', () => {
      const collections = [
        { weight: 5, plasticType: 'PET' },
        { weight: 3, plasticType: 'HDPE' },
        { weight: 4, plasticType: 'PP' }
      ];

      const impact = EnvironmentalImpactService.calculateCumulativeImpact(collections);

      expect(impact.plasticSaved).toBeGreaterThan(0);
      expect(impact.co2Reduced).toBeGreaterThan(0);
      expect(impact.treesEquivalent).toBeGreaterThan(0);
      expect(impact.oceanWastePrevented).toBeGreaterThan(0);
      expect(impact.energySaved).toBeGreaterThan(0);
      expect(impact.waterConserved).toBeGreaterThan(0);
      expect(impact.landfillSpaceSaved).toBeGreaterThan(0);
    });

    it('handles empty collections array', () => {
      const impact = EnvironmentalImpactService.calculateCumulativeImpact([]);

      expect(impact.plasticSaved).toBe(0);
      expect(impact.co2Reduced).toBe(0);
      expect(impact.treesEquivalent).toBe(0);
      expect(impact.oceanWastePrevented).toBe(0);
      expect(impact.energySaved).toBe(0);
      expect(impact.waterConserved).toBe(0);
      expect(impact.landfillSpaceSaved).toBe(0);
    });
  });

  describe('generateImpactReport', () => {
    it('generates formatted report string', () => {
      const metrics = {
        plasticSaved: 10,
        co2Reduced: 38,
        treesEquivalent: 1.727,
        oceanWastePrevented: 12,
        energySaved: 58,
        waterConserved: 165,
        landfillSpaceSaved: 0.04
      };

      const report = EnvironmentalImpactService.generateImpactReport(metrics);

      expect(report).toContain('Plastic Saved: 10.00 kg');
      expect(report).toContain('CO₂ Emissions Reduced: 38.00 kg');
      expect(report).toContain('Equivalent to 1.73 trees planted');
      expect(report).toContain('Ocean Waste Prevented: 12.00 kg');
      expect(report).toContain('Energy Saved: 58.00 kWh');
      expect(report).toContain('Water Conserved: 165.00 L');
      expect(report).toContain('Landfill Space Saved: 0.0400 m³');
    });
  });

  describe('error handling', () => {
    it('handles calculation errors gracefully', () => {
      const invalidWeight = -1;
      
      expect(() => {
        EnvironmentalImpactService.calculateImpact(invalidWeight);
      }).toThrow('Failed to calculate environmental impact');
      
      expect(Performance.captureError).toHaveBeenCalled();
    });

    it('handles cumulative calculation errors', () => {
      const invalidCollections = [
        { weight: -5, plasticType: 'PET' }
      ];

      expect(() => {
        EnvironmentalImpactService.calculateCumulativeImpact(invalidCollections);
      }).toThrow('Failed to calculate cumulative impact');
      
      expect(Performance.captureError).toHaveBeenCalled();
    });
  });
});