/**
 * OptimizedImage.web.tsx
 * 
 * Web-specific implementation of the OptimizedImage component.
 * Implements web-optimized image loading with progressive enhancement.
 */

import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { OptimizedImageProps } from './OptimizedImage';

export function OptimizedImage({
  source,
  style,
  width,
  height,
  aspectRatio,
  resizeMode = 'cover',
  showPlaceholder = true,
  placeholderComponent,
  placeholderColor,
  fadeIn = true,
  fadeDuration = 300,
  onLoad,
  onError,
  blurRadius = 0,
  accessibilityLabel,
  testID,
  cacheEnabled = true,
  priority = 'normal',
  shouldCache = true,
}: OptimizedImageProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [opacity, setOpacity] = useState(fadeIn ? 0 : 1);
  const imageRef = useRef(null);
  
  // Get image source URL
  const imageUrl = typeof source === 'string' 
    ? source 
    : typeof source === 'number' 
      ? Image.resolveAssetSource(source).uri 
      : source.uri;
  
  // Set loading priority for web
  useEffect(() => {
    if (imageRef.current && priority !== 'normal') {
      const imgElement = imageRef.current;
      if (priority === 'high') {
        imgElement.fetchPriority = 'high';
        imgElement.loading = 'eager';
      } else if (priority === 'low') {
        imgElement.fetchPriority = 'low';
        imgElement.loading = 'lazy';
      }
    }
  }, [priority, imageRef]);
  
  const handleLoad = () => {
    setIsLoading(false);
    if (fadeIn) {
      // Animate opacity for fade-in effect
      setTimeout(() => {
        setOpacity(1);
      }, 10); // Small delay to ensure state update happens after render
    }
    onLoad?.();
  };
  
  const handleError = (error) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };
  
  // Calculate dimensions based on props
  const dimensionStyle = {};
  if (width !== undefined) {
    dimensionStyle.width = width;
  }
  if (height !== undefined) {
    dimensionStyle.height = height;
  }
  if (aspectRatio !== undefined) {
    dimensionStyle.aspectRatio = aspectRatio;
  }
  
  // Map resizeMode to object-fit CSS property
  const objectFitMap = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'fill',
    repeat: 'repeat',
    center: 'none'
  };
  
  // Set up placeholder color
  const placeholderColorValue = placeholderColor || theme.colors.placeholder || '#f0f0f0';
  
  // Web-specific styles
  const webStyles = {
    filter: blurRadius > 0 ? `blur(${blurRadius}px)` : undefined,
    objectFit: objectFitMap[resizeMode] || 'cover',
    opacity: opacity,
    transition: fadeIn ? `opacity ${fadeDuration}ms ease-in-out` : 'none',
  };
  
  // Render placeholder if needed
  const renderPlaceholder = () => {
    if (!showPlaceholder || !isLoading) return null;
    
    if (placeholderComponent) {
      return placeholderComponent;
    }
    
    return (
      <View 
        style={[
          styles.placeholder, 
          { backgroundColor: placeholderColorValue },
          dimensionStyle
        ]}
      >
        <ActivityIndicator 
          color={theme.colors.primary} 
          size="small"
        />
      </View>
    );
  };
  
  // Render error state
  const renderError = () => {
    if (!hasError) return null;
    
    return (
      <View 
        style={[
          styles.error, 
          { backgroundColor: theme.colors.error, opacity: 0.1 },
          dimensionStyle
        ]}
      />
    );
  };
  
  // Add loading attribute based on priority
  const loadingAttribute = priority === 'high' ? 'eager' : 'lazy';
  
  // Native Image component doesn't support all web features, so we need to use the img tag for web
  const imgElement = (
    <img
      ref={imageRef}
      src={imageUrl}
      style={{
        ...StyleSheet.flatten([styles.image, dimensionStyle, style]),
        ...webStyles,
      }}
      onLoad={handleLoad}
      onError={handleError}
      alt={accessibilityLabel || ''}
      data-testid={testID}
      loading={loadingAttribute}
      // Add width and height attributes for better Cumulative Layout Shift (CLS) performance
      width={typeof width === 'number' ? width : undefined}
      height={typeof height === 'number' ? height : undefined}
      // Add fetchpriority attribute based on priority
      fetchpriority={priority === 'high' ? 'high' : undefined}
      // Cache control with crossorigin
      crossOrigin={shouldCache ? 'anonymous' : undefined}
    />
  );
  
  return (
    <View style={[styles.container, dimensionStyle]}>
      {renderPlaceholder()}
      {renderError()}
      {!hasError && imgElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}); 