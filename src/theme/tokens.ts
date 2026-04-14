/**
 * Design tokens — single source of truth for all visual values.
 *
 * COLOUR STATUS: PROVISIONAL — pending sunlight readability testing.
 * These values come from the Base44 prototype as a starting point.
 * To retheme: update `palette` below. The tailwind.config.js and
 * semantic aliases in colors.ts derive everything from here.
 */

export const palette = {
  // Greens / accent
  lime300: '#d9ff4d',
  lime400: '#CCFF00',
  lime500: '#b3e600',

  // Neutrals (dark theme provisional)
  black: '#000000',
  neutral950: '#0A0A0A',
  neutral900: '#121212',
  neutral850: '#1A1A1A',
  neutral800: '#1E1E1E',
  neutral700: '#2A2A2A',
  neutral600: '#3A3A3A',
  neutral500: '#6B7280',
  neutral400: '#9CA3AF',
  neutral300: '#D1D5DB',
  neutral200: '#E5E7EB',
  white: '#FFFFFF',

  // Status
  red400: '#F87171',
  red500: '#EF4444',
  green400: '#4ADE80',
  green500: '#22C55E',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
