import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedColor?: string;
  unselectedColor?: string;
  selectedTextColor?: string;
  unselectedTextColor?: string;
  showIcon?: boolean;
}

export default function FilterChip({
  label,
  isSelected,
  onPress,
  style,
  textStyle,
  selectedColor = '#34C759',
  unselectedColor = '#F0F0F0',
  selectedTextColor = '#FFFFFF',
  unselectedTextColor = '#757575',
  showIcon = true,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? selectedColor : unselectedColor,
          borderColor: isSelected ? selectedColor : '#E0E0E0',
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showIcon && isSelected && (
        <Ionicons
          name="checkmark"
          size={14}
          color={selectedTextColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          { color: isSelected ? selectedTextColor : unselectedTextColor },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
}); 