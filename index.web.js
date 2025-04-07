/**
 * Web entry point for EcoCart
 * This file is only used in web builds as an alternative to Expo Router
 */
import { registerRootComponent } from 'expo';
import App from './App.web';
import './src/utils/webPatches'; // Apply any web-specific patches

// Apply global error handling
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error handler:', message, source, lineno, colno);
    // Return true to prevent default error handling
    return true;
  };
  
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    // Prevent default handling
    event.preventDefault();
  });
}

// Register the app component
registerRootComponent(App); 