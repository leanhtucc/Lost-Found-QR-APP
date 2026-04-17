/**
 * Shared service URL builder helpers.
 * Keep all backend endpoint construction in one place.
 */

import { getApiUrl } from '@constants/environment';

type UrlSegment = string | number;

const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '');

const toPath = (segments: (UrlSegment | null | undefined)[]): string => {
  return segments
    .filter((segment): segment is UrlSegment => segment !== null && segment !== undefined)
    .map(segment => trimSlashes(String(segment)))
    .filter(Boolean)
    .join('/');
};

const apiBase = (): string => getApiUrl().replace(/\/+$/, '');

/** Build URL from API base without forcing /api prefix. */
export const buildBaseUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  const path = toPath(segments);
  return path ? `${apiBase()}/${path}` : apiBase();
};

/** Build URL under /api. */
export const buildApiUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildBaseUrl('api', ...segments);
};

export const buildAuthUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('auth', ...segments);
};

export const buildStreamUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('stream', ...segments);
};

export const buildItemsUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('items', ...segments);
};

export const buildMapUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('map', ...segments);
};

export const buildHomeUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('home', ...segments);
};

export const buildReportsUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('reports', ...segments);
};

export const buildUploadUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('upload', ...segments);
};

export const buildScanUrl = (...segments: (UrlSegment | null | undefined)[]): string => {
  return buildApiUrl('scan', ...segments);
};
