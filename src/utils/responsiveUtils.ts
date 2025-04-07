import { useEffect, useState } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

/**
 * Screen size breakpoints (in logical pixels)
 */
export const ScreenBreakpoints = {
  SMALL_PHONE: 320,  // e.g. iPhone SE
  PHONE: 375,        // e.g. iPhone X/11/12
  LARGE_PHONE: 428,  // e.g. iPhone Pro Max
  SMALL_TABLET: 744, // e.g. iPad Mini
  TABLET: 768,       // e.g. iPad
  LARGE_TABLET: 1024, // e.g. iPad Pro
  DESKTOP: 1280,     // Small laptop/desktop
  LARGE_DESKTOP: 1920 // Large desktop
};

/**
 * Device orientation types
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Device type classification
 */
export type DeviceType = 'phone' | 'tablet' | 'desktop';

/**
 * Hook to get and observe screen dimensions
 * @returns Current screen dimensions and orientation
 */
export function useScreenDimensions() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [orientation, setOrientation] = useState<Orientation>(
    dimensions.height >= dimensions.width ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
      setOrientation(window.height >= window.width ? 'portrait' : 'landscape');
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      // For React Native 0.65+, subscription has a remove method
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else {
        // @ts-ignore - For older React Native versions
        Dimensions.removeEventListener('change', onChange);
      }
    };
  }, []);

  return {
    ...dimensions,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}

/**
 * Determines the device type based on platform and dimensions
 * @returns The current device type
 */
export function useDeviceType(): DeviceType {
  const { width, height } = useScreenDimensions();
  const maxDimension = Math.max(width, height);

  // For web, use window width to determine device type
  if (Platform.OS === 'web') {
    if (width < ScreenBreakpoints.SMALL_TABLET) return 'phone';
    if (width < ScreenBreakpoints.DESKTOP) return 'tablet';
    return 'desktop';
  }

  // For native platforms, use a combination of platform and screen size
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (Platform.isPad) return 'tablet';
    if (maxDimension < ScreenBreakpoints.SMALL_TABLET) return 'phone';
    return 'tablet';
  }

  // Fallback
  return 'phone';
}

/**
 * Gets responsive value based on screen size
 * @param options Values for different screen sizes
 * @returns The appropriate value for the current screen size
 */
export function getResponsiveValue<T>({
  phone,
  tablet,
  desktop,
  default: defaultValue,
}: {
  phone?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  const { width } = Dimensions.get('window');

  if (Platform.OS === 'web') {
    if (width >= ScreenBreakpoints.DESKTOP && desktop !== undefined) {
      return desktop;
    }
    if (width >= ScreenBreakpoints.SMALL_TABLET && tablet !== undefined) {
      return tablet;
    }
    if (phone !== undefined) {
      return phone;
    }
  } else {
    // On native, use simpler logic
    if (Platform.isPad && tablet !== undefined) {
      return tablet;
    }
    if (phone !== undefined) {
      return phone;
    }
  }

  return defaultValue;
}

/**
 * Calculates font size based on screen size
 * @param base Base font size (for phone)
 * @param options Scaling options
 * @returns Responsive font size
 */
export function getResponsiveFontSize(
  base: number,
  options?: {
    tablet?: number; // Scale factor for tablets
    desktop?: number; // Scale factor for desktops
    min?: number; // Minimum font size
    max?: number; // Maximum font size
  }
): number {
  const deviceType = Platform.OS === 'web' 
    ? (Dimensions.get('window').width < ScreenBreakpoints.SMALL_TABLET ? 'phone' 
      : Dimensions.get('window').width < ScreenBreakpoints.DESKTOP ? 'tablet' 
      : 'desktop')
    : Platform.isPad ? 'tablet' : 'phone';
    
  const { tablet = 1.2, desktop = 1.4, min, max } = options || {};
  
  let fontSize = base;
  
  if (deviceType === 'tablet') {
    fontSize = base * tablet;
  } else if (deviceType === 'desktop') {
    fontSize = base * desktop;
  }
  
  if (min !== undefined && fontSize < min) {
    return min;
  }
  
  if (max !== undefined && fontSize > max) {
    return max;
  }
  
  return fontSize;
}

/**
 * Hook to get spacing/sizing values that adapt to screen size
 * @returns Object with responsive sizing functions
 */
export function useResponsiveSize() {
  const dimensions = useScreenDimensions();
  const deviceType = useDeviceType();
  
  // Base scaling factors
  const scaleFactor = {
    phone: 1,
    tablet: 1.25,
    desktop: 1.5
  };
  
  // Scale a value based on device type
  const scale = (size: number): number => {
    return size * scaleFactor[deviceType];
  };
  
  // Get vertical spacing that adjusts for screen height
  const verticalSpacing = (size: number): number => {
    return size * (dimensions.height / 844); // Normalized to iPhone 12 height
  };
  
  // Get horizontal spacing that adjusts for screen width
  const horizontalSpacing = (size: number): number => {
    return size * (dimensions.width / 390); // Normalized to iPhone 12 width
  };
  
  // Get a value that maintains aspect ratio across different screens
  const aspectAdjusted = (size: number): number => {
    const aspectRatio = dimensions.width / dimensions.height;
    return size * (aspectRatio > 0.5 ? 1 : aspectRatio / 0.5);
  };
  
  return {
    scale,
    vs: verticalSpacing,
    hs: horizontalSpacing,
    ms: Math.min(verticalSpacing, horizontalSpacing), // Minimum of both directions
    as: aspectAdjusted,
    deviceType,
    dimensions
  };
} 