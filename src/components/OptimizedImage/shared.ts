/**
 * OptimizedImage/shared.ts
 * 
 * Shared types and utilities for the OptimizedImage component.
 * Used by both mobile and web implementations.
 */

import { ImageProps, ImageSourcePropType, ImageURISource } from 'react-native';

// Blur hash used when no blurhash is provided
export const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Optimization quality levels
export enum OptimizationQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ORIGINAL = 'original'
}

// Additional props for OptimizedImage component
export interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType;
  placeholder?: ImageSourcePropType;
  blurhash?: string;
  showLoadingIndicator?: boolean;
  optimizationQuality?: OptimizationQuality;
  cachePolicy?: 'memory' | 'disk' | 'none';
  priority?: 'low' | 'normal' | 'high';
  lazyLoad?: boolean;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  transition?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

// Helper to check if a source is a remote URI
export function isRemoteSource(source: ImageSourcePropType): boolean {
  if (!source) return false;
  
  const uriSource = source as ImageURISource;
  return !!uriSource.uri && uriSource.uri.startsWith('http');
}

// Helper to extract URI from source
export function getSourceURI(source: ImageSourcePropType): string | null {
  if (!source) return null;
  
  if (typeof source === 'number') {
    // Local require() image
    return null;
  }
  
  const uriSource = source as ImageURISource;
  return uriSource.uri || null;
} 