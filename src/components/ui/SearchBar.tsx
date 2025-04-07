import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface SearchBarProps extends TextInputProps {
  style?: any;
}

export function SearchBar({ style, ...props }: SearchBarProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.textSecondary,
        },
        style,
      ]}
    >
      <IconSymbol
        name="search"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        {...props}
        style={[
          styles.input,
          {
            color: theme.colors.text,
          },
        ]}
        placeholderTextColor={theme.colors.textSecondary}
      />
      {props.value ? (
        <IconSymbol
          name="close"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.icon}
          onPress={() => props.onChangeText?.('')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
}); 