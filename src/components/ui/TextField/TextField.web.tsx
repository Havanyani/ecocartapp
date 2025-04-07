/**
 * TextField.web.tsx
 * 
 * Web-specific implementation of the TextField component.
 * Provides a customizable text input with various visual variants.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View
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
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  const inputRef = useRef<TextInput>(null);
  
  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);
  
  // Handle focus
  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
      onFocus?.();
    }
  };
  
  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  // Handle text change
  const handleChangeText = (text: string) => {
    setInputValue(text);
    onChangeText?.(text);
  };
  
  // Focus the input when clicking on the label or container (web-specific)
  const handleContainerClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Get colors based on state
  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    if (isHovered) return theme.colors.text;
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
          transition: 'all 0.2s ease-in-out',
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: isFocused ? 2 : 1,
          borderBottomColor: borderColor,
          paddingHorizontal: 0,
          transition: 'all 0.2s ease-in-out',
        };
      case 'outlined':
      default:
        return {
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 4,
          backgroundColor: disabled ? theme.colors.backgroundDisabled : 'transparent',
          transition: 'all 0.2s ease-in-out',
        };
    }
  };
  
  // Web-specific event handlers for hover
  const webProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick: handleContainerClick,
    style: { cursor: disabled ? 'not-allowed' : 'text' }
  };
  
  // Label component
  const renderLabel = () => {
    if (!label) return null;
    
    // For web, we use CSS transforms for the label animation
    const hasValue = !!inputValue;
    const shouldFloat = isFocused || hasValue;
    
    return (
      <Text
        style={[
          styles.label,
          {
            color: getLabelColor(),
            fontSize: shouldFloat ? 12 : 16,
            transform: shouldFloat 
              ? [{ translateY: -24 }] 
              : [{ translateY: 0 }],
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease-in-out',
          },
          variant === 'filled' && {
            paddingHorizontal: 4,
            backgroundColor: isFocused ? theme.colors.background : 'transparent',
            left: 8,
          },
          labelStyle,
        ]}
        onPress={handleContainerClick}
      >
        {label}{required ? ' *' : ''}
      </Text>
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
        {...webProps}
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
            ref={inputRef}
            style={[
              styles.input,
              {
                color: disabled ? theme.colors.textDisabled : theme.colors.text,
                paddingTop: label ? 12 : 0,
                outlineWidth: 0,  // web-specific: remove default focus outline
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  label: {
    position: 'absolute',
    fontWeight: '500',
    left: 0,
    pointerEvents: 'none', // web-specific: allow clicks to pass through to container
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