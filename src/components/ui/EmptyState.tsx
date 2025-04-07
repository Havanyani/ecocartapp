/**
 * EmptyState.tsx
 * 
 * A reusable component to display when there is no data to show.
 * Features:
 * - Customizable icon, title, and message
 * - Optional action button
 * - Animation support
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring
} from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { ThemedText } from './ThemedText';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: EmptyStateAction;
  animated?: boolean;
}

export default function EmptyState({ 
  icon, 
  title, 
  message, 
  action, 
  animated = true 
}: EmptyStateProps) {
  const theme = useTheme();
  
  // Animation values
  const opacity = useSharedValue(animated ? 0 : 1);
  const scale = useSharedValue(animated ? 0.9 : 1);
  
  // Set up animation on mount
  useEffect(() => {
    if (animated) {
      opacity.value = withDelay(150, withSpring(1, { damping: 18 }));
      scale.value = withDelay(150, withSpring(1, { damping: 18 }));
    }
  }, [animated, opacity, scale]);
  
  // Apply animation style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });
  
  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
    >
      {/* Icon */}
      <View 
        style={[
          styles.iconContainer, 
          { backgroundColor: theme.theme.colors.border + '40' }
        ]}
      >
        <Ionicons 
          name={icon as any} 
          size={40} 
          color={theme.theme.colors.text + '80'} 
        />
      </View>
      
      {/* Text content */}
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      
      {/* Optional action button */}
      {action && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.theme.colors.primary }]}
          onPress={action.onPress}
        >
          <ThemedText style={styles.actionButtonText}>
            {action.label}
          </ThemedText>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 