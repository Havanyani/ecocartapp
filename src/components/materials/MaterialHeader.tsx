import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface MaterialHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function MaterialHeader({ searchQuery, onSearch }: MaterialHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.text.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Search materials..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={onSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.text.primary}
            style={styles.clearIcon}
            onPress={() => onSearch('')}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearIcon: {
    marginLeft: 8,
  },
}); 