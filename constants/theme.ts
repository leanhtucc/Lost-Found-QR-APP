/**
 * FindBack / Obsidian — design tokens (dark, glassmorphism).
 * Legacy THEME ramps kept for gradual migration; brand accents match marketing UI.
 */

/** Core brand hex from design spec */
export const FIND_BACK = {
  primary: '#7C6AF6',
  primaryLight: '#978CF8',
  primaryDark: '#6B5AE8',
  secondary: '#2ECC8B',
  tertiary: '#F4845F',
  neutral: '#0A0A0F',
  canvas: '#0E0E13',
  surface: '#131319',
  surfaceMuted: '#1F1F26',
  surfaceElevated: '#25252D',
  bodyText: '#F9F5FD',
  mutedText: '#ACAAB1',
  labelText: '#71717A',
  borderGlass: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(72, 71, 77, 0.15)',
  glassBackground: 'rgba(19, 19, 25, 0.72)',
  danger: '#D73357',
  info: '#ADA3FF',
} as const;

export const THEME = {
  primary: {
    50: '#f6f4ff',
    100: '#ece9ff',
    200: '#d7d1ff',
    300: '#bcb1ff',
    400: '#a08fff',
    500: '#7C6AF6',
    600: '#6B5AE8',
    700: '#5749cc',
    800: '#4539a8',
    900: '#342e80',
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
    50: '#fff2ed',
    100: '#ffe4d9',
    200: '#fec6b3',
    300: '#fca88d',
    400: '#f78d6d',
    500: '#F4845F',
    600: '#de6f4d',
    700: '#c05d41',
    800: '#9b4a34',
    900: '#7b3a2a',
  },

  error: {
    50: '#fcecf1',
    100: '#f8d8e3',
    200: '#f1b3ca',
    300: '#e98baf',
    400: '#e1618c',
    500: '#D73357',
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
    500: '#71717A',
    600: '#515161',
    700: '#363644',
    800: '#1f1f2b',
    900: '#0A0A0F',
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
    500: '#F4845F',
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
