/**
 * RetryManager.ts
 * Utility for managing retry attempts for network requests and other operations
 * that may fail temporarily and need automatic retries.
 */

// Configuration options for the RetryManager
export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  factor: number; // exponential backoff factor
  jitter: boolean; // add randomness to delay
  retryableErrors?: (string | RegExp)[]; // error messages or patterns that should trigger retries
  onRetry?: (attempt: number, error: Error, delay: number) => void; // callback on each retry
}

// Result of a retry operation
export interface RetryResult<T> {
  success: boolean;
  value?: T;
  error?: Error;
  attempts: number;
  totalTime: number; // in milliseconds
}

/**
 * Manages retry logic for operations that might fail temporarily
 */
export default class RetryManager {
  private options: RetryOptions;

  /**
   * Creates a new RetryManager instance
   * @param options Configuration options for retries
   */
  constructor(options?: Partial<RetryOptions>) {
    // Default retry options
    this.options = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      factor: 2,
      jitter: true,
      ...options
    };
  }

  /**
   * Executes an operation with retry logic
   * @param operation The async operation to retry
   * @param options Override default retry options
   * @returns Result of the operation with metadata
   */
  async execute<T>(
    operation: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<RetryResult<T>> {
    const mergedOptions: RetryOptions = { ...this.options, ...options };
    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | undefined;

    while (attempts < mergedOptions.maxAttempts) {
      attempts++;
      
      try {
        const result = await operation();
        return {
          success: true,
          value: result,
          attempts,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry this error
        if (!this.isRetryableError(lastError, mergedOptions)) {
          break;
        }
        
        // Don't wait on the last attempt
        if (attempts >= mergedOptions.maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempts, mergedOptions);
        
        // Call onRetry callback if provided
        if (mergedOptions.onRetry) {
          mergedOptions.onRetry(attempts, lastError, delay);
        }
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Creates a retryable version of an async function
   * @param fn Function to make retryable
   * @param options Retry options
   * @returns A wrapped function that will automatically retry on failure
   */
  retryable<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    options?: Partial<RetryOptions>
  ): (...args: Args) => Promise<T> {
    return async (...args: Args) => {
      const result = await this.execute(
        () => fn(...args),
        options
      );
      
      if (!result.success) {
        throw result.error;
      }
      
      return result.value as T;
    };
  }

  /**
   * Calculate delay time using exponential backoff with optional jitter
   * @param attempt Current attempt number (1-based)
   * @param options Retry options
   * @returns Delay time in milliseconds
   */
  private calculateDelay(attempt: number, options: RetryOptions): number {
    // Calculate exponential backoff
    let delay = options.initialDelay * Math.pow(options.factor, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, options.maxDelay);
    
    // Add jitter if enabled (±20% randomness)
    if (options.jitter) {
      const jitterFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2 range for jitter
      delay = Math.floor(delay * jitterFactor);
    }
    
    return delay;
  }

  /**
   * Determine if an error should trigger a retry based on configuration
   * @param error The error that occurred
   * @param options Retry options
   * @returns Whether the error is retryable
   */
  private isRetryableError(error: Error, options: RetryOptions): boolean {
    // If no specific errors are defined, all errors are retryable
    if (!options.retryableErrors || options.retryableErrors.length === 0) {
      return true;
    }
    
    const errorMessage = error.message || '';
    
    // Check if error message matches any of the retryable patterns
    return options.retryableErrors.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(errorMessage);
      }
      return errorMessage.includes(pattern);
    });
  }
} 