import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

interface IconSymbolProps extends TouchableOpacityProps {
  name: string;
  size: number;
  color: string;
  style?: any;
}

export function IconSymbol({ name, size, color, style, ...props }: IconSymbolProps) {
  const Component = props.onPress ? TouchableOpacity : View;

  return (
    <Component style={style} {...props}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 