/**
 * Typography scale for FindBack.
 * Be Vietnam Pro is loaded in app-root.tsx and is the single app typeface.
 */

export const FONT_FAMILY = {
  display: 'BeVietnamPro_700Bold',
  sans: 'BeVietnamPro_400Regular',
  body: 'BeVietnamPro_400Regular',
  label: 'BeVietnamPro_500Medium',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
  bold: 'BeVietnamPro_700Bold',
  system: undefined as string | undefined,
} as const;

export const FONT_SIZE = {
  headline: 28,
  title: 22,
  body: 16,
  bodySm: 15,
  label: 13,
  caption: 12,
} as const;

export const LINE_HEIGHT = {
  headline: 34,
  title: 28,
  body: 24,
  bodySm: 22,
  label: 18,
  caption: 16,
} as const;

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/** Legacy: map to React Native default (SF Pro on iOS, Roboto on Android) */
const fonts = {
  fontSFProDisplayRegular: undefined as string | undefined,
  fontSFProDisplayMedium: undefined as string | undefined,
  fontSFProDisplaySemibold: undefined as string | undefined,
  fontSFProDisplayBold: undefined as string | undefined,
};

export default fonts;
