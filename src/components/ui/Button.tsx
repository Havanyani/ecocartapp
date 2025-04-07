import { getSpacing, useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  isLoading?: boolean;
  isDisabled?: boolean;
  style?: ViewStyle;
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  isDisabled = false,
  style,
  children,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.theme.colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: getSpacing(theme, 'xs'),
          paddingHorizontal: getSpacing(theme, 'sm'),
        };
      case 'lg':
        return {
          paddingVertical: getSpacing(theme, 'md'),
          paddingHorizontal: getSpacing(theme, 'lg'),
        };
      default:
        return {
          paddingVertical: getSpacing(theme, 'sm'),
          paddingHorizontal: getSpacing(theme, 'md'),
        };
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      return theme.theme.colors.textSecondary;
    }
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.theme.colors.white;
      case 'outline':
      case 'ghost':
        return theme.theme.colors.primary;
      default:
        return theme.theme.colors.text;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled || isLoading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {leftIcon && (
              <Ionicons
                name={leftIcon}
                size={getIconSize()}
                color={getTextColor()}
                style={styles.leftIcon}
              />
            )}
            <Text
              variant={size === 'sm' ? 'body' : 'subtitle'}
              style={[styles.text, { color: getTextColor() }]}
            >
              {children}
            </Text>
            {rightIcon && (
              <Ionicons
                name={rightIcon}
                size={getIconSize()}
                color={getTextColor()}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
}); 