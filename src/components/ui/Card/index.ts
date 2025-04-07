/**
 * Card component index file
 * 
 * This file exports the platform-specific Card implementation
 * along with types for consistent usage across the application.
 */

// Export the platform-specific implementation
// The bundler will automatically select the right file:
// - Metro will choose Card.native.tsx for iOS/Android
// - Webpack will choose Card.web.tsx for web
// We export from the native version directly for now
// This will be correctly resolved by the bundlers for the appropriate platform
export { Card } from './Card.native';

// Export types for use throughout the app
export type { CardProps } from './Card';

