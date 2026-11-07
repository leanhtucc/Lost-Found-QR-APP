/**
 * Lost and Found QR / Beacon — design tokens (deep navy, beacon blue, amber signal).
 * Legacy THEME ramps kept for gradual migration; brand accents match marketing UI.
 */

/** Core brand hex from design spec */
export const FIND_BACK = {
  primary: '#2B7FE8',
  primaryLight: '#7CC4FF',
  primaryDark: '#1D62C9',
  secondary: '#2ECC8B',
  tertiary: '#FFB020',
  neutral: '#050B14',
  canvas: '#08111F',
  surface: '#0F1A2E',
  surfaceMuted: '#162340',
  surfaceElevated: '#1C2B4A',
  bodyText: '#F1F6FF',
  mutedText: '#9AA9C2',
  labelText: '#6A7A96',
  borderGlass: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(120, 150, 200, 0.16)',
  glassBackground: 'rgba(15, 26, 46, 0.72)',
  danger: '#E5365B',
  warning: '#FFB020',
  success: '#2ECC8B',
  info: '#8FD3FF',
  bodyMuted: '#9AA9C2',
  subtleText: '#6A7A96',
  returnFlow: {
    mapOverlay: 'rgba(5, 11, 20, 0.94)',
    mapScrim: 'rgba(5, 11, 20, 0.42)',
    tracking: '#2B7FE8',
    arrived: '#2ECC8B',
    warning: '#FFB020',
    cardRadius: 24,
    controlRadius: 16,
    screenPadding: 16,
  },
} as const;

/** Standardized Semantic Tokens for Lost and Found QR / Obsidian Design System */
export const SEMANTIC_TOKENS = {
  // Surfaces & Backgrounds
  background: FIND_BACK.canvas,
  canvas: FIND_BACK.canvas,
  surface: FIND_BACK.surface,
  surfaceMuted: FIND_BACK.surfaceMuted,
  surfaceElevated: FIND_BACK.surfaceElevated,

  // Typography & Text
  textPrimary: FIND_BACK.bodyText,
  textSecondary: FIND_BACK.mutedText,
  textTertiary: FIND_BACK.labelText,

  // Brand & Status Accents
  primary: FIND_BACK.primary,
  primaryLight: FIND_BACK.primaryLight,
  primaryDark: FIND_BACK.primaryDark,
  success: FIND_BACK.secondary,
  warning: FIND_BACK.tertiary,
  danger: FIND_BACK.danger,
  info: FIND_BACK.info,

  // Borders & Outlines
  borderDefault: FIND_BACK.borderGlass,
  borderSubtle: FIND_BACK.borderSubtle,

  // Overlays & Translucency
  overlay: 'rgba(5, 11, 20, 0.78)',
  glassBackground: FIND_BACK.glassBackground,
} as const;

/** Standard Spacing Scale (8pt grid basis) */
export const SPACING_SCALE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

/** Standard Border Radius Scale */
export const RADIUS_SCALE = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const THEME = {
  primary: {
    50: '#eef8ff',
    100: '#d9efff',
    200: '#bce3ff',
    300: '#8fd3ff',
    400: '#7CC4FF',
    500: '#2B7FE8',
    600: '#1D62C9',
    700: '#1A6BC0',
    800: '#18559A',
    900: '#173F73',
  },

  secondary: {
    50: '#e8faf3',
    100: '#d0f5e6',
    200: '#a2ebce',
    300: '#73e1b5',
    400: '#45d79d',
    500: '#2ECC8B',
    600: '#26b377',
    700: '#1f9664',
    800: '#187550',
    900: '#11563d',
  },

  tertiary: {
    50: '#fff8e6',
    100: '#ffefc2',
    200: '#ffe08a',
    300: '#ffd05c',
    400: '#ffc23a',
    500: '#FFB020',
    600: '#e69a0c',
    700: '#bf7c0a',
    800: '#8f5d0a',
    900: '#6b450a',
  },

  error: {
    50: '#fcecf1',
    100: '#f8d8e3',
    200: '#f1b3ca',
    300: '#e98baf',
    400: '#e1618c',
    500: '#E5365B',
    600: '#be2b4b',
    700: '#9e233f',
    800: '#7f1c32',
    900: '#601526',
  },

  neutral: {
    50: '#f6f6f9',
    100: '#ececf2',
    200: '#d8d8e2',
    300: '#bcbccc',
    400: '#9a9ab0',
    500: '#6A7A96',
    600: '#515161',
    700: '#363644',
    800: '#1f1f2b',
    900: '#050B14',
  },

  /** Backward-compatible aliases */
  success: {
    50: '#e8faf3',
    100: '#d0f5e6',
    200: '#a2ebce',
    300: '#73e1b5',
    400: '#45d79d',
    500: '#2ECC8B',
    600: '#26b377',
    700: '#1f9664',
    800: '#187550',
    900: '#11563d',
  },
  warning: {
    50: '#fff2ed',
    100: '#ffe4d9',
    200: '#fec6b3',
    300: '#fca88d',
    400: '#f78d6d',
    500: '#FFB020',
    600: '#de6f4d',
    700: '#c05d41',
    800: '#9b4a34',
    900: '#7b3a2a',
  },
};

export const COLORS = {
  brandPrimary: FIND_BACK.primary,
  brandSecondary: FIND_BACK.secondary,
  brandTertiary: FIND_BACK.tertiary,

  primary: THEME.primary[500],
  primaryLight: THEME.primary[400],
  primaryDark: THEME.primary[600],

  secondary: THEME.secondary[500],
  secondaryLight: THEME.secondary[400],
  secondaryDark: THEME.secondary[600],

  tertiary: THEME.tertiary[500],
  tertiaryLight: THEME.tertiary[400],
  tertiaryDark: THEME.tertiary[600],

  success: THEME.secondary[500],
  successLight: THEME.secondary[400],
  successDark: THEME.secondary[600],

  warning: THEME.tertiary[500],
  warningLight: THEME.tertiary[400],
  warningDark: THEME.tertiary[600],

  error: THEME.error[500],
  errorLight: THEME.error[400],
  errorDark: THEME.error[600],
  danger: THEME.error[500],

  trustGold: '#FFD700',
  trustSilver: '#C0C0C0',
  trustBronze: '#CD7F32',
  trustPlatinum: '#E5E4E2',

  /** Third-party brand accents */
  googleBlue: '#4285F4',
  googleGreen: '#34A853',
  googleYellow: '#FBBC05',
  googleRed: '#EA4335',

  background: FIND_BACK.canvas,
  backgroundSecondary: FIND_BACK.surfaceMuted,
  surface: FIND_BACK.surface,
  surfaceElevated: FIND_BACK.surfaceElevated,

  textPrimary: FIND_BACK.bodyText,
  textSecondary: FIND_BACK.mutedText,
  textTertiary: FIND_BACK.labelText,

  border: FIND_BACK.borderGlass,
  borderLight: FIND_BACK.borderSubtle,

  verified: FIND_BACK.info,
  online: THEME.secondary[500],
  info: FIND_BACK.info,
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
