/**
 * OptimizedImage Component
 * 
 * A wrapper around expo-image that provides image optimization and caching.
 * 
 * TODO: Type Improvements
 * - Create proper type definitions for expo-image
 * - Fix type issues in OptimizedImageProps
 * - Add proper typing for style prop
 * - Add proper typing for contentFit prop
 * - Add proper typing for source prop
 * 
 * See: .github/ISSUES/performance-optimization.md for more details
 */

import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { performanceOptimizer } from '@/utils/PerformanceOptimizer';

interface OptimizedImageOptions {
  width?: number;
  height?: number;
  priority?: 'low' | 'normal' | 'high';
  placeholder?: string;
}

export function useOptimizedImage(
  url: string,
  options: OptimizedImageOptions = {}
) {
  const [imageUrl, setImageUrl] = useState<string>(url);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      try {
        setIsLoading(true);
        setError(null);

        // Optimize and cache the image
        const optimizedUrl = await performanceOptimizer.optimizeImage(url, {
          width: options.width,
          height: options.height,
        });

        if (isMounted) {
          setImageUrl(optimizedUrl);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load image'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [url, options.width, options.height]);

  return {
    imageUrl,
    isLoading,
    error,
  };
}

type OptimizedImageProps = {
  source: { uri: string } | string;
  style?: any;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
};

// @ts-ignore - TODO: Create proper type definitions for expo-image
export function OptimizedImage(props: OptimizedImageProps) {
  const uri = typeof props.source === 'string' ? props.source : props.source.uri;
  const { imageUrl, isLoading } = useOptimizedImage(uri);

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[props.style, isLoading && styles.loading]}
      contentFit={props.contentFit || 'cover'}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    opacity: 0.5,
  },
}); 