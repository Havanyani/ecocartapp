import { calculateDistance, formatCurrency, formatDate } from '../../utils/formatters';

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-03-20T09:00:00');
      expect(formatDate(date)).toBe('20 Mar 2024');
    });

    it('handles invalid date', () => {
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R 1,234.56');
    });

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('R 0.00');
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance correctly', () => {
      const distance = calculateDistance(
        { latitude: -33.9249, longitude: 18.4241 },
        { latitude: -33.9249, longitude: 18.4241 }
      );
      expect(distance).toBe(0);
    });

    it('handles invalid coordinates', () => {
      expect(calculateDistance(
        { latitude: 91, longitude: 181 },
        { latitude: 0, longitude: 0 }
      )).toBe(NaN);
    });
  });
}); 