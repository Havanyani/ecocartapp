/**
 * OptimizedImage.native.tsx
 * 
 * Native-specific implementation of the OptimizedImage component.
 * Uses expo-image for optimized loading and caching.
 */

import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
// Workaround for TypeScript issues with reanimated
// Can be removed when the project updates reanimated to a version that properly supports named exports
import useAnimatedStyle from 'react-native-reanimated/lib/useAnimatedStyle';
import useSharedValue from 'react-native-reanimated/lib/useSharedValue';
import withTiming from 'react-native-reanimated/lib/withTiming';
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
  blurRadius,
  accessibilityLabel,
  testID,
  cacheEnabled = true,
  priority = 'normal',
  shouldCache = true,
}: OptimizedImageProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Setup animation for fade-in effect
  const opacity = useSharedValue(fadeIn ? 0 : 1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  const handleLoad = () => {
    setIsLoading(false);
    if (fadeIn) {
      opacity.value = withTiming(1, { duration: fadeDuration });
    }
    onLoad?.();
  };
  
  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };
  
  // Calculate dimensions based on props
  const dimensionStyle: any = {};
  if (width !== undefined) {
    dimensionStyle.width = width;
  }
  if (height !== undefined) {
    dimensionStyle.height = height;
  }
  if (aspectRatio !== undefined) {
    dimensionStyle.aspectRatio = aspectRatio;
  }
  
  // Determine caching strategy
  const cachePolicy = shouldCache ? 'memory-disk' : 'none';
  
  // Set up placeholder color - fallback to light gray if theme doesn't have placeholder color
  const placeholderColorValue = placeholderColor || (theme.colors as any).placeholder || '#f0f0f0';
  
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
  
  // Map our resizeMode to Image's contentFit
  const contentFitMap: Record<string, any> = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'fill',
    repeat: 'repeat',
    center: 'center'
  };
  
  // Apply contentFit based on resizeMode
  const contentFit = contentFitMap[resizeMode] || 'cover';
  
  return (
    <View style={[styles.container, dimensionStyle]}>
      {renderPlaceholder()}
      {renderError()}
      {!hasError && (
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={source}
            style={[styles.image, style]}
            contentFit={contentFit}
            transition={fadeIn ? fadeDuration : 0}
            cachePolicy={cachePolicy}
            priority={priority}
            accessible={!!accessibilityLabel}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            blurRadius={blurRadius}
            onLoad={handleLoad}
            onError={handleError}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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