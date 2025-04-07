# Theme Unification Plan

## Current Issues
The EcoCart app currently has multiple theme definitions across different files:
- `src/hooks/useTheme.ts` - Defines Theme interfaces and the useTheme hook
- `src/types/theme.d.ts` - Defines AppTheme and related interfaces
- `src/providers/ThemeProvider.tsx` - Implements the theme provider using AppTheme

This fragmentation leads to:
- Type inconsistencies causing linter errors
- Difficulty maintaining consistent styling
- Confusion about which theme definition to use

## Consolidation Strategy

### Step 1: Create a single source of truth
Create a consolidated theme types file at `src/theme/types.ts` that exports all theme-related types:

```typescript
// src/theme/types.ts
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    h1: number;
    h2: number;
    h3: number;
    subtitle: number;
    body: number;
    caption: number;
  };
  lineHeight: {
    h1: number;
    h2: number;
    h3: number;
    subtitle: number;
    body: number;
    caption: number;
  };
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}
```

### Step 2: Create theme constants file
Create a theme constants file at `src/theme/constants.ts` for default values:

```typescript
// src/theme/constants.ts
import { Theme } from './types';

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',
    secondary: '#03DAC6',
    accent: '#03DAC6',
    background: '#F6F6F6',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FB8C00',
    error: '#F44336',
    info: '#2196F3',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      h1: 32,
      h2: 24,
      h3: 20,
      subtitle: 16,
      body: 14,
      caption: 12,
    },
    lineHeight: {
      h1: 40,
      h2: 32,
      h3: 28,
      subtitle: 24,
      body: 20,
      caption: 16,
    },
  }
};

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2C2C2C',
  }
};
```

### Step 3: Create a unified ThemeProvider
Create a consolidated ThemeProvider at `src/theme/ThemeProvider.tsx`:

```typescript
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Theme } from './types';
import { darkTheme, lightTheme } from './constants';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(
    colorScheme === 'dark' ? darkTheme : lightTheme
  );

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme.dark ? lightTheme : darkTheme));
  };

  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Step 4: Create helper functions for theme utilities
Create theme utility functions at `src/theme/utils.ts`:

```typescript
// src/theme/utils.ts
import { Theme } from './types';

export const getSpacing = (theme: Theme, size: keyof Theme['spacing']) => {
  return theme.spacing[size];
};

export const getFontSize = (theme: Theme, type: keyof Theme['typography']['fontSize']) => {
  return theme.typography.fontSize[type];
};

export const getColor = (theme: Theme, color: keyof Theme['colors']) => {
  return theme.colors[color];
};
```

### Step 5: Clean up and migrate
1. Export everything from a single index file:
```typescript
// src/theme/index.ts
export * from './types';
export * from './constants';
export * from './ThemeProvider';
export * from './utils';
```

2. Deprecate the old files:
- `src/hooks/useTheme.ts` - Add a deprecation notice
- `src/types/theme.d.ts` - Add a deprecation notice
- `src/providers/ThemeProvider.tsx` - Add a deprecation notice

3. Update imports across the codebase to use the new unified theme system:
```typescript
// Example component update
import { useTheme } from '@/theme';
```

## Implementation Timeline
1. **Week 1**: Create the consolidated types and constants
2. **Week 2**: Create the new ThemeProvider and utility functions
3. **Week 3**: Gradually migrate components to use the new theme system
4. **Week 4**: Remove deprecated files and resolve any remaining issues

## Benefits
- Single source of truth for theme definitions
- Consistent typing across the application
- Easier theme maintenance and customization
- Reduced linter errors related to theme usage
- Clear documentation of theme structures 