import { BenchmarkScenarios } from '../../utils/BenchmarkScenarios';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/Performance');

describe('BenchmarkScenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs default scenario', async () => {
    const results = await BenchmarkScenarios.runScenario('default');
    
    expect(results).toEqual({
      latency: expect.any(Number),
      throughput: expect.any(Number),
      errorRate: expect.any(Number)
    });
  });

  it('tracks performance during scenario', async () => {
    await BenchmarkScenarios.runScenario('default');
    
    expect(PerformanceMonitor.trackResponseTime).toHaveBeenCalled();
  });

  it('handles invalid scenario', async () => {
    await expect(
      BenchmarkScenarios.runScenario('invalid')
    ).rejects.toThrow('Invalid scenario');
  });

  it('simulates load test', async () => {
    const results = await BenchmarkScenarios.runScenario('load');
    
    expect(results.throughput).toBeGreaterThan(0);
    expect(PerformanceMonitor.trackResponseTime).toHaveBeenCalledTimes(10);
  });

  it('simulates stress test', async () => {
    const results = await BenchmarkScenarios.runScenario('stress');
    
    expect(results.latency).toBeGreaterThan(0);
    expect(results.errorRate).toBeDefined();
  });
}); 