import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A performance-optimized search bar component with debounced input
 */
const SearchBar = memo(({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  testID,
}: SearchBarProps) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Debounce search input
  const handleChangeText = (text: string) => {
    setInputValue(text);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounce
    timeoutRef.current = setTimeout(() => {
      onChangeText(text);
    }, 300);
  };

  // Clear search input
  const handleClearText = () => {
    setInputValue('');
    onChangeText('');
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
        style
      ]}
      testID={testID}
    >
      <Ionicons 
        name="search" 
        size={20} 
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[
          styles.input, 
          { color: theme.colors.text }
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={inputValue}
        onChangeText={handleChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCapitalize="none"
        autoCorrect={false}
        testID={testID ? `${testID}-input` : 'search-input'}
      />
      {inputValue.length > 0 && (
        <TouchableOpacity 
          onPress={handleClearText}
          style={styles.clearButton}
          testID={testID ? `${testID}-clear` : 'search-clear'}
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
});

export { SearchBar };

