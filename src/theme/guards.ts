import { Theme, ThemeColors } from './types';

export function isThemeColors(value: unknown): value is ThemeColors {
  if (!value || typeof value !== 'object') return false;
  const colors = value as Partial<ThemeColors>;
  
  return (
    typeof colors.background === 'string' &&
    typeof colors.surface === 'string' &&
    typeof colors.primary === 'string' &&
    typeof colors.secondary === 'string' &&
    typeof colors.accent === 'string' &&
    typeof colors.error === 'string' &&
    typeof colors.warning === 'string' &&
    typeof colors.success === 'string' &&
    colors.text !== undefined &&
    colors.border !== undefined
  );
}

export function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== 'object') return false;
  const theme = value as Partial<Theme>;
  
  return (
    theme.colors !== undefined &&
    theme.spacing !== undefined &&
    theme.typography !== undefined &&
    theme.radii !== undefined &&
    typeof theme.isDark === 'boolean' &&
    isThemeColors(theme.colors)
  );
}

export function assertTheme(value: unknown): asserts value is Theme {
  if (!isTheme(value)) {
    throw new Error('Invalid theme object');
  }
} 