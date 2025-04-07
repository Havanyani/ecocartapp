/**
 * Button.web.tsx
 * 
 * Web-specific implementation of the Button component.
 */

import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ButtonProps } from './Button';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  
  // Determine button style based on variant
  const getContainerStyle = () => {
    const baseStyle = styles.container;
    const sizeStyle = sizeStyles[size];
    let variantStyle;
    
    switch (variant) {
      case 'primary':
        variantStyle = { backgroundColor: theme.colors.primary };
        break;
      case 'secondary':
        variantStyle = { backgroundColor: theme.colors.secondary };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
        break;
      case 'text':
        variantStyle = {
          backgroundColor: 'transparent',
        };
        break;
      default:
        variantStyle = { backgroundColor: theme.colors.primary };
    }
    
    const disabledStyle = disabled || isLoading
      ? { opacity: 0.6 }
      : {};
    
    // Web-specific styles
    const webStyles = {
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s ease',
      outline: 'none',
    };
    
    return [baseStyle, sizeStyle, variantStyle, disabledStyle, webStyles, style];
  };
  
  // Determine text style based on variant
  const getTextStyle = () => {
    const baseStyle = styles.text;
    const sizeStyle = textSizeStyles[size];
    let variantStyle;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        variantStyle = { color: theme.colors.onPrimary };
        break;
      case 'outline':
      case 'text':
        variantStyle = { color: theme.colors.primary };
        break;
      default:
        variantStyle = { color: theme.colors.onPrimary };
    }
    
    return [baseStyle, sizeStyle, variantStyle, textStyle];
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled && !isLoading) {
      onPress();
    }
  };
  
  // Web-specific hover state
  const [isHovered, setIsHovered] = React.useState(false);
  
  const hoverStyle = isHovered && !disabled && !isLoading ? {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  } : {};
  
  return (
    <Pressable
      style={[...getContainerStyle(), hoverStyle]}
      onPress={onPress}
      disabled={disabled || isLoading}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
      testID={testID}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyPress={handleKeyPress}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !isLoading && (
          <View style={styles.iconLeft}>
            {leftIcon}
          </View>
        )}
        
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'text' 
              ? theme.colors.primary 
              : theme.colors.onPrimary}
          />
        ) : (
          <Text style={getTextStyle()}>
            {label}
          </Text>
        )}
        
        {rightIcon && !isLoading && (
          <View style={styles.iconRight}>
            {rightIcon}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Size-based styles
const sizeStyles = {
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
};

// Text size styles
const textSizeStyles = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
    fontWeight: '500',
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
}); 