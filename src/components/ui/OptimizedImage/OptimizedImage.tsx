/**
 * OptimizedImage.tsx
 * 
 * Shared interface for the OptimizedImage component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';

export interface OptimizedImageProps {
  /**
   * Source of the image. Can be a remote URL string, a local resource (require),
   * or an object with a uri property.
   */
  source: string | number | { uri: string } | any;
  
  /**
   * Additional style properties for the image.
   */
  style?: StyleProp<ImageStyle>;
  
  /**
   * Width of the image. Can be a number (pixels) or string percentage.
   */
  width?: number | string;
  
  /**
   * Height of the image. Can be a number (pixels) or string percentage.
   */
  height?: number | string;
  
  /**
   * Aspect ratio to maintain (width/height).
   */
  aspectRatio?: number;
  
  /**
   * How the image should be resized to fit its container.
   * @default 'cover'
   */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  
  /**
   * Whether to show a placeholder while the image is loading.
   * @default true
   */
  showPlaceholder?: boolean;
  
  /**
   * Custom component to use as a placeholder.
   */
  placeholderComponent?: React.ReactNode;
  
  /**
   * Background color of the default placeholder.
   */
  placeholderColor?: string;
  
  /**
   * Whether to fade in the image when it loads.
   * @default true
   */
  fadeIn?: boolean;
  
  /**
   * Duration of the fade-in animation in milliseconds.
   * @default 300
   */
  fadeDuration?: number;
  
  /**
   * Callback that is called when the image is successfully loaded.
   */
  onLoad?: () => void;
  
  /**
   * Callback that is called when the image fails to load.
   */
  onError?: (error: any) => void;
  
  /**
   * The blur radius of the image blur effect.
   */
  blurRadius?: number;
  
  /**
   * Accessibility label for the image.
   */
  accessibilityLabel?: string;
  
  /**
   * ID for testing.
   */
  testID?: string;
  
  /**
   * Whether to enable image caching.
   * @default true
   */
  cacheEnabled?: boolean;
  
  /**
   * Loading priority of the image.
   * @default 'normal'
   */
  priority?: 'low' | 'normal' | 'high';
  
  /**
   * Whether this specific image should be cached.
   * @default true
   */
  shouldCache?: boolean;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function OptimizedImage(props: OptimizedImageProps): JSX.Element {
  console.warn('OptimizedImage implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 