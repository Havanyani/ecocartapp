import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  style, 
  variant = 'body',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const variantStyles = {
    body: {
      fontSize: 16,
      color: theme.text,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    caption: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  };

  return (
    <Text 
      style={[variantStyles[variant], style]} 
      {...props} 
    />
  );
}; 