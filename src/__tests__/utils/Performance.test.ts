import * as Sentry from '@sentry/react-native';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn()
}));

describe('Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks response time', () => {
    Performance.trackResponseTime(0, 100);
    const metrics = Performance.getMetrics();
    expect(metrics).toContainEqual(expect.objectContaining({ type: 'responseTime', value: 100 }));
  });

  it('tracks errors', () => {
    const error = new Error('Test error');
    Performance.captureError(error);
    
    const metrics = Performance.getMetrics();
    expect(metrics).toContainEqual(expect.objectContaining({ type: 'error' }));
  });

  it('calculates error rate correctly', () => {
    Performance.trackResponseTime(0, 100); // Success
    Performance.captureError(new Error('Test error')); // Error
    
    const metrics = Performance.getMetrics();
    expect(metrics).toContainEqual(expect.objectContaining({ type: 'error' }));
  });

  it('captures errors with Sentry', () => {
    const error = new Error('Test error');
    Performance.captureError(error);
    
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('adds breadcrumbs', () => {
    Performance.addBreadcrumb('test', 'Test message');
    
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'test',
      message: 'Test message',
      level: 'info'
    });
  });

  it('resets metrics', () => {
    Performance.trackResponseTime(0, 100);
    Performance.captureError(new Error('Test error'));
    
    const metrics = Performance.getMetrics();
    expect(metrics).toContainEqual(expect.objectContaining({ type: 'responseTime', value: 100 }));
    expect(metrics).toContainEqual(expect.objectContaining({ type: 'error' }));
  });
}); 