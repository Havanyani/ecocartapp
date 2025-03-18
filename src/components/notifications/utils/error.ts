import type { ErrorInfo } from 'react';

export interface AlertError extends Error {
  code?: string;
  info?: ErrorInfo;
}

export function createAlertError(message: string, code?: string): AlertError {
  const error = new Error(message) as AlertError;
  error.code = code;
  return error;
}

export function handleAnimationError(error: AlertError): void {
  console.error('Animation error:', {
    message: error.message,
    code: error.code,
    info: error.info,
  });
} 