# WeightInput

## Overview
The `WeightInput` component is a specialized input field designed for weight entry with unit selection in the EcoCart application. It builds on the base `FormInput` component, adding features like unit conversion, value validation, and consistent weight formatting across the app.

## Usage

```tsx
import { WeightInput } from '@/components/ui/WeightInput';

// Basic usage
<WeightInput
  label="Item Weight"
  onWeightChange={(weight, unit) => console.log(weight, unit)}
/>

// With initial values
<WeightInput
  label="Package Weight"
  initialValue={1.5}
  initialUnit="kg"
  onWeightChange={handleWeightChange}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | - | The label text displayed above the input |
| `initialValue` | `number` | No | `0` | Initial weight value |
| `initialUnit` | `'kg' \| 'g' \| 'lb' \| 'oz'` | No | `'kg'` | Initial weight unit |
| `error` | `string` | No | `undefined` | Error message to display below the input |
| `allowedUnits` | `Array<'kg' \| 'g' \| 'lb' \| 'oz'>` | No | `['kg', 'g', 'lb', 'oz']` | Units that can be selected |
| `minWeight` | `number` | No | `0` | Minimum weight value allowed |
| `maxWeight` | `number` | No | `1000` | Maximum weight value allowed |
| `decimalPrecision` | `number` | No | `2` | Number of decimal places allowed |
| `onWeightChange` | `(value: number, unit: string) => void` | No | - | Callback when weight or unit changes |
| `style` | `StyleProp<TextInputProps>` | No | `undefined` | Custom styles for the text input |

## Features
- **Unit Selection**: Drop-down menu to select weight units (kg, g, lb, oz)
- **Automatic Validation**: Ensures weight values are within specified range
- **Unit Conversion**: Maintains consistent weight when changing units
- **Decimal Precision Control**: Configurable decimal places for display
- **Keyboard Optimization**: Numeric keyboard with decimal support
- **Theme Integration**: Automatically applies theme colors for consistent styling

## Styling
The component extends the `FormInput` component's styling with additional elements:

```tsx
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  unitSelector: {
    marginLeft: 8,
    minWidth: 80,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});
```

## Best Practices
- **Do**: Provide clear context on which weight unit is appropriate for the item
- **Do**: Use appropriate min/max values for your specific use case (e.g., smaller range for food items)
- **Do**: Set appropriate decimal precision based on the expected accuracy needed
- **Don't**: Use this component for non-weight measurements
- **Accessibility**: Ensure units are clearly identified for screen readers

## Examples

### Basic Weight Input
```tsx
<WeightInput
  label="Item Weight"
  initialValue={0}
  initialUnit="kg"
  onWeightChange={(weight, unit) => {
    setItemWeight(weight);
    setItemUnit(unit);
  }}
/>
```

### Limited Unit Selection
```tsx
<WeightInput
  label="Food Weight"
  allowedUnits={['g', 'oz']}
  minWeight={1}
  maxWeight={5000}
  decimalPrecision={1}
  onWeightChange={handleFoodWeightChange}
/>
```

### With Error Handling
```tsx
const [weight, setWeight] = useState(0);
const [unit, setUnit] = useState('kg');
const [error, setError] = useState('');

const handleWeightChange = (value, selectedUnit) => {
  setWeight(value);
  setUnit(selectedUnit);
  
  // Custom validation
  if (value > 20 && selectedUnit === 'kg') {
    setError('Weight exceeds shipping limit');
  } else {
    setError('');
  }
};

return (
  <WeightInput
    label="Package Weight"
    initialValue={weight}
    initialUnit={unit}
    error={error}
    onWeightChange={handleWeightChange}
  />
);
```

### In a Form with Multiple Fields
```tsx
<View style={{ gap: 16 }}>
  <FormInput
    label="Item Name"
    placeholder="Enter item name"
  />
  <WeightInput
    label="Item Weight"
    initialUnit="g"
    allowedUnits={['g', 'kg']}
    onWeightChange={handleWeightChange}
  />
  <FormInput
    label="Description"
    placeholder="Enter item description"
    multiline
    numberOfLines={3}
  />
</View>
```

## Implementation Details
The component handles unit conversion and weight validation:

```tsx
export function WeightInput({
  label,
  initialValue = 0,
  initialUnit = 'kg',
  error,
  allowedUnits = ['kg', 'g', 'lb', 'oz'],
  minWeight = 0,
  maxWeight = 1000,
  decimalPrecision = 2,
  onWeightChange,
  style,
}: WeightInputProps) {
  const { theme } = useTheme();
  const [weight, setWeight] = useState(initialValue.toString());
  const [unit, setUnit] = useState(initialUnit);
  const [internalError, setInternalError] = useState('');
  
  // Unit conversion factors (to kg)
  const conversionFactors = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    oz: 0.0283495
  };
  
  const handleWeightChange = (text: string) => {
    // Allow only numeric input with decimal
    if (!/^-?\d*\.?\d*$/.test(text) && text !== '') {
      return;
    }
    
    setWeight(text);
    
    const numericValue = parseFloat(text);
    if (isNaN(numericValue)) {
      setInternalError('');
      if (onWeightChange) onWeightChange(0, unit);
      return;
    }
    
    // Validate min/max
    if (numericValue < minWeight) {
      setInternalError(`Weight must be at least ${minWeight}${unit}`);
    } else if (numericValue > maxWeight) {
      setInternalError(`Weight cannot exceed ${maxWeight}${unit}`);
    } else {
      setInternalError('');
    }
    
    if (onWeightChange) {
      onWeightChange(
        parseFloat(numericValue.toFixed(decimalPrecision)), 
        unit
      );
    }
  };
  
  const handleUnitChange = (selectedUnit: string) => {
    // Convert weight value based on unit change
    const currentValueInKg = parseFloat(weight) * conversionFactors[unit as keyof typeof conversionFactors];
    const newValue = currentValueInKg / conversionFactors[selectedUnit as keyof typeof conversionFactors];
    
    setUnit(selectedUnit);
    setWeight(newValue.toFixed(decimalPrecision));
    
    if (onWeightChange) {
      onWeightChange(
        parseFloat(newValue.toFixed(decimalPrecision)),
        selectedUnit
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.label}>{label}</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.colors.card,
              borderColor: (error || internalError) ? theme.colors.error : theme.colors.border,
              color: theme.colors.text.primary,
            },
            style,
          ]}
          value={weight}
          onChangeText={handleWeightChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.colors.text.secondary}
        />
        <Dropdown
          style={styles.unitSelector}
          items={allowedUnits.map(u => ({ label: u, value: u }))}
          value={unit}
          onValueChange={handleUnitChange}
        />
      </View>
      {(error || internalError) && (
        <ThemedText 
          variant="body" 
          style={[styles.error, { color: theme.colors.error }]}
        >
          {error || internalError}
        </ThemedText>
      )}
    </View>
  );
}
```

## Related Components
- `FormInput`: Base input component that this extends
- `Dropdown`: Used for unit selection
- `ThemedText`: Used for labels and error messages
- `QuantityInput`: Related component for quantity selection

## Related Documentation
- [Form Components](../../components/form/README.md)
- [Form Validation Guide](../../../docs/guides/form-validation.md)
- [Recycling Guidelines](../../../docs/user/recycling-guidelines.md)
- [FormInput Component](./FormInput.README.md)
- [Dropdown Component](./Dropdown.README.md)
- [UI Components Overview](../README.md) 