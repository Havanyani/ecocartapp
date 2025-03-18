# EcoCart Import Standards

This document outlines the import path standards for the EcoCart application to ensure consistency and prevent path resolution errors.

## Path Alias Structure

We use the following path aliases:

- `@/` - Root alias pointing to the `src` directory
- `@/components` - UI components directory
- `@/hooks` - React hooks
- `@/services` - Services like API clients
- `@/utils` - Utility functions
- `@/constants` - Constant values

## Component Import Standards

### UI Components

All UI components should be imported from the components/ui directory using the following pattern:

```typescript
// Correct
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';

// Incorrect
import { Button } from '@/ui/Button';
import { ThemedText } from '@/ThemedText';
import { ThemedText } from '../../ui/ThemedText';
```

### Feature Components

Feature-specific components should be imported from their respective directories:

```typescript
// Correct
import { MaterialCard } from '@/components/materials/MaterialCard';
import { GoalSettingCard } from '@/components/analytics/GoalSettingCard';

// Incorrect
import { MaterialCard } from '../../components/materials/MaterialCard';
```

## Hooks and Utils

Hooks and utility functions should be imported using the `@/` alias:

```typescript
// Correct
import { useTheme } from '@/hooks/useTheme';
import { formatDate } from '@/utils/dateUtils';

// Incorrect
import { useTheme } from '../../hooks/useTheme';
```

## Best Practices

1. **Always use absolute imports** with the `@/` alias instead of relative imports
2. **Group imports** by type (React, external libraries, internal components)
3. **Avoid deep imports** from node_modules packages
4. **Use named exports** rather than default exports when possible
5. **Be consistent** with import naming and casing

## Troubleshooting

If you encounter import path issues:

1. Ensure the import path matches the standards above
2. Check the component exists in the stated directory
3. Verify tsconfig.json has the correct path aliases configured
4. Run the path fixing scripts if needed:
   - `node fix-all-ui-imports.js` - Fixes UI component imports
   - `node fix-themedtext-imports.js` - Fixes ThemedText imports 