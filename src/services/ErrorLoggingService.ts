import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

export interface ErrorContext {
  route?: string;
  component?: string;
  [key: string]: any;
}

export interface ErrorLog {
  id: string;
  error: Error;
  context: ErrorContext;
  timestamp: number;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByRoute: Record<string, number>;
  errorsByComponent: Record<string, number>;
}

const ERROR_STORAGE_KEY = '@error_logs';
const MAX_ERRORS = 100;

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private errors: ErrorLog[] = [];

  private constructor() {
    this.initialize();
  }

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const storedErrors = await AsyncStorage.getItem(ERROR_STORAGE_KEY);
      if (storedErrors) {
        this.errors = JSON.parse(storedErrors);
      }
    } catch (error) {
      console.error('Failed to load error logs:', error);
    }
  }

  private generateErrorId(error: Error): string {
    return `${error.name}-${error.message}-${Date.now()}`;
  }

  async logError(error: Error, context: ErrorContext = {}): Promise<void> {
    const errorLog: ErrorLog = {
      id: this.generateErrorId(error),
      error,
      context,
      timestamp: Date.now(),
    };

    this.errors.unshift(errorLog);

    // Keep only the most recent errors
    if (this.errors.length > MAX_ERRORS) {
      this.errors = this.errors.slice(0, MAX_ERRORS);
    }

    try {
      await AsyncStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(this.errors));
    } catch (error) {
      console.error('Failed to save error log:', error);
    }

    // Log to Sentry
    Sentry.captureException(error, {
      extra: {
        ...context,
        platform: Platform.OS,
        version: '1.0.0',
      },
    });
  }

  getErrorStats(): ErrorStats {
    const stats: ErrorStats = {
      totalErrors: this.errors.length,
      errorsByType: {},
      errorsByRoute: {},
      errorsByComponent: {},
    };

    this.errors.forEach((errorLog) => {
      // Count by error type
      const errorType = errorLog.error.name || 'Unknown';
      stats.errorsByType[errorType] = (stats.errorsByType[errorType] || 0) + 1;

      // Count by route
      if (errorLog.context.route) {
        stats.errorsByRoute[errorLog.context.route] = 
          (stats.errorsByRoute[errorLog.context.route] || 0) + 1;
      }

      // Count by component
      if (errorLog.context.component) {
        stats.errorsByComponent[errorLog.context.component] = 
          (stats.errorsByComponent[errorLog.context.component] || 0) + 1;
      }
    });

    return stats;
  }

  getRecentErrors(): ErrorLog[] {
    return this.errors;
  }

  async clearErrorLogs(): Promise<void> {
    this.errors = [];
    try {
      await AsyncStorage.removeItem(ERROR_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }
}

export default ErrorLoggingService.getInstance(); 