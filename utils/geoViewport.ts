/**
 * Geographic Viewport Utility
 * Phase 2 — Lost & Found Radar Map
 *
 * Provides accurate viewport radius calculation for map queries:
 * - Computes half-diagonal radius covering rectangular viewports
 * - Scales longitude span by latitude cosine: longitudeDelta * 111320 * cos(latRad)
 * - Clamps radius to backend constraints: 500m <= radius <= 10,000m
 * - Throttles insignificant map movements to prevent request spam
 */

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface ViewportQueryResult {
  lat: number;
  lng: number;
  radius: number;
  isCapped: boolean;
}

export const MIN_RADAR_RADIUS_METERS = 500;
export const MAX_RADAR_RADIUS_METERS = 10000;
const METERS_PER_LATITUDE_DEGREE = 111320;
const DEFAULT_VIEWPORT_PADDING = 1.1;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calculates the inscribed query radius for a visible map viewport.
 * Uses the half-diagonal of the rectangular viewport to ensure all 4 corners
 * are covered by the circular radar query.
 *
 * Longitude distance scales with latitude: cos(latitude).
 * When the viewport is zoomed out beyond the 10km server cap,
 * the query covers the capped 10km radius centered at the viewport.
 */
export function calculateViewportQuery(
  region: Region,
  paddingFactor: number = DEFAULT_VIEWPORT_PADDING
): ViewportQueryResult {
  const lat = Number(region.latitude.toFixed(6));
  const lng = Number(region.longitude.toFixed(6));

  const latDelta = Math.max(0, region.latitudeDelta);
  const lngDelta = Math.max(0, region.longitudeDelta);

  const latMeters = latDelta * METERS_PER_LATITUDE_DEGREE;
  const latRad = toRadians(lat);
  const lngMeters = lngDelta * METERS_PER_LATITUDE_DEGREE * Math.cos(latRad);

  // Half-diagonal of the rectangular viewport with padding
  const rawRadius = (Math.sqrt(latMeters * latMeters + lngMeters * lngMeters) / 2) * paddingFactor;

  const isCapped = rawRadius > MAX_RADAR_RADIUS_METERS;
  const clampedRadius = Math.min(
    MAX_RADAR_RADIUS_METERS,
    Math.max(MIN_RADAR_RADIUS_METERS, Math.round(rawRadius))
  );

  return {
    lat,
    lng,
    radius: clampedRadius,
    isCapped,
  };
}

/**
 * Computes Haversine distance in meters between two coordinates.
 */
export function getHaversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

/**
 * Checks whether the map has moved or zoomed significantly enough
 * to warrant a new viewport radar query.
 *
 * Prevents redundant network calls on micro-pans and slight tremors.
 */
export function isSignificantViewportChange(
  prevRegion: Region | null,
  nextRegion: Region,
  distanceThresholdMeters: number = 150,
  deltaRatioThreshold: number = 0.15
): boolean {
  if (!prevRegion) {
    return true;
  }

  const distanceMoved = getHaversineDistanceMeters(
    prevRegion.latitude,
    prevRegion.longitude,
    nextRegion.latitude,
    nextRegion.longitude
  );

  if (distanceMoved >= distanceThresholdMeters) {
    return true;
  }

  const latDeltaRatio =
    Math.abs(nextRegion.latitudeDelta - prevRegion.latitudeDelta) /
    Math.max(prevRegion.latitudeDelta, 0.0001);
  const lngDeltaRatio =
    Math.abs(nextRegion.longitudeDelta - prevRegion.longitudeDelta) /
    Math.max(prevRegion.longitudeDelta, 0.0001);

  return latDeltaRatio >= deltaRatioThreshold || lngDeltaRatio >= deltaRatioThreshold;
}
