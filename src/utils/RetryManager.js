import { PerformanceMonitor } from './PerformanceMonitoring';

export class RetryManager {
  static MAX_RETRIES = 3;
  static BACKOFF_MULTIPLIER = 1.5;
  static INITIAL_DELAY = 1000;

  static async executeWithRetry(operation, options = {}) {
    const maxRetries = options.maxRetries || this.MAX_RETRIES;
    const initialDelay = options.initialDelay || this.INITIAL_DELAY;
    let currentDelay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          PerformanceMonitor.captureError(error, {
            attempt,
            maxRetries
          });
          throw error;
        }

        if (!this.shouldRetry(error)) {
          throw error;
        }

        await this.delay(currentDelay);
        currentDelay *= this.BACKOFF_MULTIPLIER;
        
        PerformanceMonitor.addBreadcrumb('retry', 
          `Attempt ${attempt} failed, retrying in ${currentDelay}ms`);
      }
    }
  }

  private static shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return (
      error.name === 'NetworkError' ||
      (error.response && error.response.status >= 500)
    );
  }

  private static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 