/**
 * Semantic color aliases — map design intent to palette values.
 *
 * PROVISIONAL: awaiting sunlight validation by alpha testers.
 * All colors derive from palette in tokens.ts — change that file to retheme.
 */
import { palette } from './tokens';

export const colors = {
  // Backgrounds
  background: palette.neutral900,
  surface: palette.neutral800,
  surfaceRaised: palette.neutral700,

  // Borders
  border: palette.neutral600,
  borderSubtle: palette.neutral700,

  // Accent (primary CTA, active tab, focus)
  accent: palette.lime400,
  accentPressed: palette.lime500,
  accentForeground: palette.black,

  // Text
  foreground: palette.white,
  mutedForeground: palette.neutral400,
  subtleForeground: palette.neutral500,

  // Navigation
  tabActive: palette.lime400,
  tabInactive: palette.neutral500,
  tabBackground: palette.neutral850,

  // Status
  danger: palette.red500,
  dangerSubtle: palette.red400,
  success: palette.green500,
  successSubtle: palette.green400,
  warning: palette.amber500,

  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
} as const;

export type ColorKey = keyof typeof colors;
