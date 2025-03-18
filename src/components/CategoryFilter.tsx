import { HapticButton } from '@/components/HapticButton';
import { IconSymbol } from '@/components/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { FlatList, StyleSheet, ViewStyle } from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'fruits', name: 'Fruits & Veg', icon: 'fruit-watermelon' },
  { id: 'dairy', name: 'Dairy', icon: 'cheese' },
  { id: 'bakery', name: 'Bakery', icon: 'bread-slice' },
  { id: 'beverages', name: 'Beverages', icon: 'bottle-soda' },
];

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  style?: ViewStyle;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  style,
}: CategoryFilterProps) {
  const theme = useTheme();

  const renderCategory = ({ item }: { item: Category }) => (
    <HapticButton
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => onSelectCategory(item.id)}
      accessibilityLabel={`Filter by ${item.name}`}
      accessibilityState={{ selected: selectedCategory === item.id }}
    >
      <IconSymbol
        name={item.icon}
        size={24}
        color={
          selectedCategory === item.id
            ? theme.colors.primary
            : theme.colors.text.secondary
        }
      />
      <ThemedText
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </ThemedText>
    </HapticButton>
  );

  return (
    <FlatList
      horizontal
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.categoryList, style]}
    />
  );
}

const styles = StyleSheet.create({
  categoryList: {
    padding: 8,
  },
  categoryTab: {
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCategory: {
    backgroundColor: '#e8f5e9',
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
}); 