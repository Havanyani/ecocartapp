/**
 * WebOptimizedImage.tsx
 * 
 * Web-specific implementation of the OptimizedImage component.
 * Uses React Native Web's Image component with web-specific optimizations.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { convertResizeModeToContentFit, OptimizedImageProps } from './shared';

// Web-specific styles that will be applied via className
const webStyles = `
.optimized-image-container {
  position: relative;
  overflow: hidden;
}

.optimized-image {
  transition: opacity 0.3s ease;
}

.optimized-image.lazy-load {
  opacity: 0;
}

.optimized-image.loaded {
  opacity: 1;
}
`;

const WebOptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  blurhash,
  transitionDuration = 300,
  priority = 'normal',
  lazyLoad = false,
  resizeMode,
  onLoad,
  onError,
  blurRadius,
  optimizeQuality = true,
  progressiveRenderingEnabled = true,
  backgroundColor = '#f0f0f0',
  testID,
  showLoadingIndicator = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime] = useState(Date.now());
  const imageRef = useRef<HTMLImageElement>(null);

  // Use resizeMode if provided (legacy support), otherwise use contentFit
  const effectiveContentFit = resizeMode 
    ? convertResizeModeToContentFit(resizeMode) 
    : contentFit;

  // Process the source to a format React Native Web can use
  const processedSource = useMemo(() => {
    if (typeof source === 'number') {
      return source; // Local require
    }
    
    if (typeof source === 'string') {
      return { uri: source };
    }
    
    return source;
  }, [source]);

  // Handle successful load
  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
    
    // Track image load performance
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = Date.now() - loadStartTime;
      console.log(`[OptimizedImage] Image loaded in ${loadTime}ms`);
      
      // Report to performance monitoring if available
      if (window.performance.mark) {
        window.performance.mark(`image-load-${testID || 'unnamed'}`);
      }
    }
    
    onLoad?.();
  };

  // Handle error
  const handleError = (error: Error) => {
    setIsLoading(false);
    setHasError(true);
    console.warn('[OptimizedImage] Failed to load image:', error);
    onError?.(error);
  };

  // Set up IntersectionObserver for lazy loading on web
  useEffect(() => {
    if (!lazyLoad || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observerOptions = {
      rootMargin: '200px 0px', // Start loading 200px before it comes into view
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // When image is in viewport, load it by setting data-src to src
        const imgElement = document.getElementById(testID || 'optimized-image');
        if (imgElement) {
          const dataSrc = imgElement.getAttribute('data-src');
          if (dataSrc) {
            imgElement.setAttribute('src', dataSrc);
            imgElement.removeAttribute('data-src');
          }
        }
        
        // Disconnect after triggering load
        observer.disconnect();
      }
    }, observerOptions);

    // Start observing the image element
    setTimeout(() => {
      const imgElement = document.getElementById(testID || 'optimized-image');
      if (imgElement) {
        observer.observe(imgElement);
      }
    }, 0);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, testID]);

  // Generate srcSet for responsive images if source is remote URL
  const srcSet = useMemo(() => {
    if (typeof processedSource === 'object' && processedSource.uri?.startsWith('http')) {
      const uri = processedSource.uri;
      
      // Get image dimensions from URL if possible
      const width = style && typeof style === 'object' && 'width' in style
        ? style.width as number
        : 0;
      
      if (width && width > 0) {
        // Create srcSet for different screen densities
        return [
          `${uri} 1x`,
          `${uri} 2x`,
          `${uri} 3x`,
        ].join(', ');
      }
      
      return undefined;
    }
    
    return undefined;
  }, [processedSource, style]);

  // Set appropriate loading attribute based on priority
  const loadingAttribute = useMemo(() => {
    if (!lazyLoad) return 'eager';
    
    switch (priority) {
      case 'high':
        return 'eager';
      case 'low':
        return 'lazy';
      case 'normal':
      default:
        return 'lazy';
    }
  }, [lazyLoad, priority]);

  // Add web-specific loading optimization attributes
  const webProps = {
    loading: loadingAttribute,
    decoding: priority === 'high' ? 'sync' : 'async',
    // Use fetchPriority if supported by browser
    fetchpriority: priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'auto',
  };

  // Create style element for web-specific CSS if it doesn't exist
  useEffect(() => {
    const styleId = 'optimized-image-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = webStyles;
      document.head.appendChild(styleElement);
    }

    // Set up intersection observer for lazy loading if enabled
    if (lazyLoad && imageRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '200px' }
      );

      observer.observe(imageRef.current);

      return () => {
        if (imageRef.current) {
          observer.unobserve(imageRef.current);
        }
      };
    }
  }, [lazyLoad]);

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]} 
      testID={`${testID}-container`}
    >
      {/* Placeholder shown until main image loads */}
      {isLoading && placeholder && (
        <Image
          source={typeof placeholder === 'string' ? { uri: placeholder } : placeholder}
          style={StyleSheet.absoluteFill}
          testID={`${testID}-placeholder`}
          // @ts-ignore - resizeMode is valid for React Native Web
          resizeMode={effectiveContentFit}
        />
      )}
      
      {/* Show loading indicator if enabled */}
      {isLoading && showLoadingIndicator && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" color="#999999" />
        </View>
      )}
      
      {/* Main image */}
      <Image
        source={processedSource}
        style={StyleSheet.absoluteFill}
        // @ts-ignore - resizeMode is valid for React Native Web
        resizeMode={effectiveContentFit}
        onLoad={handleLoad}
        onError={handleError}
        id={testID || 'optimized-image'}
        // For lazy loading, we set data-src instead of src
        data-src={lazyLoad ? (typeof processedSource === 'object' ? processedSource.uri : '') : undefined}
        srcSet={srcSet}
        testID={testID}
        // Apply web-specific styles
        // @ts-ignore - These props are valid for React Native Web but not in types
        style={{
          ...StyleSheet.flatten(StyleSheet.absoluteFill),
          opacity: isLoaded ? 1 : 0,
        }}
        // @ts-ignore - These props are for React Native Web specifically
        css={{
          transition: `opacity ${transitionDuration}ms ease-in-out`,
          filter: blurRadius ? `blur(${blurRadius}px)` : undefined,
        }}
        // Add web-specific props
        {...webProps}
        {...props}
        // @ts-ignore - React Native Web specific props
        className={`optimized-image ${lazyLoad ? 'lazy-load' : ''} ${isLoaded ? 'loaded' : ''}`}
        // @ts-ignore - React Native Web specific props
        crossOrigin="anonymous"
      />
      
      {/* Error state */}
      {hasError && (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          <View style={styles.errorIcon}>
            <View style={styles.errorIconInner} />
          </View>
          <View style={styles.errorText}>
            {/* Simple error UI to indicate failed load */}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#bbb',
  },
  errorText: {
    marginTop: 8,
    color: '#999',
  },
});

export default WebOptimizedImage; 