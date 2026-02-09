/**
 * Theme Constants
 * Professional Lost & Found Color Palette
 * Based on Indigo and Emerald colors
 */

export const THEME = {
  // Primary Colors - Indigo
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5', // Main Primary
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // Success Colors - Emerald
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main Success
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Warning Colors - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Colors - Red
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

  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Semantic Colors
export const COLORS = {
  // Primary
  primary: THEME.primary[600],
  primaryLight: THEME.primary[500],
  primaryDark: THEME.primary[700],

  // Success
  success: THEME.success[500],
  successLight: THEME.success[400],
  successDark: THEME.success[600],

  // Warning
  warning: THEME.warning[500],
  warningLight: THEME.warning[400],
  warningDark: THEME.warning[600],

  // Error
  error: THEME.error[500],
  errorLight: THEME.error[400],
  errorDark: THEME.error[600],

  // Trust Score Colors
  trustGold: '#FFD700', // Gold for high trust
  trustSilver: '#C0C0C0', // Silver for medium trust
  trustBronze: '#CD7F32', // Bronze for low trust

  // Background
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',

  // Text
  textPrimary: THEME.neutral[900],
  textSecondary: THEME.neutral[600],
  textTertiary: THEME.neutral[400],

  // Border
  border: THEME.neutral[200],
  borderLight: THEME.neutral[100],

  // Verified Badge
  verified: '#3b82f6', // Blue for verified badge

  // Online Status
  online: THEME.success[500],
};

// Export tailwind class mappings
export const TAILWIND_CLASSES = {
  // Primary
  bgPrimary: 'bg-indigo-600',
  bgPrimaryLight: 'bg-indigo-500',
  bgPrimaryDark: 'bg-indigo-700',
  textPrimary: 'text-indigo-600',
  borderPrimary: 'border-indigo-600',

  // Success
  bgSuccess: 'bg-emerald-500',
  textSuccess: 'text-emerald-600',
  borderSuccess: 'border-emerald-500',

  // Warning
  bgWarning: 'bg-amber-500',
  textWarning: 'text-amber-600',
  borderWarning: 'border-amber-500',

  // Error
  bgError: 'bg-red-500',
  textError: 'text-red-600',
  borderError: 'border-red-500',
};

export default COLORS;
