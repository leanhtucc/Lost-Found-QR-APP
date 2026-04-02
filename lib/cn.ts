/**
 * Join Tailwind / NativeWind class names without extra dependencies.
 */
export function cn(...parts: (string | undefined | null | false)[]): string {
  return parts.filter(Boolean).join(' ');
}
