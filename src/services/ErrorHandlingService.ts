import type { ErrorInfo } from 'react';

export class ErrorHandlingService {
  static logError(error: Error, errorInfo: ErrorInfo) {
    // Log to your error reporting service (e.g., Sentry)
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }
} 