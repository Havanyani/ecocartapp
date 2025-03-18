# HapticTab

## Overview
The `HapticTab` component provides a tab-based navigation interface with haptic feedback for enhanced user experience. It can be used for tab navigation, segmented controls, or any interface requiring discrete selection options. The integrated haptic feedback provides tactile confirmation of user interactions.

## Usage

```tsx
import { HapticTab } from '@/components/ui/HapticTab';

// Basic usage with tab data
const tabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' }
];

function FilterTabs() {
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <HapticTab
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

// Single tab/button usage
function HapticButton() {
  const handlePress = () => {
    console.log('Button pressed');
  };
  
  return (
    <HapticTab
      onPress={handlePress}
      active={true}
      accessibilityLabel="Refresh data"
    >
      <IconSymbol name="refresh" size={20} color="#007AFF" />
    </HapticTab>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tabs` | `Array<{ key: string, label: string }>` | No | `undefined` | Array of tab objects for multi-tab mode |
| `activeTab` | `string` | No | `undefined` | Key of the currently active tab |
| `onTabChange` | `(tab: string) => void` | No | `undefined` | Callback when tab selection changes |
| `children` | `React.ReactNode` | No | `undefined` | Children for single tab mode |
| `style` | `StyleProp<ViewStyle>` | No | `undefined` | Custom style for the container |
| `onPress` | `() => void` | No | `undefined` | Press handler for single tab mode |
| `active` | `boolean` | No | `false` | Whether the tab is active (single tab mode) |
| `disabled` | `boolean` | No | `false` | Whether the tab is disabled |
| `accessibilityLabel` | `string` | No | `undefined` | Accessibility label for screen readers |
| `accessibilityRole` | `AccessibilityRole` | No | `'tab'` | Accessibility role for the component |
| `accessibilityState` | `{ selected?: boolean }` | No | `undefined` | Accessibility state properties |
| `testID` | `string` | No | `undefined` | Test identifier for testing frameworks |

## Features
- **Haptic Feedback**: Provides tactile response using Expo's Haptics API
- **Multiple Modes**: Supports both multi-tab (tabs array) and single tab (children) modes
- **Customizable**: Allows styling customization for various UI requirements
- **Accessibility Support**: Includes proper accessibility roles and states
- **Theme Integration**: Adapts to the application's theming system
- **Active State**: Visual indication of the active tab
- **Animation**: Smooth transitions between tab states

## Styling
The component includes default styling for common tab usage patterns:

```tsx
// Container styling in multi-tab mode
<View style={[styles.container, style]}>
  {/* Tab content */}
</View>

// Individual tab styling
<Pressable
  style={({ pressed }) => [
    styles.tab,
    isActive && styles.activeTab,
    pressed && styles.pressedTab
  ]}
>
  {/* Tab label */}
</Pressable>
```

You can override or extend these styles:

```tsx
// Custom container styling
<HapticTab
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  style={{
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 4,
    elevation: 2
  }}
/>
```

## Best Practices
- **Do**: Keep tab labels concise and descriptive
- **Do**: Limit the number of tabs (ideally 2-5) for better usability
- **Do**: Ensure sufficient touch target size (at least 44x44 px)
- **Don't**: Use for primary navigation when the bottom tab bar is present
- **Accessibility**: Provide meaningful accessibility labels
- **Performance**: Avoid complex component trees inside tabs to maintain smooth haptic feedback

## Examples

### Basic Tab Navigation
```tsx
const tabs = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' }
];

function TimeRangeSelector() {
  const [timeRange, setTimeRange] = useState('weekly');
  
  return (
    <HapticTab
      tabs={tabs}
      activeTab={timeRange}
      onTabChange={setTimeRange}
    />
  );
}
```

### Custom Styled Tabs
```tsx
function StatusFilter() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');
  
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' }
  ];
  
  return (
    <HapticTab
      tabs={filters}
      activeTab={filter}
      onTabChange={setFilter}
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 25,
        padding: 4,
        marginHorizontal: 16,
        marginVertical: 12,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      }}
    />
  );
}
```

### Single Tab with Icon
```tsx
function RefreshButton({ onRefresh, isRefreshing }) {
  return (
    <HapticTab
      onPress={onRefresh}
      disabled={isRefreshing}
      accessibilityLabel="Refresh data"
      accessibilityRole="button"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isRefreshing ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <IconSymbol name="refresh" size={20} color={theme.colors.primary} />
      )}
    </HapticTab>
  );
}
```

## Implementation Details
The component handles two distinct modes:

1. **Multi-tab mode**: When the `tabs` prop is provided, it renders a row of selectable tabs.
2. **Single tab mode**: When `children` is provided, it renders a single pressable component.

Haptic feedback is triggered on tab selection using Expo's Haptics API:

```tsx
const handlePress = async () => {
  // Trigger haptic feedback
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  // Call onPress or onTabChange handler
  if (onPress) {
    onPress();
  } else if (onTabChange) {
    onTabChange(tab.key);
  }
};
```

## Related Components
- `ThemedText`: Used for tab labels
- `IconSymbol`: Often used inside tabs as icons
- `TabBarIcon`: Used in bottom tab navigation

## Related Documentation
- [React Navigation Tab Navigation](https://reactnavigation.org/docs/tab-based-navigation/)
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Accessibility Guidelines](../../../docs/design/accessibility.md) 