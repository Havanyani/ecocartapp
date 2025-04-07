import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface TabBarBackgroundProps extends ViewProps {
  blurred?: boolean;
}

export const TabBarBackground: React.FC<TabBarBackgroundProps> = ({
  blurred = true,
  style,
  ...props
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: blurred 
            ? theme.theme.colors.background + '80'
            : theme.theme.colors.background,
          borderColor: theme.theme.colors.border
        },
        style
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
  }
}); 