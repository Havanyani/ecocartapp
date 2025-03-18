import * as Haptics from 'expo-haptics';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface HapticButtonProps extends TouchableOpacityProps {
  feedbackType?: 'light' | 'medium' | 'heavy';
}

export function HapticButton({
  onPress,
  feedbackType = 'light',
  ...props
}: HapticButtonProps) {
  const handlePress = async () => {
    try {
      switch (feedbackType) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
      onPress?.();
    } catch (error) {
      console.error('Haptic feedback failed:', error);
      onPress?.();
    }
  };

  return <TouchableOpacity onPress={handlePress} {...props} />;
} 