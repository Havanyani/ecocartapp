import { useTheme } from '@/hooks/useTheme';
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
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: blurred 
            ? theme.colors.background + '80'
            : theme.colors.background
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
    borderColor: '#ccc',
  }
}); 