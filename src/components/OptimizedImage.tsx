/**
 * OptimizedImage.tsx
 * 
 * Backward compatibility wrapper for the platform-specific OptimizedImage component.
 * This ensures existing code using this component continues to work.
 */

import OptimizedImage from './OptimizedImage/index';
import type { OptimizedImageProps } from './OptimizedImage/shared';

export type { OptimizedImageProps };
export default OptimizedImage; 