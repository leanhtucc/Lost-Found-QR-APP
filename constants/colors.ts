/**
 * Legacy palette for StyleSheet-based screens (modals, loaders).
 * Prefer Tailwind `fb-*` tokens + `FIND_BACK` in new UI.
 */
import { COLORS as DESIGN_COLORS, FIND_BACK } from './theme';

const colors = {
  white: '#FFFFFF',
  black: '#000000',
  orange: FIND_BACK.tertiary,
  gray500: FIND_BACK.labelText,

  primary: FIND_BACK.primary,
  secondary: FIND_BACK.secondary,
  tertiary: FIND_BACK.tertiary,

  background: FIND_BACK.canvas,
  surface: FIND_BACK.surface,

  textPrimary: FIND_BACK.bodyText,
  textSecondary: FIND_BACK.mutedText,
  border: FIND_BACK.borderGlass,

  success: DESIGN_COLORS.success,
  warning: DESIGN_COLORS.warning,
  error: DESIGN_COLORS.error,
};

export default colors;
