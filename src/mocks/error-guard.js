/**
 * Mock implementation of React Native's error-guard polyfill
 * This is a simplified version that provides the same API but avoids syntax issues
 */

// Simple console-based error handler
function reportFatalError(error) {
  console.error('Fatal:', error);
}

// Guard to catch errors in a function
function guard(fn) {
  return function guarded(...args) {
    try {
      return fn(...args);
    } catch (error) {
      reportFatalError(error);
    }
  };
}

// Main error handler setup
function setup() {
  // Setup global error handlers
  if (typeof window !== 'undefined') {
    window.onerror = function(message, url, lineNumber) {
      console.error('Global error: ', message, url, lineNumber);
      return true;
    };
    
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled promise rejection: ', event.reason);
    });
  }
}

// Noop function as a placeholder 
function handleException(e, isFatal) {
  if (isFatal) {
    reportFatalError(e);
  } else {
    console.error(e);
  }
}

// Export API similar to original implementation
module.exports = {
  reportFatalError,
  handleException,
  setup,
  guard,
}; 