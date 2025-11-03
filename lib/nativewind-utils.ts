/**
 * NativeWind utility functions for working with the theme
 * Provides helpers to access color scheme values with NativeWind classes
 */

import { ColorScheme, ColorKey } from '@/constants/colors';

/**
 * Get a color value from the color scheme
 * Useful when you need the raw color value for inline styles or other purposes
 */
export function getColor(key: ColorKey): string {
  return ColorScheme[key];
}

/**
 * Get Tailwind class name for a color from the color scheme
 * Example: getColorClass('accent-primary') returns 'text-accent-primary' or 'bg-accent-primary'
 */
export function getColorClass(key: ColorKey, type: 'text' | 'bg' | 'border' = 'text'): string {
  return `${type}-${key}`;
}

/**
 * Common color combinations for the design system
 */
export const colorClasses = {
  // Backgrounds
  bgPrimary: 'bg-bg-primary',
  bgSecondary: 'bg-bg-secondary',
  bgTertiary: 'bg-bg-tertiary',
  surfaceGlass: 'bg-surface-glass',
  
  // Text
  textPrimary: 'text-text-primary',
  textSecondary: 'text-text-secondary',
  textTertiary: 'text-text-tertiary',
  
  // Borders
  border: 'border-border',
  borderLight: 'border-border-light',
  
  // Accents
  accentPrimary: 'text-accent-primary',
  accentBg: 'bg-accent-primary',
  accentHover: 'bg-accent-hover',
  
  // Status
  success: 'text-success',
  successBg: 'bg-success',
  warning: 'text-warning',
  warningBg: 'bg-warning',
  error: 'text-error',
  errorBg: 'bg-error',
  
  // Weather
  sun: 'text-sun',
  sunBg: 'bg-sun',
  rain: 'text-rain',
  rainBg: 'bg-rain',
  storm: 'text-storm',
  stormBg: 'bg-storm',
  snow: 'text-snow',
  snowBg: 'bg-snow',
  fog: 'text-fog',
  fogBg: 'bg-fog',
  moon: 'text-moon',
  moonBg: 'bg-moon',
  stars: 'text-stars',
  starsBg: 'bg-stars',
} as const;

