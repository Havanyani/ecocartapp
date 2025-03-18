import { AlertPrioritization } from '../../services/AlertPrioritization';

describe('AlertPrioritization', () => {
  it('calculates priority based on metric type', () => {
    const latencyAlert = {
      type: 'latency',
      value: 500,
      threshold: 200
    };

    expect(AlertPrioritization.calculatePriority(latencyAlert)).toBe('HIGH');
  });

  it('considers threshold deviation in priority', () => {
    const minorAlert = {
      type: 'latency',
      value: 220,
      threshold: 200
    };

    const majorAlert = {
      type: 'latency',
      value: 600,
      threshold: 200
    };

    expect(AlertPrioritization.calculatePriority(minorAlert)).toBe('LOW');
    expect(AlertPrioritization.calculatePriority(majorAlert)).toBe('HIGH');
  });

  it('handles different alert types appropriately', () => {
    const errorAlert = {
      type: 'error',
      value: 1,
      threshold: 0
    };

    expect(AlertPrioritization.calculatePriority(errorAlert)).toBe('CRITICAL');
  });
}); 