import { useTheme } from '@/hooks/useTheme';
import { MaterialCategory } from '@/types/materials';
import React, { memo, useCallback } from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface MaterialFilterProps {
  categories: MaterialCategory[];
  selectedCategories: string[];
  onSelectCategories: (categories: string[]) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * A performance-optimized component for filtering materials by category
 */
const MaterialFilter = memo(({ 
  categories, 
  selectedCategories, 
  onSelectCategories,
  style 
}: MaterialFilterProps) => {
  const { theme } = useTheme();
  
  const toggleCategory = useCallback((categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      onSelectCategories([...selectedCategories, categoryId]);
    }
  }, [selectedCategories, onSelectCategories]);
  
  const clearFilters = useCallback(() => {
    onSelectCategories([]);
  }, [onSelectCategories]);
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Filter by Category
        </Text>
        {selectedCategories.length > 0 && (
          <TouchableOpacity 
            onPress={clearFilters}
            style={[styles.clearButton, { borderColor: theme.colors.primary }]}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.primary }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategories.includes(category.id) 
                  ? theme.colors.primary 
                  : theme.colors.background,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => toggleCategory(category.id)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.categoryText, 
                { 
                  color: selectedCategories.includes(category.id) 
                    ? theme.colors.background 
                    : theme.colors.text 
                }
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
  },
  categoryButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export { MaterialFilter };
