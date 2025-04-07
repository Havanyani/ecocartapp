import { useTheme } from '@/theme';
import React from 'react';
import { Switch as RNSwitch, StyleSheet, View } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor?: {
    false: string;
    true: string;
  };
  thumbColor?: {
    false: string;
    true: string;
  };
  disabled?: boolean;
  testID?: string;
}

/**
 * A themed switch component that uses the app's theme colors
 */
const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  trackColor,
  thumbColor,
  disabled = false,
  testID,
}) => {
  const themeFunc = useTheme();
  const theme = themeFunc();

  // Default track and thumb colors based on theme
  const defaultTrackColors = {
    false: theme.colors.border,
    true: theme.colors.primary,
  };

  const defaultThumbColors = {
    false: theme.colors.white,
    true: theme.colors.white,
  };

  return (
    <View style={styles.container}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor || defaultTrackColors}
        thumbColor={
          disabled 
            ? theme.colors.textSecondary
            : (value 
                ? (thumbColor?.true || defaultThumbColors.true) 
                : (thumbColor?.false || defaultThumbColors.false))
        }
        ios_backgroundColor={trackColor?.false || defaultTrackColors.false}
        disabled={disabled}
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
});

export default Switch; 