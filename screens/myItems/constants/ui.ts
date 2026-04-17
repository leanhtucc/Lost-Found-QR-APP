import colors from '@/constants/colors';

export const MY_ITEMS_COLORS = {
  background: colors.background,
  surface: colors.surface,
  surfaceMuted: '#F3F4F6',
  border: colors.border,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textMuted: '#9CA3AF',

  primaryStart: colors.primary,
  primaryEnd: colors.tertiary,
  primarySoft: '#FFEFE2',

  safeSoft: '#E8F7EF',
  safeText: colors.success,
  lostSoft: '#FEECEF',
  lostText: colors.error,
  pendingSoft: '#FFF7E7',
  pendingText: colors.warning,
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
