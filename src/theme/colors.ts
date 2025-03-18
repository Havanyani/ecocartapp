export const colors = {
  // Light theme
  primary: '#007AFF',
  background: '#f8f8f8',
  surface: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  border: '#cccccc',
  orange: '#FF9500',
  green: '#34C759',
  purple: '#5856D6',
  error: '#FF3B30',

  // Dark theme
  primaryDark: '#0A84FF',
  backgroundDark: '#000000',
  surfaceDark: '#1C1C1E',
  textDark: '#ffffff',
  textSecondaryDark: '#EBEBF5',
  borderDark: '#38383A',
  orangeDark: '#FF9F0A',
  greenDark: '#30D158',
  purpleDark: '#5E5CE6',
  errorDark: '#FF453A',
} as const;

export type ColorScheme = typeof colors; 