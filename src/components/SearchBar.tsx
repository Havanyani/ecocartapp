import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({ onSearch, placeholder, style }: SearchBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <IconSymbol name="magnify" size={24} color={theme.colors.text.secondary} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        onChangeText={onSearch}
        accessibilityLabel="Search products"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
}); 