import {
  RadarApiResponse,
  RadarLostItem,
  RadarNearbyApiItem,
  RadarNearbyQuery,
} from '@/types/radar';
import { buildMapUrl } from '@services/shared/url';
import { authStorage } from '@storage/auth';

const DEFAULT_RADIUS = 5000;
const MIN_RADIUS = 1;
const MAX_RADIUS = 50000;
const MAX_ITEMS_PER_REQUEST = 100;

const assertRange = (value: number, field: string, min: number, max: number): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a valid number`);
  }

  if (value < min || value > max) {
    throw new Error(`${field} must be between ${min} and ${max}`);
  }
};

const createAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const toFiniteNumber = (value: unknown): number | null => {
  const normalized = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
};

const normalizeNearbyItem = (payload: RadarNearbyApiItem): RadarLostItem | null => {
  if (!payload || typeof payload.itemId !== 'string' || typeof payload.name !== 'string') {
    return null;
  }

  const status = typeof payload.status === 'string' ? payload.status.toLowerCase() : '';
  if (status !== 'lost') {
    return null;
  }

  const latitude = toFiniteNumber(payload.lostLat);
  const longitude = toFiniteNumber(payload.lostLng);

  if (latitude === null || longitude === null) {
    return null;
  }

  const distanceMeters = toFiniteNumber(payload.distanceMetres);

  return {
    itemId: payload.itemId,
    name: payload.name,
    category: typeof payload.category === 'string' ? payload.category : 'other',
    status: 'lost',
    lostMessage: payload.lostMessage,
    imagePublicUrl: payload.imagePublicUrl,
    latitude,
    longitude,
    distanceMeters: distanceMeters ?? undefined,
    ownerDisplayName: payload.ownerDisplayName,
    ownerPhotoURL: payload.ownerPhotoURL,
  };
};

const normalizeNearbyData = (payload: unknown): RadarLostItem[] => {
  const payloadAsObject = payload as { items?: unknown } | null;
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(payloadAsObject?.items)
      ? payloadAsObject.items
      : [];

  const items = rawItems
    .map(item => normalizeNearbyItem(item as RadarNearbyApiItem))
    .filter((item): item is RadarLostItem => Boolean(item))
    .sort((left, right) => {
      const leftDistance =
        typeof left.distanceMeters === 'number' ? left.distanceMeters : Number.POSITIVE_INFINITY;
      const rightDistance =
        typeof right.distanceMeters === 'number' ? right.distanceMeters : Number.POSITIVE_INFINITY;

      return leftDistance - rightDistance;
    });

  return items.slice(0, MAX_ITEMS_PER_REQUEST);
};

export const radarApi = {
  async getNearbyLostItems(query: RadarNearbyQuery): Promise<RadarLostItem[]> {
    const radius = query.radius ?? DEFAULT_RADIUS;

    assertRange(query.lat, 'lat', -90, 90);
    assertRange(query.lng, 'lng', -180, 180);
    assertRange(radius, 'radius', MIN_RADIUS, MAX_RADIUS);

    const params = new URLSearchParams({
      lat: String(query.lat),
      lng: String(query.lng),
      radius: String(Math.floor(radius)),
    });

    const url = `${buildMapUrl('nearby')}?${params.toString()}`;
    const headers = await createAuthHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const payload = await parseJsonSafely<RadarApiResponse<unknown>>(response);

    if (!response.ok || !payload?.success || typeof payload.data === 'undefined') {
      const fallbackMessage = `Failed to load nearby lost items (HTTP ${response.status})`;
      throw new Error(payload?.message || payload?.error || fallbackMessage);
    }

    return normalizeNearbyData(payload.data);
  },
};

export default radarApi;
