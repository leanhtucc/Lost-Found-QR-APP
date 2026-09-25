/**
 * Location Types & Validators
 * Phase 1 — Location Selection and Persistence
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface SelectedLocation extends Coordinate {
  address?: string;
  accuracyMeters?: number;
  capturedAt?: string;
}

/**
 * Validates whether a coordinate object has finite, valid geographic values.
 * Accepts latitude in [-90, 90] and longitude in [-180, 180].
 * Specifically ensures that 0 is treated as valid coordinate (Equator / Prime Meridian).
 */
export const isValidCoordinate = (coord: unknown): coord is Coordinate => {
  if (!coord || typeof coord !== 'object') {
    return false;
  }

  const { latitude, longitude } = coord as Record<string, unknown>;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
};
