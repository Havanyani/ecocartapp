import {
    calculateCredits
} from '@/utils/CreditCalculator';

describe('CreditCalculator', () => {
  describe('calculateCredits', () => {
    it('calculates correct credits for PET plastic', () => {
      const result = calculateCredits({
        weight: 10,
        plasticType: 'PET',
        quality: 'clean'
      });

      // Base calculation: 10kg * R2.50 * 1.2 (clean multiplier) = R30
      // Bonus calculation: R30 * 0.1 (10kg tier) = R3
      expect(result.credits).toBe(30);
      expect(result.bonusCredits).toBe(3);
      expect(result.totalCredits).toBe(33);
    });

    it('applies correct quality multipliers', () => {
      const cleanResult = calculateCredits({
        weight: 5,
        plasticType: 'HDPE',
        quality: 'clean'
      });

      const mixedResult = calculateCredits({
        weight: 5,
        plasticType: 'HDPE',
        quality: 'mixed'
      });

      const contaminatedResult = calculateCredits({
        weight: 5,
        plasticType: 'HDPE',
        quality: 'contaminated'
      });
    });
  });
}); 