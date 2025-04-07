import { useCallback, useEffect, useState } from 'react';

interface AppInitializationOptions {
  /**
   * Function to run when initialization starts
   */
  onInitializationStart?: () => void;
  
  /**
   * Function to run when initialization completes successfully
   */
  onInitializationComplete?: () => void | Promise<void>;
  
  /**
   * Function to run if initialization fails
   */
  onInitializationError?: (error: Error) => void;
  
  /**
   * Time in milliseconds to wait for initialization
   * Default is 5000ms (5 seconds)
   */
  timeout?: number;
}

/**
 * Hook to manage application initialization process
 * 
 * @param options Configuration options for initialization
 * @returns Object containing initialization state and any errors
 */
export function useAppInitialization(options: AppInitializationOptions = {}) {
  const { 
    onInitializationStart, 
    onInitializationComplete, 
    onInitializationError,
    timeout = 5000 
  } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    try {
      // Run initialization start callback if provided
      if (onInitializationStart) {
        onInitializationStart();
      }

      // Set a timeout to ensure we don't block forever
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('App initialization timed out'));
        }, timeout);
      });

      // Race against the timeout
      await Promise.race([
        // Artificial delay to ensure minimal initialization time
        // In a real app, this would be replaced with actual initialization tasks
        new Promise<void>(resolve => {
          setTimeout(resolve, 500);
        }),
        timeoutPromise
      ]);

      // If we made it here, initialization was successful
      setIsInitialized(true);
      
      // Run completion callback if provided
      if (onInitializationComplete) {
        await onInitializationComplete();
      }
    } catch (err) {
      // Handle any errors during initialization
      const thrownError = err instanceof Error ? err : new Error('Unknown error during initialization');
      setError(thrownError);
      
      // Run error callback if provided
      if (onInitializationError) {
        onInitializationError(thrownError);
      }
      
      // Still mark as initialized so the app can show an error screen instead of hanging
      setIsInitialized(true);
    }
  }, [onInitializationStart, onInitializationComplete, onInitializationError, timeout]);

  // Start initialization when the component mounts
  useEffect(() => {
    void initialize();
  }, [initialize]);

  return {
    isInitialized,
    error,
    // Re-run initialization if needed
    reinitialize: initialize
  };
} 