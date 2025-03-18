import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const TOAST_OFFSET = 16;
const TOAST_DURATION = 3000;

export function Toast({
  message,
  variant = 'info',
  duration = TOAST_DURATION,
  onClose,
  action,
}: ToastProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (variant) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  useEffect(() => {
    const showAnimation = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    const hideAnimation = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 100,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    showAnimation.start();

    const hideTimeout = setTimeout(() => {
      hideAnimation.start(() => {
        onClose?.();
      });
    }, duration);

    return () => {
      clearTimeout(hideTimeout);
      showAnimation.stop();
      hideAnimation.stop();
    };
  }, [translateY, opacity, duration, onClose]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          transform: [{ translateY }],
          opacity,
          marginBottom: insets.bottom + TOAST_OFFSET,
          marginHorizontal: TOAST_OFFSET,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIconName()} size={24} color={getIconColor()} style={styles.icon} />
        <Text variant="body" style={styles.message}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text variant="subtitle" style={{ color: theme.colors.primary }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    marginRight: 12,
  },
}); 