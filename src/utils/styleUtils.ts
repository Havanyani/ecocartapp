import React from 'react';
import { Dimensions, Platform, ScaledSize, StyleSheet } from 'react-native';

/**
 * Creates cross-platform shadow styles
 * 
 * For native platforms (iOS and Android), this uses the standard shadow* properties.
 * For web, it converts these to appropriate boxShadow CSS.
 * 
 * @param options Shadow configuration options
 * @returns Platform-specific shadow style object
 */
export function createShadow({
  color = '#000',
  offsetX = 0,
  offsetY = 2,
  opacity = 0.1,
  radius = 4,
  elevation = 2,
}) {
  if (Platform.OS === 'web') {
    // On web, we need to use boxShadow with CSS format
    // Convert RGBA to CSS rgba() function
    const rgbaColor = color === 'transparent' 
      ? 'rgba(0,0,0,0)' 
      : `rgba(0,0,0,${opacity})`;
    
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${rgbaColor}`,
    };
  }
  
  // For iOS we use the shadow* properties
  const iOSShadow = {
    shadowColor: color,
    shadowOffset: {
      width: offsetX,
      height: offsetY,
    },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
  
  // For Android we primarily use elevation, but also include shadow props for consistency
  if (Platform.OS === 'android') {
    return {
      ...iOSShadow,
      elevation,
    };
  }
  
  return iOSShadow;
}

/**
 * Utility to add elevation to Android components
 */
export function createElevation(elevation = 2) {
  return Platform.OS === 'android' ? { elevation } : {};
}

/**
 * Creates platform-specific styles
 * 
 * @param styles Object containing style definitions for different platforms
 * @returns Platform-specific style object
 */
export function createPlatformStyles({
  common = {},
  ios = {},
  android = {},
  web = {},
}) {
  let platformSpecific = {};
  
  if (Platform.OS === 'ios') {
    platformSpecific = ios;
  } else if (Platform.OS === 'android') {
    platformSpecific = android;
  } else if (Platform.OS === 'web') {
    platformSpecific = web;
  }
  
  return StyleSheet.create({
    ...common,
    ...platformSpecific,
  });
}

/**
 * Enhanced version of Platform.select that provides better TypeScript support
 * and allows for a default value
 * 
 * @param options Object with platform-specific values
 * @returns The value for the current platform
 */
export function platformSelect<T>({
  ios,
  android,
  web,
  default: defaultValue,
}: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T {
  if (Platform.OS === 'ios' && ios !== undefined) return ios;
  if (Platform.OS === 'android' && android !== undefined) return android;
  if (Platform.OS === 'web' && web !== undefined) return web;
  return defaultValue;
}

/**
 * Screen size breakpoints for responsive design
 */
export const breakpoints = {
  small: 375, // Small phone
  medium: 768, // Large phone / small tablet
  large: 992, // Tablet
  xlarge: 1200, // Desktop
};

/**
 * Screen dimension types for responsive styles
 */
export type ScreenDimensions = {
  window: ScaledSize;
  screen: ScaledSize;
};

/**
 * Creates responsive styles based on screen width
 * 
 * @param styles Object containing style definitions for different screen sizes
 * @returns StyleSheet with the appropriate styles for the current screen size
 */
export function createResponsiveStyles<T>({
  base,
  small,
  medium,
  large,
  xlarge,
}: {
  base: T; // Required base styles
  small?: Partial<T>; // Overrides for small screens and up
  medium?: Partial<T>; // Overrides for medium screens and up
  large?: Partial<T>; // Overrides for large screens and up
  xlarge?: Partial<T>; // Overrides for extra large screens and up
}) {
  // Get the window dimensions
  const { width } = Dimensions.get('window');
  
  // Start with base styles
  let responsiveStyles = { ...base };
  
  // Apply styles for each breakpoint if the screen is wide enough
  if (small && width >= breakpoints.small) {
    responsiveStyles = { ...responsiveStyles, ...small };
  }
  
  if (medium && width >= breakpoints.medium) {
    responsiveStyles = { ...responsiveStyles, ...medium };
  }
  
  if (large && width >= breakpoints.large) {
    responsiveStyles = { ...responsiveStyles, ...large };
  }
  
  if (xlarge && width >= breakpoints.xlarge) {
    responsiveStyles = { ...responsiveStyles, ...xlarge };
  }
  
  return StyleSheet.create(responsiveStyles as any);
}

/**
 * Hook to get the current screen dimensions and update on changes
 * 
 * @returns Current window and screen dimensions
 */
export function useScreenDimensions(): ScreenDimensions {
  const [dimensions, setDimensions] = React.useState<ScreenDimensions>({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
    });
    
    return () => subscription?.remove();
  }, []);

  return dimensions;
} 