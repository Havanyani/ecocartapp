/**
 * TextField.native.tsx
 * 
 * Native-specific implementation of the TextField component.
 * Provides a customizable text input with various visual variants.
 */

import React, { useState } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { TextFieldProps } from './TextField';

export function TextField({
  label,
  helperText,
  error,
  onFocus,
  onBlur,
  value,
  defaultValue,
  onChangeText,
  variant = 'outlined',
  disabled = false,
  leadingIcon,
  trailingIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  showCharacterCount = false,
  maxLength,
  testID,
  accessibilityLabel,
  placeholder,
  ...restProps
}: TextFieldProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  
  // Animation value for the label
  const labelAnimValue = useState(new Animated.Value(
    value || defaultValue ? 1 : 0
  ))[0];
  
  // Handle focus
  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
      animateLabel(1);
      onFocus?.();
    }
  };
  
  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    if (!inputValue) {
      animateLabel(0);
    }
    onBlur?.();
  };
  
  // Handle text change
  const handleChangeText = (text: string) => {
    setInputValue(text);
    onChangeText?.(text);
  };
  
  // Animate the label position
  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnimValue, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  // Interpolate label position and font size
  const labelPosition = labelAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  
  const labelFontSize = labelAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });
  
  // Get colors based on state
  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };
  
  const getLabelColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.text;
  };
  
  // Character count text
  const renderCharCount = () => {
    if (!showCharacterCount || !maxLength) return null;
    
    return (
      <Text
        style={[
          styles.charCount,
          { color: inputValue.length > maxLength ? theme.colors.error : theme.colors.textSecondary }
        ]}
      >
        {`${inputValue.length}/${maxLength}`}
      </Text>
    );
  };
  
  // Render helper text or error
  const renderHelperText = () => {
    if (!helperText && !error) return null;
    
    return (
      <Text
        style={[
          styles.helperText,
          { 
            color: error ? theme.colors.error : theme.colors.textSecondary 
          }
        ]}
      >
        {error || helperText}
      </Text>
    );
  };
  
  // Container styles based on variant
  const getContainerStyle = () => {
    const borderColor = getBorderColor();
    
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: isFocused 
            ? theme.colors.background 
            : theme.colors.backgroundSecondary,
          borderBottomWidth: 2,
          borderBottomColor: borderColor,
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: isFocused ? 2 : 1,
          borderBottomColor: borderColor,
          paddingHorizontal: 0,
        };
      case 'outlined':
      default:
        return {
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 4,
          backgroundColor: disabled ? theme.colors.backgroundDisabled : 'transparent',
        };
    }
  };
  
  // Label component
  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <Animated.Text
        style={[
          styles.label,
          {
            color: getLabelColor(),
            transform: [{ translateY: labelPosition }],
            fontSize: labelFontSize,
            opacity: disabled ? 0.5 : 1,
          },
          variant === 'filled' && {
            paddingHorizontal: 4,
            backgroundColor: isFocused ? theme.colors.background : 'transparent',
            left: 8,
          },
          labelStyle,
        ]}
      >
        {label}{required ? ' *' : ''}
      </Animated.Text>
    );
  };
  
  return (
    <View
      style={[styles.wrapper, containerStyle]}
      testID={testID ? `${testID}-container` : undefined}
    >
      <View
        style={[
          styles.container,
          getContainerStyle(),
        ]}
      >
        {/* Leading Icon */}
        {leadingIcon && (
          <View style={styles.leadingIcon}>
            {leadingIcon}
          </View>
        )}
        
        {/* Input and Label container */}
        <View style={styles.inputContainer}>
          {renderLabel()}
          
          <TextInput
            style={[
              styles.input,
              {
                color: disabled ? theme.colors.textDisabled : theme.colors.text,
                paddingTop: label ? 12 : 0,
              },
              inputStyle,
            ]}
            value={value}
            defaultValue={defaultValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            maxLength={maxLength}
            placeholder={isFocused || !label ? placeholder : undefined}
            placeholderTextColor={theme.colors.textSecondary}
            testID={testID}
            accessibilityLabel={accessibilityLabel || label}
            {...restProps}
          />
        </View>
        
        {/* Trailing Icon */}
        {trailingIcon && (
          <View style={styles.trailingIcon}>
            {trailingIcon}
          </View>
        )}
      </View>
      
      {/* Helper text and character count */}
      <View style={styles.bottomRow}>
        {renderHelperText()}
        {renderCharCount()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minHeight: 24,
    width: '100%',
    ...Platform.select({
      ios: {
        paddingTop: 10,
        paddingBottom: 10,
      },
      android: {
        paddingTop: 8,
        paddingBottom: 8,
      },
    }),
  },
  label: {
    position: 'absolute',
    fontWeight: '500',
    left: 0,
  },
  leadingIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailingIcon: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    marginRight: 4,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 