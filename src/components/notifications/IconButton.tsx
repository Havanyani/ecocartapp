import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from './constants';
import { baseStyles } from './styles';
import type { IconButtonProps } from './types';

export function IconButton({ 
  name, 
  onPress, 
  testID,
  size = 20 
}: IconButtonProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={COLORS[theme].text}
      style={baseStyles.icon}
      onPress={onPress}
      testID={testID}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    />
  );
} 