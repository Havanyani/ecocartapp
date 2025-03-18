import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';

interface HapticButtonProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean };
}

export function HapticButton({ children, style, onPress, accessibilityLabel, accessibilityState }: HapticButtonProps): JSX.Element {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={style}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      {children}
    </Pressable>
  );
} 