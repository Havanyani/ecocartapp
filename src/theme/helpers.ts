import { Theme, ThemeColors } from './types';

export function getContrastColor(color: string): string {
  // Simple luminance calculation
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function getThemeColor(theme: Theme, variant: keyof ThemeColors | 'surface'): string {
  if (variant === 'surface') {
    return theme.colors.surface;
  }
  return theme.colors[variant];
}

export function getSpacing(theme: Theme, size: keyof Theme['spacing']): number {
  return theme.spacing[size];
}

export function getFontSize(theme: Theme, size: keyof Theme['typography']['fontSize']): number {
  return theme.typography.fontSize[size];
}

export function getRadius(theme: Theme, size: keyof Theme['radii']): number {
  return theme.radii[size];
}

export function createThemedStyle<T extends object>(theme: Theme, styleFactory: (theme: Theme) => T): T {
  return styleFactory(theme);
}

export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
} 