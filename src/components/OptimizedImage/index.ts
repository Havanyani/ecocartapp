/**
 * OptimizedImage/index.ts
 * 
 * Platform selector for the OptimizedImage component.
 * Exports the appropriate implementation based on the platform.
 */

import { Platform } from 'react-native';
import MobileOptimizedImage from './MobileOptimizedImage';
import WebOptimizedImage from './WebOptimizedImage';
import type { OptimizedImageProps } from './shared';

export type { OptimizedImageProps };

// Select the appropriate implementation based on platform
const OptimizedImage = Platform.select({
  web: WebOptimizedImage,
  default: MobileOptimizedImage,
});

export default OptimizedImage; 