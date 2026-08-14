import { FIND_BACK } from '@/constants/theme';

export const REPORT_COLORS = {
  background: FIND_BACK.canvas,
  surface: FIND_BACK.surface,
  surfaceSoft: FIND_BACK.surfaceElevated,
  border: FIND_BACK.borderGlass,
  textPrimary: FIND_BACK.bodyText,
  textSecondary: FIND_BACK.mutedText,
  textMuted: FIND_BACK.labelText,
  accent: FIND_BACK.primaryLight,
  accentStrong: FIND_BACK.primary,
  accentSoft: 'rgba(124, 106, 246, 0.16)',
  accentGlow: 'rgba(124, 106, 246, 0.42)',
  chipBg: 'rgba(124, 106, 246, 0.14)',
  success: FIND_BACK.secondary,
  ctaText: FIND_BACK.bodyText,
  ctaGradient: [FIND_BACK.primary, FIND_BACK.primaryDark] as [string, string],
  cardGradient: ['rgba(124, 106, 246, 0.12)', 'rgba(19, 19, 25, 0.68)'] as [string, string],
};

export const REPORT_LAYOUT = {
  horizontalPadding: 24,
  cardRadius: 20,
  footerSpacing: 20,
};
