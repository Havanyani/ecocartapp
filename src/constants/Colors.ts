/**
 * Colors.ts
 * 
 * Contains color definitions for the EcoCart app.
 * This file provides color schemes for light and dark modes.
 */

const tintColorLight = '#34D399'; // Primary green color
const tintColorDark = '#4ADE80';

export default {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorLight,
    cardBackground: '#F9FAFB',
    border: '#E5E7EB',
    notification: '#FF4842',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    // Material-specific colors
    plastic: '#0EA5E9',
    paper: '#F59E0B',
    glass: '#6366F1',
    metal: '#94A3B8',
    electronic: '#EC4899',
    organic: '#22C55E',
  },
  dark: {
    text: '#FFFFFF',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorDark,
    cardBackground: '#1F2937',
    border: '#374151',
    notification: '#FF4842',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    // Material-specific colors
    plastic: '#38BDF8',
    paper: '#FBBF24',
    glass: '#818CF8',
    metal: '#CBD5E1',
    electronic: '#F472B6',
    organic: '#4ADE80',
  },
}; 