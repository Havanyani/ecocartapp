import { Alert } from 'react-native';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorDetails {
  code?: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ErrorLogEntry extends ErrorDetails {
  stackTrace?: string;
}

export enum ErrorCodes {
  AUTH_ERROR = 'AUTH_ERROR',
  REGISTRATION_ERROR = 'REGISTRATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class AppError extends Error {
  constructor(
    public code: ErrorCodes,
    message?: string
  ) {
    super(message || code);
    this.name = 'AppError';
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorLogEntry[] = [];
  private readonly maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with appropriate logging and user feedback
   */
  handleError(error: Error, details: Partial<ErrorDetails> = {}): void {
    const errorDetails: ErrorLogEntry = {
      message: error.message,
      severity: details.severity || 'medium',
      timestamp: new Date(),
      stackTrace: error.stack,
      ...details,
    };

    this.logError(errorDetails);

    if (errorDetails.severity === 'critical') {
      this.showErrorAlert(errorDetails);
    }
  }

  /**
   * Handle an async operation with error handling
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    errorDetails: Partial<ErrorDetails> = {}
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error as Error, errorDetails);
      return undefined;
    }
  }

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(
    operation: () => Promise<void>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        await operation();
        return true;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          this.handleError(error as Error, {
            severity: 'high',
            context: { attempts, maxAttempts },
          });
          return false;
        }
        await this.delay(delayMs * attempts); // Exponential backoff
      }
    }

    return false;
  }

  /**
   * Get recent errors for analysis
   */
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  private logError(error: ErrorLogEntry): void {
    // Add to in-memory log with size limit
    this.errorLog.push(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (__DEV__) {
      console.error('Error:', {
        message: error.message,
        severity: error.severity,
        timestamp: error.timestamp,
        context: error.context,
        stackTrace: error.stackTrace,
      });
    }

    // Here you could add integration with external error tracking services
    // like Sentry, Firebase Crashlytics, etc.
  }

  private showErrorAlert(error: ErrorDetails): void {
    Alert.alert(
      'Error',
      error.message,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      {
        cancelable: true,
      }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const errorHandler = ErrorHandler.getInstance(); 