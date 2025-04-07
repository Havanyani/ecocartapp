# List Component

A flexible cross-platform list component with support for rendering data collections, loading states, empty states, and various customization options.

## Features

- Efficient rendering of lists with platform-specific optimizations
- Support for custom item rendering
- Loading, empty, and error states
- Pull-to-refresh functionality
- Infinite scrolling with load more indicator
- Header and footer components
- Customizable dividers
- Selection functionality (single and multi-select)

## Usage

```tsx
import { List } from './components/ui/List';

// Basic usage
function MyList() {
  const data = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ];
  
  return (
    <List
      data={data}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

// With loading and empty states
function MyListWithStates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);
  
  return (
    <List
      data={data}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
      isLoading={loading}
      isEmpty={!loading && data.length === 0}
      emptyText="No items found. Try a different search."
    />
  );
}

// With pull-to-refresh and infinite scrolling
function MyInfiniteList() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  
  const fetchData = async (pageNumber = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNumber > 1) {
      setLoadingMore(true);
    }
    
    try {
      const response = await api.getItems(pageNumber);
      if (refresh) {
        setData(response);
      } else {
        setData([...data, ...response]);
      }
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };
  
  const handleRefresh = () => {
    setPage(1);
    fetchData(1, true);
  };
  
  const handleEndReached = () => {
    if (!loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };
  
  return (
    <List
      data={data}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
      refreshable
      refreshing={refreshing}
      onRefresh={handleRefresh}
      loadingMore={loadingMore}
      onEndReached={handleEndReached}
    />
  );
}

// With selection functionality
function MySelectableList() {
  const data = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ];
  
  const [selectedIndices, setSelectedIndices] = useState([]);
  
  return (
    <>
      <List
        data={data}
        renderItem={({ item, isSelected }) => (
          <View style={[styles.item, isSelected && styles.selectedItem]}>
            <Text>{item.title}</Text>
            {isSelected && <Icon name="check" />}
          </View>
        )}
        keyExtractor={(item) => item.id}
        selectable
        selectedIndices={selectedIndices}
        onSelectionChange={setSelectedIndices}
        multiSelect
      />
      <Button 
        title={`${selectedIndices.length} items selected`} 
        onPress={() => console.log('Selected items:', selectedIndices.map(i => data[i]))}
      />
    </>
  );
}
```

## Props

### Data and Rendering

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | Required | Array of data to render in the list |
| `renderItem` | Function | Required | Function to render each item in the list |
| `keyExtractor` | Function or String | Required | Function or key name to extract a unique key for each item |

### Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerStyle` | StyleProp\<ViewStyle> | undefined | Custom styles for the list container |
| `showDividers` | boolean | false | Whether to add dividers between items |
| `dividerComponent` | ReactNode | undefined | Custom divider component |
| `rounded` | boolean | false | Whether to have rounded corners on the list container |
| `padded` | boolean | false | Whether to add padding to the list container |
| `paddingAmount` | number | 16 | Custom padding amount when `padded` is true |
| `bordered` | boolean | false | Whether to add a border to the list container |

### Header and Footer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showHeader` | boolean | false | Whether to show a header component |
| `headerComponent` | ReactNode | undefined | Component to render as the list header |
| `showFooter` | boolean | false | Whether to show a footer component |
| `footerComponent` | ReactNode | undefined | Component to render as the list footer |

### States

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | boolean | false | Whether the list is currently loading |
| `loadingComponent` | ReactNode | undefined | Custom loading component |
| `isEmpty` | boolean | false | Whether the list is empty |
| `emptyComponent` | ReactNode | undefined | Custom empty state component |
| `emptyText` | string | 'No items found' | Text to show when the list is empty |

### Scrolling and Loading

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scrollable` | boolean | true | Whether to make the list scrollable |
| `refreshable` | boolean | false | Whether the list is refreshable |
| `onRefresh` | Function | undefined | Callback when the user refreshes the list |
| `refreshing` | boolean | false | Whether the list is currently refreshing |
| `loadingMore` | boolean | false | Whether to show a loading indicator at the bottom |
| `onEndReached` | Function | undefined | Callback when the user scrolls to the end of the list |
| `onEndReachedThreshold` | number | 0.2 | How far from the end to trigger `onEndReached` |
| `onScroll` | Function | undefined | Callback for when the list scroll position changes |

### Selection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectable` | boolean | false | Whether the list can be selected |
| `selectedIndices` | number[] | [] | Array of selected item indices |
| `onSelectionChange` | Function | undefined | Callback for when selection changes |
| `multiSelect` | boolean | false | Whether multiple items can be selected |

### Accessibility

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `testID` | string | undefined | ID for testing |
| `accessibilityLabel` | string | undefined | Accessibility label |

## Platform-Specific Implementation Details

### Native (iOS & Android)
- Uses React Native's `FlatList` for optimized rendering and memory usage
- Native pull-to-refresh functionality
- Optimized for touch interactions

### Web
- Uses optimized rendering for web
- Custom refresh button instead of pull-to-refresh
- Efficient scroll detection for infinite loading
- Better keyboard navigation support

## Best Practices

- Always provide a `keyExtractor` that returns a unique value for each item
- Use `isLoading` and `isEmpty` to show appropriate loading and empty states
- Optimize your `renderItem` function to avoid unnecessary re-renders
- For large lists, consider implementing windowing or virtualization
- When using selection, make the selected state visually clear to users
- Provide meaningful empty states with clear instructions for users
- Use `refreshable` for lists that can be manually refreshed by users
- Implement `onEndReached` for infinite scrolling when appropriate
- Keep list items simple and consistent for better performance
- Consider accessibility when designing list items

## Examples

### List with Custom Item Component

```tsx
import { List } from './components/ui/List';
import { ListItem } from './components/ui/ListItem';

function CustomItemList() {
  const data = [
    { id: '1', title: 'First Item', subtitle: 'Description 1', icon: 'star' },
    { id: '2', title: 'Second Item', subtitle: 'Description 2', icon: 'heart' },
    { id: '3', title: 'Third Item', subtitle: 'Description 3', icon: 'bell' },
  ];
  
  return (
    <List
      data={data}
      renderItem={({ item, isFirst, isLast }) => (
        <ListItem
          title={item.title}
          subtitle={item.subtitle}
          leftIcon={item.icon}
          rightIcon="chevron-right"
          isFirst={isFirst}
          isLast={isLast}
          onPress={() => handleItemPress(item)}
        />
      )}
      keyExtractor={(item) => item.id}
      showDividers
      rounded
      bordered
    />
  );
}
```

### Section-Based List

```tsx
import { List } from './components/ui/List';

function SectionList() {
  // Flatten sections into a single array with section info
  const data = [
    { id: 'header-1', isHeader: true, title: 'Section 1' },
    { id: '1-1', title: 'Item 1-1', sectionId: '1' },
    { id: '1-2', title: 'Item 1-2', sectionId: '1' },
    { id: 'header-2', isHeader: true, title: 'Section 2' },
    { id: '2-1', title: 'Item 2-1', sectionId: '2' },
    { id: '2-2', title: 'Item 2-2', sectionId: '2' },
  ];
  
  return (
    <List
      data={data}
      renderItem={({ item }) => {
        if (item.isHeader) {
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
          );
        }
        
        return (
          <View style={styles.item}>
            <Text>{item.title}</Text>
          </View>
        );
      }}
      keyExtractor={(item) => item.id}
      showDividers
    />
  );
}
``` 