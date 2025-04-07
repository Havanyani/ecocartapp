import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

interface TabBarIconProps {
  name: string;
  color: string;
  size?: number;
  iconType?: 'ionicons' | 'fontawesome' | 'material';
}

/**
 * TabBarIcon component used for rendering icons in the tab bar navigation
 * Supports multiple icon libraries (Ionicons, FontAwesome, MaterialCommunityIcons)
 */
const TabBarIcon: React.FC<TabBarIconProps> = ({ 
  name, 
  color, 
  size = 24, 
  iconType = 'fontawesome' 
}) => {
  switch (iconType) {
    case 'ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'material':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    case 'fontawesome':
    default:
      return <FontAwesome name={name as any} size={size} color={color} />;
  }
};

export default TabBarIcon; 