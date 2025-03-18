import { ErrorHandlingService } from '@services/ErrorHandlingService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/Performance');

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs errors with context', () => {
    const error = new Error('Test error');
    const errorInfo = {
      componentStack: '\n    at Component\n    at App',
      digest: 'digest'
    };

    ErrorHandlingService.logError(error, errorInfo);

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
        componentStack: expect.stringContaining('at Component'),
        digest: 'digest'
      })
    );
  });

  it('handles errors without additional info', () => {
    const error = new Error('Simple error');

    ErrorHandlingService.logError(error);

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Simple error'
      })
    );
  });

  it('preserves error stack trace', () => {
    const error = new Error('Stack trace test');
    error.stack = 'Error: Stack trace test\n    at Test';

    ErrorHandlingService.logError(error);

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Stack trace test',
        stack: expect.stringContaining('at Test')
      })
    );
  });

  it('handles non-Error objects', () => {
    const errorObject = {
      message: 'Custom error',
      code: 'CUSTOM_ERROR'
    };

    ErrorHandlingService.logError(errorObject);

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error',
        code: 'CUSTOM_ERROR'
      })
    );
  });

  it('includes timestamp in logged errors', () => {
    const error = new Error('Timestamp test');

    ErrorHandlingService.logError(error);

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Timestamp test',
        timestamp: expect.any(Number)
      })
    );
  });
}); 