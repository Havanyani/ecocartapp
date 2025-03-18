import { useTheme } from '@/hooks/useTheme';
import { MaterialCategory } from '@/types/Material';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/Text';

interface MaterialFilterProps {
  selectedCategory: MaterialCategory | null;
  onSelectCategory: (category: MaterialCategory | null) => void;
}

const CATEGORIES: MaterialCategory[] = ['plastic', 'paper', 'glass', 'metal', 'electronics', 'organic', 'other'];

export function MaterialFilter({ selectedCategory, onSelectCategory }: MaterialFilterProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[
            styles.filterItem,
            { backgroundColor: selectedCategory === null ? theme.colors.primary : theme.colors.background }
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text
            style={{
              color: selectedCategory === null ? theme.colors.text.primary : theme.colors.text.secondary
            }}
          >
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterItem,
              { backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.background }
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={{
                color: selectedCategory === category ? theme.colors.text.primary : theme.colors.text.secondary
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
}); 