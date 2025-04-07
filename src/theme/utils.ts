/**
 * Theme utility functions for consistent access to theme properties
 * @module theme/utils
 */

import { Theme } from './types';

/**
 * Get a spacing value from the theme
 */
export const getSpacing = (theme: Theme | undefined, size: keyof Theme['spacing']) => {
  if (!theme || !theme.spacing) {
    console.warn('Theme or spacing is undefined');
    return 8; // Safe default
  }
  return theme.spacing[size] || 8;
};

/**
 * Get a font size value from the theme
 */
export const getFontSize = (theme: Theme | undefined, type: keyof Theme['typography']['fontSize']) => {
  if (!theme || !theme.typography || !theme.typography.fontSize) {
    console.warn('Theme typography or fontSize is undefined');
    return 16; // Safe default
  }
  return theme.typography.fontSize[type] || 16;
};

/**
 * Get a line height value from the theme
 */
export const getLineHeight = (theme: Theme | undefined, type: keyof Theme['typography']['lineHeight']) => {
  if (!theme || !theme.typography || !theme.typography.lineHeight) {
    console.warn('Theme typography or lineHeight is undefined');
    return 24; // Safe default
  }
  return theme.typography.lineHeight[type] || 24;
};

/**
 * Get a color value from the theme
 */
export const getColor = (theme: Theme | undefined, color: keyof Theme['colors']) => {
  if (!theme || !theme.colors) {
    console.warn('Theme or colors is undefined');
    return '#000000'; // Safe default
  }
  return theme.colors[color] || '#000000';
};

/**
 * Create spacing object with all directions
 */
export const createSpacing = (theme: Theme | undefined, size: keyof Theme['spacing']) => {
  const value = getSpacing(theme, size);
  return {
    margin: value,
    marginTop: value,
    marginRight: value,
    marginBottom: value,
    marginLeft: value,
    padding: value,
    paddingTop: value,
    paddingRight: value,
    paddingBottom: value,
    paddingLeft: value,
  };
};

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (
  theme: Theme | undefined, 
  defaultSize: keyof Theme['spacing'],
  { sm, md, lg }: { 
    sm?: keyof Theme['spacing'], 
    md?: keyof Theme['spacing'], 
    lg?: keyof Theme['spacing'] 
  } = {}
) => {
  // This is a placeholder - in a real implementation, you would detect screen size
  // and return the appropriate spacing value
  return getSpacing(theme, defaultSize);
}; 