# Accessibility Guide for AdvancedAnalytics

This guide details the accessibility features and best practices implemented in the AdvancedAnalytics component.

## Features

### Screen Reader Support

1. **Announcements**
   - Metric changes are announced
   - Loading states are communicated
   - Error states are properly conveyed
   - Chart data is described verbally

2. **ARIA Roles**
   ```typescript
   // Example of proper role usage
   <View
     accessible={true}
     accessibilityRole="summary"
     accessibilityLabel="Memory usage trend chart"
   >
     {/* Chart content */}
   </View>
   ```

3. **Focus Management**
   - Logical tab order
   - Focus trap in modals
   - Focus restoration after modal closes
   - Focus history maintained

### Keyboard Navigation

1. **Tab Order**
   - All interactive elements are focusable
   - Natural reading order is maintained
   - No keyboard traps
   - Skip links for main content

2. **Shortcuts**
   ```typescript
   // Available keyboard shortcuts
   'Enter/Space': 'Activate buttons and controls',
   'Tab': 'Move to next interactive element',
   'Shift + Tab': 'Move to previous interactive element',
   'Escape': 'Close modal or cancel action',
   'Arrow Keys': 'Navigate between chart data points'
   ```

3. **Modal Interaction**
   - First interactive element focused on open
   - Focus trapped within modal
   - Escape key closes modal
   - Focus restored on close

### Visual Accessibility

1. **Color Contrast**
   - WCAG 2.1 Level AA compliant (4.5:1 ratio)
   - High contrast mode support
   - Visible focus indicators
   - Color not sole means of conveying information

2. **Text Sizing**
   - Respects system font size settings
   - Maintains readability when scaled
   - Proper text spacing
   - Clear typography hierarchy

## Implementation Guide

### Screen Reader Implementation

```typescript
// Example of screen reader announcement
const handleMetricChange = (metric: keyof Metrics) => {
  AccessibilityInfo.announceForAccessibility(
    `${metric} metric selected. Current value is ${currentValue}`
  );
};

// Example of accessible chart
const renderChart = (data: ChartData) => (
  <View
    accessible={true}
    accessibilityRole="image"
    accessibilityLabel={`Chart showing ${metric} trends`}
    accessibilityValue={{
      text: `Current value: ${data.current}, Predicted value: ${data.predicted}`
    }}
  >
    <VictoryChart {...chartProps} />
  </View>
);
```

### Focus Management Implementation

```typescript
// Example of modal focus management
const ModalComponent = () => {
  const firstFocusableRef = useRef<TouchableOpacity>(null);
  const lastFocusableRef = useRef<TouchableOpacity>(null);

  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
    }
  }, [isOpen]);

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusableRef.current) {
        e.preventDefault();
        lastFocusableRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusableRef.current) {
        e.preventDefault();
        firstFocusableRef.current?.focus();
      }
    }
  };

  return (
    <Modal>
      <TouchableOpacity ref={firstFocusableRef}>First Element</TouchableOpacity>
      {/* Modal content */}
      <TouchableOpacity ref={lastFocusableRef}>Last Element</TouchableOpacity>
    </Modal>
  );
};
```

## Testing Accessibility

### Manual Testing

1. **Screen Reader Testing**
   - Test with VoiceOver (iOS)
   - Test with TalkBack (Android)
   - Verify all content is announced
   - Check reading order

2. **Keyboard Testing**
   - Verify tab order
   - Test all keyboard shortcuts
   - Check focus indicators
   - Test modal interactions

### Automated Testing

```typescript
// Example of accessibility tests
describe('Accessibility', () => {
  it('announces metric changes', () => {
    const { getByText } = render(<AdvancedAnalytics results={mockResults} />);
    fireEvent.press(getByText('Memory'));
    expect(AccessibilityInfo.announceForAccessibility)
      .toHaveBeenCalledWith(expect.stringContaining('Memory metric selected'));
  });

  it('maintains focus trap in modal', () => {
    const { getByText, getAllByRole } = render(<AdvancedAnalytics />);
    fireEvent.press(getByText('Export'));
    const modalButtons = getAllByRole('button');
    const lastButton = modalButtons[modalButtons.length - 1];
    
    fireEvent(lastButton, 'accessibilityAction', { action: 'magicTap' });
    expect(modalButtons[0].props.accessibilityState.focused).toBe(true);
  });
});
```

## Common Issues and Solutions

1. **Focus Management**
   - Issue: Focus lost after modal closes
   - Solution: Store previous focus and restore after modal closes

2. **Screen Reader Announcements**
   - Issue: Too many announcements
   - Solution: Batch updates and prioritize important information

3. **Keyboard Navigation**
   - Issue: Unreachable elements
   - Solution: Ensure all interactive elements are in tab order

4. **Color Contrast**
   - Issue: Insufficient contrast in charts
   - Solution: Use patterns and shapes in addition to colors

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility) 