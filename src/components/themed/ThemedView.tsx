import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'background';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  style, 
  variant = 'background',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const variantStyles = {
    primary: {
      backgroundColor: theme.primary,
    },
    secondary: {
      backgroundColor: theme.secondary,
    },
    background: {
      backgroundColor: theme.background,
    },
  };

  return (
    <View 
      style={[variantStyles[variant], style]} 
      {...props} 
    />
  );
}; 