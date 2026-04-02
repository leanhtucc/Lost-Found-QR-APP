/**
 * FindBack / Obsidian — design tokens (dark, glassmorphism).
 * Legacy THEME ramps kept for gradual migration; brand accents match marketing UI.
 */

/** Core brand hex from design spec */
export const FIND_BACK = {
  primary: '#7C6AF6',
  primaryDark: '#6B5AE8',
  secondary: '#2ECC8B',
  tertiary: '#F4845F',
  neutral: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A24',
  bodyText: '#E4E4E7',
  mutedText: '#A0A0A8',
  labelText: '#71717A',
  borderGlass: 'rgba(255, 255, 255, 0.12)',
  glassBackground: 'rgba(18, 18, 26, 0.72)',
  danger: '#EF4444',
} as const;

export const THEME = {
  primary: {
    50: '#f5f4ff',
    100: '#ebe9fe',
    200: '#d4d0fc',
    300: '#b8b0fa',
    400: '#978cf8',
    500: '#7C6AF6',
    600: '#6B5AE8',
    700: '#5a4ad4',
    800: '#4a3cb8',
    900: '#3d3296',
  },

  success: {
    50: '#ecfdf8',
    100: '#d1faec',
    200: '#a7f3d9',
    300: '#6ee7c2',
    400: '#47d4a8',
    500: '#2ECC8B',
    600: '#26b37a',
    700: '#1f9665',
    800: '#1a7a54',
    900: '#156347',
  },

  warning: {
    50: '#fff4f0',
    100: '#ffe4d9',
    200: '#fec6b3',
    300: '#fca88d',
    400: '#f89674',
    500: '#F4845F',
    600: '#e06d48',
    700: '#c45a3a',
    800: '#a24a30',
    900: '#853d28',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  /** Dark neutrals for FindBack UI */
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#0A0A0F',
  },
};

export const COLORS = {
  primary: THEME.primary[500],
  primaryLight: THEME.primary[400],
  primaryDark: THEME.primary[600],

  success: THEME.success[500],
  successLight: THEME.success[400],
  successDark: THEME.success[600],

  warning: THEME.warning[500],
  warningLight: THEME.warning[400],
  warningDark: THEME.warning[600],

  error: THEME.error[500],
  errorLight: THEME.error[400],
  errorDark: THEME.error[600],

  trustGold: '#FFD700',
  trustSilver: '#C0C0C0',
  trustBronze: '#CD7F32',

  background: FIND_BACK.neutral,
  backgroundSecondary: FIND_BACK.surface,
  surfaceElevated: FIND_BACK.surfaceElevated,

  textPrimary: '#FAFAFA',
  textSecondary: FIND_BACK.mutedText,
  textTertiary: FIND_BACK.labelText,

  border: 'rgba(255,255,255,0.12)',
  borderLight: 'rgba(255,255,255,0.06)',

  verified: '#3b82f6',
  online: THEME.success[500],
};

export const TAILWIND_CLASSES = {
  bgPrimary: 'bg-fb-primary',
  bgPrimaryLight: 'bg-fb-primary/90',
  bgPrimaryDark: 'bg-fb-primary-dark',
  textPrimary: 'text-fb-primary',
  borderPrimary: 'border-fb-primary',

  bgSuccess: 'bg-fb-secondary',
  textSuccess: 'text-fb-secondary',
  borderSuccess: 'border-fb-secondary',

  bgWarning: 'bg-fb-tertiary',
  textWarning: 'text-fb-tertiary',
  borderWarning: 'border-fb-tertiary',

  bgError: 'bg-fb-danger',
  textError: 'text-fb-danger',
  borderError: 'border-fb-danger',

  glassPanel: 'glass-panel',
};

export default COLORS;
