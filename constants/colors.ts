/**
 * Legacy palette for StyleSheet-based screens (modals, loaders).
 * Prefer Tailwind `fb-*` tokens + `FIND_BACK` in new UI.
 */
import { COLORS as DESIGN_COLORS, FIND_BACK, SEMANTIC_TOKENS } from './theme';

export { SEMANTIC_TOKENS };

const colors = {
  white: '#FFFFFF',
  black: '#000000',
  orange: FIND_BACK.tertiary,
  gray500: FIND_BACK.labelText,

  primary: FIND_BACK.primary,
  primaryLight: FIND_BACK.primaryLight,
  primaryDark: FIND_BACK.primaryDark,
  secondary: FIND_BACK.secondary,
  tertiary: FIND_BACK.tertiary,

  background: FIND_BACK.canvas,
  canvas: FIND_BACK.canvas,
  surface: FIND_BACK.surface,
  surfaceMuted: FIND_BACK.surfaceMuted,
  surfaceElevated: FIND_BACK.surfaceElevated,

  textPrimary: FIND_BACK.bodyText,
  textSecondary: FIND_BACK.mutedText,
  textTertiary: FIND_BACK.labelText,
  border: FIND_BACK.borderGlass,
  borderSubtle: FIND_BACK.borderSubtle,

  success: DESIGN_COLORS.success,
  warning: DESIGN_COLORS.warning,
  error: DESIGN_COLORS.error,
  danger: FIND_BACK.danger,
  info: FIND_BACK.info,
};

export default colors;
