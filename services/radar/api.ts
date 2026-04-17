import {
  HomeLostFeedCard,
  HomeLostFeedData,
  HomeLostFeedPin,
  HomeLostFeedQuery,
  RadarApiResponse,
  RadarLostItem,
  RadarNearbyApiItem,
  RadarNearbyQuery,
} from '@/types/radar';
import { buildHomeUrl, buildMapUrl } from '@services/shared/url';
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

const normalizeHomeLostFeedPin = (payload: unknown): HomeLostFeedPin | null => {
  const item = payload as Partial<HomeLostFeedPin> | null;
  if (!item || typeof item.itemId !== 'string') {
    return null;
  }

  const lat = toFiniteNumber(item.lat);
  const lng = toFiniteNumber(item.lng);

  if (lat === null || lng === null) {
    return null;
  }

  return {
    itemId: item.itemId,
    lat,
    lng,
    isOwn: Boolean(item.isOwn),
  };
};

const normalizeHomeLostFeedCard = (payload: unknown): HomeLostFeedCard | null => {
  const item = payload as Partial<HomeLostFeedCard> | null;
  if (!item || typeof item.itemId !== 'string' || typeof item.name !== 'string') {
    return null;
  }

  if (typeof item.reportedAt !== 'string') {
    return null;
  }

  const distanceMeters = item.distanceMeters === null ? null : toFiniteNumber(item.distanceMeters);
  const lostLat = item.lostLat === null ? null : toFiniteNumber(item.lostLat);
  const lostLng = item.lostLng === null ? null : toFiniteNumber(item.lostLng);

  return {
    itemId: item.itemId,
    name: item.name,
    category: typeof item.category === 'string' ? item.category : 'other',
    imagePublicUrl: typeof item.imagePublicUrl === 'string' ? item.imagePublicUrl : null,
    lostMessage: typeof item.lostMessage === 'string' ? item.lostMessage : null,
    address:
      typeof item.address === 'string' && item.address.trim().length > 0
        ? item.address.trim()
        : null,
    distanceMeters,
    distanceLabel: typeof item.distanceLabel === 'string' ? item.distanceLabel : null,
    lostLat,
    lostLng,
    isOwn: Boolean(item.isOwn),
    ownerDisplayName:
      typeof item.ownerDisplayName === 'string' && item.ownerDisplayName.trim().length > 0
        ? item.ownerDisplayName
        : 'Unknown',
    ownerPhotoURL: typeof item.ownerPhotoURL === 'string' ? item.ownerPhotoURL : null,
    reportedAt: item.reportedAt,
  };
};

const normalizeHomeLostFeedData = (payload: unknown): HomeLostFeedData => {
  const item = (payload || {}) as Partial<HomeLostFeedData>;

  const myLostCount = Math.max(0, Math.floor(toFiniteNumber(item.myLostCount) ?? 0));
  const nearbyCount = Math.max(0, Math.floor(toFiniteNumber(item.nearbyCount) ?? 0));

  const pins = Array.isArray(item.pins)
    ? item.pins
        .map(pin => normalizeHomeLostFeedPin(pin))
        .filter((pin): pin is HomeLostFeedPin => Boolean(pin))
    : [];

  const cards = Array.isArray(item.cards)
    ? item.cards
        .map(card => normalizeHomeLostFeedCard(card))
        .filter((card): card is HomeLostFeedCard => Boolean(card))
    : [];

  return {
    myLostCount,
    nearbyCount,
    pins,
    cards,
  };
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
  async getHomeLostFeed(query?: HomeLostFeedQuery): Promise<HomeLostFeedData> {
    const hasLat = typeof query?.lat !== 'undefined';
    const hasLng = typeof query?.lng !== 'undefined';

    if (hasLat !== hasLng) {
      throw new Error('lat and lng must be provided together');
    }

    const params = new URLSearchParams();

    if (hasLat && hasLng) {
      const radius = query?.radius ?? DEFAULT_RADIUS;

      assertRange(query?.lat as number, 'lat', -90, 90);
      assertRange(query?.lng as number, 'lng', -180, 180);
      assertRange(radius, 'radius', MIN_RADIUS, MAX_RADIUS);

      params.append('lat', String(query?.lat));
      params.append('lng', String(query?.lng));
      params.append('radius', String(Math.floor(radius)));
    }

    const baseUrl = buildHomeUrl('lost-feed');
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    const headers = await createAuthHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const payload = await parseJsonSafely<RadarApiResponse<unknown>>(response);

    if (!response.ok || !payload?.success || typeof payload.data === 'undefined') {
      const fallbackMessage = `Failed to load lost feed (HTTP ${response.status})`;
      throw new Error(payload?.message || payload?.error || fallbackMessage);
    }

    return normalizeHomeLostFeedData(payload.data);
  },

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
