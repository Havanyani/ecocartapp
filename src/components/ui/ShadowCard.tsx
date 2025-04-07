import { createShadow } from '@/utils/styleUtils';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

export interface ShadowCardProps extends ViewProps {
  /**
   * Shadow intensity level, from 1 (subtle) to 5 (prominent)
   */
  shadowLevel?: 1 | 2 | 3 | 4 | 5;
  
  /**
   * Radius for rounded corners
   */
  borderRadius?: number;
  
  /**
   * Custom shadow configuration
   */
  shadowConfig?: {
    color?: string;
    offsetX?: number;
    offsetY?: number;
    opacity?: number;
    radius?: number;
    elevation?: number;
  };
  
  /**
   * Custom style to apply to the card container
   */
  containerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Whether to add default padding to the card content
   */
  padded?: boolean;
}

/**
 * A cross-platform card component with proper shadow styling
 * 
 * This component handles the differences between shadow implementations on 
 * iOS, Android, and Web platforms.
 */
export function ShadowCard({
  children,
  shadowLevel = 2,
  borderRadius = 8,
  shadowConfig,
  containerStyle,
  padded = false,
  ...rest
}: ShadowCardProps) {
  // Define shadow settings based on the shadowLevel
  const shadowSettings = {
    // Level 1 - Subtle shadow
    1: { offsetY: 1, opacity: 0.1, radius: 2, elevation: 1 },
    // Level 2 - Light shadow (default)
    2: { offsetY: 2, opacity: 0.1, radius: 4, elevation: 2 },
    // Level 3 - Medium shadow
    3: { offsetY: 3, opacity: 0.15, radius: 6, elevation: 3 },
    // Level 4 - Pronounced shadow
    4: { offsetY: 4, opacity: 0.2, radius: 8, elevation: 4 },
    // Level 5 - Heavy shadow
    5: { offsetY: 5, opacity: 0.25, radius: 10, elevation: 5 },
  };
  
  // Use custom shadow config or fallback to level-based settings
  const shadowOptions = shadowConfig || shadowSettings[shadowLevel];
  
  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        createShadow(shadowOptions),
        padded && styles.padded,
        containerStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    margin: 1, // This helps with shadow rendering on some platforms
  },
  padded: {
    padding: 16,
  },
});

export default ShadowCard; 