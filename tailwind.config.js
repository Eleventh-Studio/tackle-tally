const { palette, radii } = require('./src/theme/tokens');
const { colors } = require('./src/theme/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Semantic aliases — used as className="bg-background text-foreground" etc.
        background: colors.background,
        surface: colors.surface,
        'surface-raised': colors.surfaceRaised,
        border: colors.border,
        'border-subtle': colors.borderSubtle,
        accent: colors.accent,
        'accent-pressed': colors.accentPressed,
        'accent-fg': colors.accentForeground,
        foreground: colors.foreground,
        muted: colors.mutedForeground,
        subtle: colors.subtleForeground,
        'tab-active': colors.tabActive,
        'tab-inactive': colors.tabInactive,
        'tab-bg': colors.tabBackground,
        danger: colors.danger,
        success: colors.success,
        warning: colors.warning,
        // Raw palette for one-offs
        ...Object.fromEntries(
          Object.entries(palette).map(([k, v]) => [`palette-${k}`, v])
        ),
      },
      borderRadius: {
        sm: `${radii.sm}px`,
        md: `${radii.md}px`,
        lg: `${radii.lg}px`,
        xl: `${radii.xl}px`,
        '2xl': `${radii['2xl']}px`,
        card: `${radii.lg}px`,
        modal: `${radii['2xl']}px`,
        input: `${radii.md}px`,
        btn: `${radii.md}px`,
      },
    },
  },
  plugins: [],
};
