# SearchBar

## Overview
The `SearchBar` component provides a standardized search input with optional filtering capabilities for the EcoCart application. It features clear visual indication of search state, built-in debounce functionality, and customizable appearance to match various contexts within the app.

## Usage

```tsx
import { SearchBar } from '@/components/ui/SearchBar';

// Basic usage
<SearchBar
  placeholder="Search items..."
  onSearch={(query) => searchItems(query)}
/>

// With filter button
<SearchBar
  placeholder="Search recycling centers"
  showFilterButton
  onFilterPress={() => setShowFilters(true)}
  onSearch={handleSearch}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `placeholder` | `string` | No | `'Search...'` | Placeholder text displayed when input is empty |
| `initialValue` | `string` | No | `''` | Initial search text |
| `onSearch` | `(query: string) => void` | Yes | - | Callback triggered when search query changes (after debounce) |
| `onSubmit` | `(query: string) => void` | No | - | Callback triggered when user submits the search |
| `onClear` | `() => void` | No | - | Callback triggered when search is cleared |
| `debounceTime` | `number` | No | `300` | Milliseconds to wait before triggering onSearch after typing |
| `showFilterButton` | `boolean` | No | `false` | Whether to show a filter button on the right |
| `onFilterPress` | `() => void` | No | - | Callback triggered when filter button is pressed |
| `variant` | `'default' \| 'minimal' \| 'prominent'` | No | `'default'` | Visual style variant |
| `autoFocus` | `boolean` | No | `false` | Auto focus the search input on mount |
| `style` | `StyleProp<ViewStyle>` | No | - | Custom styles for the search bar container |
| `inputStyle` | `StyleProp<TextInputStyle>` | No | - | Custom styles for the text input |

## Features
- **Debounced Search**: Prevents excessive callbacks during typing
- **Clear Button**: One-tap clearing of search text
- **Filter Integration**: Optional filter button for advanced search
- **Search History**: Optionally remembers recent searches (when enabled)
- **Keyboard Management**: Optimized keyboard settings for search
- **Accessibility Support**: Clear labels and hints for screen readers
- **Theme Integration**: Automatically adapts to app theme

## Styling
The component applies the following base styling:

```tsx
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 8,
    padding: 4,
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
  variantMinimal: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    height: 40,
  },
  variantProminent: {
    height: 56,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
```

## Best Practices
- **Do**: Use meaningful placeholder text that suggests what can be searched
- **Do**: Implement proper error states for no results
- **Do**: Consider using the debounce time based on expected user behavior
- **Don't**: Initiate expensive search operations without debouncing
- **Don't**: Hide the clear button when text is present
- **Accessibility**: Ensure proper labeling for screen readers

## Examples

### Basic Search
```tsx
const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);

const handleSearch = async (query) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }
  
  setIsSearching(true);
  
  try {
    const results = await searchService.search(query);
    setSearchResults(results);
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    setIsSearching(false);
  }
};

return (
  <View>
    <SearchBar
      placeholder="Search recyclable items"
      onSearch={handleSearch}
      onClear={() => setSearchResults([])}
    />
    
    {isSearching ? (
      <ActivityIndicator style={{ marginTop: 20 }} />
    ) : (
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No results found
          </Text>
        }
      />
    )}
  </View>
);
```

### With Filters
```tsx
const [showFilters, setShowFilters] = useState(false);
const [filterOptions, setFilterOptions] = useState({
  category: 'all',
  sortBy: 'relevance',
});

return (
  <>
    <SearchBar
      placeholder="Search collection centers"
      showFilterButton
      onFilterPress={() => setShowFilters(true)}
      onSearch={handleSearch}
    />
    
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilters(false)}
    >
      <FilterPanel
        options={filterOptions}
        onChange={setFilterOptions}
        onClose={() => setShowFilters(false)}
      />
    </Modal>
  </>
);
```

### Prominent Variant for Home Screen
```tsx
<View style={{ padding: 16 }}>
  <SearchBar
    placeholder="Search for recyclable items..."
    variant="prominent"
    onSearch={handleSearch}
    showFilterButton
    onFilterPress={showCategoryFilters}
  />
</View>
```

### Minimal Variant in Header
```tsx
<Header
  title="Recycling"
  right={
    <SearchBar
      variant="minimal"
      placeholder="Search..."
      onSearch={handleHeaderSearch}
      inputStyle={{ fontSize: 14 }}
    />
  }
/>
```

## Implementation Details
The component uses debounce to optimize search performance and handles different input states:

```tsx
export function SearchBar({
  placeholder = 'Search...',
  initialValue = '',
  onSearch,
  onSubmit,
  onClear,
  debounceTime = 300,
  showFilterButton = false,
  onFilterPress,
  variant = 'default',
  autoFocus = false,
  style,
  inputStyle,
}: SearchBarProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState(initialValue);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any existing debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);
  
  const handleChangeText = (text: string) => {
    setQuery(text);
    
    // Clear existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Set new timeout for search
    searchDebounceRef.current = setTimeout(() => {
      onSearch(text);
    }, debounceTime);
  };
  
  const handleClear = () => {
    setQuery('');
    onSearch('');
    if (onClear) {
      onClear();
    }
  };
  
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(query);
    } else {
      onSearch(query);
    }
  };
  
  // Determine style variant
  const containerStyle = [
    styles.container,
    {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    variant === 'minimal' && styles.variantMinimal,
    variant === 'prominent' && styles.variantProminent,
    style,
  ];
  
  return (
    <View style={containerStyle}>
      <Feather
        name="search"
        size={18}
        color={theme.colors.text.secondary}
        style={styles.searchIcon}
      />
      
      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text.primary },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        value={query}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        clearButtonMode="never"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
        accessibilityHint="Enter search terms to find items"
      />
      
      {query.length > 0 && (
        <Pressable
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityLabel="Clear search"
        >
          <Feather
            name="x"
            size={18}
            color={theme.colors.text.secondary}
          />
        </Pressable>
      )}
      
      {showFilterButton && (
        <>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.border }
            ]}
          />
          <Pressable
            onPress={onFilterPress}
            style={styles.filterButton}
            accessibilityLabel="Filter search results"
          >
            <Feather
              name="filter"
              size={18}
              color={theme.colors.text.secondary}
            />
          </Pressable>
        </>
      )}
    </View>
  );
}
```

## Related Components
- `FormInput`: Basic text input component
- `FilterPanel`: Used with SearchBar for filtering results
- `SearchHistoryList`: Displays recent search queries
- `SearchResultList`: Displays search results

## Related Documentation
- [Form Components](../../components/form/README.md)
- [Search Implementation Guide](../../../docs/guides/search-implementation.md)
- [Filter Design Patterns](../../../docs/design/filter-patterns.md)
- [UI Components Overview](../README.md)
- [FormInput Component](./FormInput.README.md)
- [Accessibility Guidelines](../../../docs/design/accessibility.md) 