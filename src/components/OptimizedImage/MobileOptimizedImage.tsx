/**
 * MobileOptimizedImage.tsx
 * 
 * Mobile-specific implementation of the OptimizedImage component.
 * Uses expo-image with native optimizations.
 */

import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    useWindowDimensions,
    View
} from 'react-native';
import { convertResizeModeToContentFit, DEFAULT_BLURHASH, IMAGE_EXTENSIONS, OptimizedImageProps } from './shared';

// Import types conditionally to avoid web build errors
let FileSystem: any;
let Image: any;
let BlurView: any;
let manipulateAsync: any;
let SaveFormat: any;

// Dynamic imports for native components that might not exist on web
try {
  FileSystem = require('expo-file-system');
  Image = require('expo-image').Image;
  BlurView = require('expo-blur').BlurView;
  const ImageManipulator = require('expo-image-manipulator');
  manipulateAsync = ImageManipulator.manipulateAsync;
  SaveFormat = ImageManipulator.SaveFormat;
} catch (error) {
  console.warn('Native modules not available in this environment:', error);
}

// Cache headers for remote images
const CACHE_HEADERS = {
  'Cache-Control': 'max-age=31536000',
};

// Define cache directory only if FileSystem is available
const CACHE_DIRECTORY = FileSystem ? `${FileSystem.cacheDirectory}optimized_images/` : null;

// Optional imports that may not be available in all environments
let BlurView: any = null;
try {
  // Only import BlurView on supported platforms
  if (Platform.OS !== 'web') {
    const ExpoBlur = require('expo-blur');
    BlurView = ExpoBlur.BlurView;
  }
} catch (error) {
  console.warn('expo-blur is not available. Blur effects will be disabled.');
}

// Cache directory for optimized images
const CACHE_FOLDER = `${FileSystem.cacheDirectory}optimized-images/`;

// Ensure cache directory exists
async function ensureCacheDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
  }
}

// Initialize cache directory
ensureCacheDirectory().catch(err => {
  console.warn('Failed to create image cache directory:', err);
});

const MobileOptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  blurhash = DEFAULT_BLURHASH,
  transitionDuration = 300,
  priority = 'normal',
  lazyLoad = false,
  resizeMode,
  onLoad,
  onError,
  cachePolicy = 'memory-disk',
  blurRadius,
  optimizeQuality = true,
  progressiveRenderingEnabled = true,
  backgroundColor = '#f0f0f0',
  testID,
  showLoadingIndicator = false,
  onLoadStart,
  onLoadEnd,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSource, setOptimizedSource] = useState<string | null>(null);
  const [loadStartTime, setLoadStartTime] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  // Use resizeMode if provided (legacy support), otherwise use contentFit
  const effectiveContentFit = resizeMode 
    ? convertResizeModeToContentFit(resizeMode) as any
    : contentFit;

  // Parse the source into a usable URI
  const originalUri = useMemo(() => {
    if (typeof source === 'number') {
      return undefined; // Local require, can't optimize at runtime
    }

    if (typeof source === 'string') {
      return source;
    }

    return source.uri;
  }, [source]);

  // Function to generate a cached filename
  const getCacheFilename = useCallback((uri: string, width: number): string => {
    const extension = getFileExtension(uri);
    const filename = uri
      .split('/')
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, '_') || 'image';
    return `${filename}_w${width}${extension}`;
  }, []);

  // Get file extension from URI
  const getFileExtension = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    if (extension && IMAGE_EXTENSIONS.includes(`.${extension}`)) {
      return `.${extension}`;
    }
    return '.jpg'; // Default extension
  };

  // Optimize image source
  useEffect(() => {
    if (!originalUri || typeof source === 'number' || !FileSystem || !CACHE_DIRECTORY) {
      setOptimizedSource(null);
      setIsLoading(false);
      return;
    }

    const startTime = Date.now();
    setLoadStartTime(startTime);
    setIsLoading(true);
    
    const optimizeImage = async () => {
      try {
        // Calculate target width based on the container or screen width
        const styleObj = StyleSheet.flatten(style || {});
        const targetWidth = styleObj.width
          ? typeof styleObj.width === 'number'
            ? styleObj.width
            : screenWidth
          : screenWidth;

        // For remote images, check if we have a cached version
        if (originalUri.startsWith('http')) {
          const cacheKey = getCacheFilename(originalUri, targetWidth as number);
          const cachePath = `${CACHE_DIRECTORY}${cacheKey}`;

          // Check if cached version exists
          try {
            await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, {
              intermediates: true,
            });
            const info = await FileSystem.getInfoAsync(cachePath);
            
            if (info.exists) {
              setOptimizedSource(`file://${cachePath}`);
              setIsLoading(false);
              onLoad?.();
              return;
            }
          } catch (err) {
            console.log('Cache check error:', err);
          }

          // If no cached version, download and optimize
          try {
            // Record the asset for optimization recommendations
            // Note: since this component is optimized for performance, we don't want to fail
            // if AssetOptimizer is not available
            try {
              const AssetOptimizer = require('../../utils/performance/AssetOptimizer').default;
              AssetOptimizer.getInstance().recordAsset(
                originalUri,
                0, // AssetType.IMAGE
                0, // Size unknown until downloaded
                undefined, // Dimensions unknown until loaded
                undefined // Format unknown
              );
            } catch (e) {
              console.warn('AssetOptimizer not available:', e);
            }

            // Determine if we should optimize or use original
            if (optimizeQuality && targetWidth && manipulateAsync) {
              // Download image to temp location
              const tempDownloadPath = `${FileSystem.cacheDirectory}temp_download_${Date.now()}.jpg`;
              const download = await FileSystem.downloadAsync(
                originalUri,
                tempDownloadPath,
                {
                  headers: CACHE_HEADERS,
                }
              );

              if (download.status === 200) {
                // Resize and optimize
                const manipulateResult = await manipulateAsync(
                  tempDownloadPath,
                  [{ resize: { width: targetWidth as number } }],
                  {
                    format: SaveFormat.JPEG,
                    compress: 0.85, // Good balance of quality and size
                  }
                );

                // Move to proper cache location
                await FileSystem.moveAsync({
                  from: manipulateResult.uri,
                  to: cachePath,
                });

                // Clean up temp file
                await FileSystem.deleteAsync(tempDownloadPath, { idempotent: true });

                setOptimizedSource(`file://${cachePath}`);
                setIsLoading(false);
                onLoad?.();
                return;
              }
            }

            // If optimization failed or not requested, just download
            const download = await FileSystem.downloadAsync(
              originalUri,
              cachePath,
              {
                headers: CACHE_HEADERS,
              }
            );

            if (download.status === 200) {
              setOptimizedSource(`file://${cachePath}`);
              setIsLoading(false);
              onLoad?.();
              return;
            }
          } catch (err) {
            console.warn('Image optimization error:', err);
            // Fall back to original URI
            setOptimizedSource(originalUri);
            setIsLoading(false);
            onLoad?.();
          }
        } else {
          // Local file, just use as is
          setOptimizedSource(originalUri);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (err) {
        console.error('Image processing error:', err);
        setHasError(true);
        setIsLoading(false);
        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    optimizeImage();
  }, [originalUri, source, style, screenWidth, optimizeQuality, getCacheFilename, onLoad, onError]);

  // Handle expo-image props
  const imageProps = {
    contentFit: effectiveContentFit,
    cachePolicy,
    priority: priority as any, // 'low', 'normal', 'high' matches expo-image's priorities
    transition: { duration: transitionDuration },
    blurRadius,
    recyclingKey: testID,
    placeholder: typeof blurhash === 'string' ? { blurhash } : undefined,
  };
  
  // If Image is not available (e.g., on web), return a fallback
  if (!Image) {
    return (
      <View style={[styles.container, { backgroundColor }, style]} testID={`${testID}-container`}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor }, style]} testID={`${testID}-container`}>
      {isLoading && (
        <View style={[styles.loadingContainer, { opacity: isLoading ? 1 : 0 }]}>
          {placeholder && (
            <Image
              source={typeof placeholder === 'string' ? { uri: placeholder } : placeholder}
              style={StyleSheet.absoluteFill}
              contentFit={effectiveContentFit}
              testID={`${testID}-placeholder`}
            />
          )}
          
          {!placeholder && blurhash && BlurView && (
            <View style={StyleSheet.absoluteFill}>
              <BlurView 
                intensity={20} 
                style={StyleSheet.absoluteFill} 
                tint="light"
              />
            </View>
          )}

          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {(optimizedSource || typeof source === 'number') && (
        <Image
          source={optimizedSource ? { uri: optimizedSource } : source}
          style={StyleSheet.absoluteFill}
          testID={testID}
          onLoad={handleLoad}
          onError={(event: any) => handleError(new Error(event?.error || 'Image load failed'))}
          {...imageProps}
        />
      )}
    </View>
  );

  // Event handlers
  function handleLoad() {
    const loadTime = Date.now() - loadStartTime;
    console.log(`[OptimizedImage] Image loaded in ${loadTime}ms`);
    setIsLoading(false);
    onLoad?.();
    if (onLoadEnd) onLoadEnd();
  }

  function handleError(error: Error) {
    console.warn('[OptimizedImage] Failed to load image:', error);
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
    if (onLoadEnd) onLoadEnd();
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default MobileOptimizedImage; 