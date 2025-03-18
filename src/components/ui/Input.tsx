import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text variant="caption" style={{ marginBottom: 4 }}>
            {label}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: error ? theme.colors.error : theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={theme.colors.text.secondary}
              style={styles.leftIcon}
            />
          )}
          <TextInput
            ref={ref}
            {...props}
            style={[
              styles.input,
              {
                color: theme.colors.text.primary,
              },
              inputStyle,
            ]}
            placeholderTextColor={theme.colors.text.secondary}
          />
          {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress}>
              <Ionicons
                name={rightIcon}
                size={20}
                color={theme.colors.text.secondary}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text variant="caption" style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    marginTop: 4,
  },
}); 