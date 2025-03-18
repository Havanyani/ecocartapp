import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/Performance', () => ({
  PerformanceMonitor: {
    captureError: jest.fn(),
    getMetrics: jest.fn().mockReturnValue([])
  }
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should capture errors', () => {
    const error = new Error('Test error');
    PerformanceMonitor.captureError(error);
    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(error);
  });

  it('should get metrics', () => {
    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics).toBeDefined();
    expect(Array.isArray(metrics)).toBe(true);
  });
}); 