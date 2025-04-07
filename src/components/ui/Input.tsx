import { useTheme } from '@/theme';
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
    const theme = useTheme();

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text variant="caption" style={{ marginBottom: theme.theme.spacing.xs }}>
            {label}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: error ? theme.theme.colors.error : theme.theme.colors.border,
              backgroundColor: theme.theme.colors.background,
            },
          ]}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={theme.theme.colors.textSecondary}
              style={styles.leftIcon}
            />
          )}
          <TextInput
            ref={ref}
            {...props}
            style={[
              styles.input,
              {
                color: theme.theme.colors.text,
              },
              inputStyle,
            ]}
            placeholderTextColor={theme.theme.colors.textSecondary}
          />
          {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress}>
              <Ionicons
                name={rightIcon}
                size={20}
                color={theme.theme.colors.textSecondary}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text variant="caption" style={[styles.error, { color: theme.theme.colors.error }]}>
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