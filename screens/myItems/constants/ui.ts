import colors from '@/constants/colors';

export const MY_ITEMS_COLORS = {
  background: colors.background,
  surface: colors.surface,
  surfaceMuted: '#162340',
  border: colors.border,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textMuted: '#6A7A96',

  primaryStart: colors.primary,
  primaryEnd: colors.tertiary,
  primarySoft: 'rgba(58, 169, 255, 0.16)',

  safeSoft: 'rgba(46, 204, 139, 0.14)',
  safeText: '#70FFBA',
  lostSoft: 'rgba(215, 51, 87, 0.14)',
  lostText: '#FF8DA3',
  pendingSoft: 'rgba(255, 176, 32, 0.14)',
  pendingText: '#FFAA8E',
} as const;

export const MY_ITEMS_PRIMARY_GRADIENT = [
  MY_ITEMS_COLORS.primaryStart,
  MY_ITEMS_COLORS.primaryEnd,
] as const;

export const MY_ITEMS_RADIUS = {
  card: 16,
  chip: 14,
  input: 14,
} as const;

export const MY_ITEMS_SHADOW = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 7,
  },
} as const;
