/**
 * Button component index file
 * 
 * This file exports the platform-specific Button implementation
 * along with types for consistent usage across the application.
 */

// Export the platform-specific implementation
// The bundler will automatically select the right file:
// - Metro will choose Button.native.tsx for iOS/Android
// - Webpack will choose Button.web.tsx for web
export { Button } from './Button';

// Export types for use throughout the app
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';

