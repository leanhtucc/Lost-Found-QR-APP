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
import { buildHomeUrl, buildMapUrl, buildV1Url } from '@services/shared/url';
import { authStorage } from '@storage/auth';
import { authApi } from '@services/auth';
import { sessionEvents } from '@/lib/sessionEvents';

const DEFAULT_RADIUS = 10000;
const MIN_RADIUS = 1;
const MAX_RADIUS = 10000;
const MAX_ITEMS_PER_REQUEST = 100;

const NULL_LIKE_STRING_VALUES = new Set(['', 'null', 'undefined', 'nan']);

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
    sessionEvents.emitSessionExpired();
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let headers: HeadersInit;
  try {
    headers = await createAuthHeaders();
  } catch (err) {
    throw err;
  }

  let response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    console.log('[RadarAPI] 401 Unauthorized encountered, attempting refresh...');
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResult = await authApi.refreshToken({ refreshToken });
      if (refreshResult.success && refreshResult.data) {
        console.log('[RadarAPI] Refresh token successful, retrying request...');
        const newHeaders = await createAuthHeaders();
        response = await fetch(url, {
          ...options,
          headers: {
            ...newHeaders,
            ...options.headers,
          },
        });
      } else {
        throw new Error(refreshResult.message || 'Refresh failed');
      }
    } catch (refreshErr) {
      console.warn('[RadarAPI] Refresh failed, emitting session expired:', refreshErr);
      await authStorage.clearAll();
      sessionEvents.emitSessionExpired();
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }

  return response;
};

const fetchWithOptionalAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await authStorage.getAccessToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401 && token) {
    console.log('[RadarAPI] 401 on optional auth, attempting refresh...');
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResult = await authApi.refreshToken({ refreshToken });
      if (refreshResult.success && refreshResult.data) {
        const newToken = await authStorage.getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
        if (response.status !== 401) {
          return response;
        }
      }
      throw new Error(refreshResult.message || 'Refresh failed');
    } catch (refreshErr) {
      console.warn(
        '[RadarAPI] User token expired and refresh failed on optional auth, emitting session expired:',
        refreshErr
      );
      await authStorage.clearAll();
      sessionEvents.emitSessionExpired();
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }

  return response;
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

const normalizeOptionalNumberInput = (value: unknown): number | undefined => {
  if (value === null || typeof value === 'undefined') {
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (NULL_LIKE_STRING_VALUES.has(normalized)) {
      return undefined;
    }
  }

  const parsed = toFiniteNumber(value);
  return parsed === null ? undefined : parsed;
};

const isWithinRange = (value: number, min: number, max: number): boolean =>
  Number.isFinite(value) && value >= min && value <= max;

const normalizeHomeLostFeedPin = (payload: unknown): HomeLostFeedPin | null => {
  const item = (payload || {}) as Record<string, any>;
  const rawId = item.itemId || item.id || item._id;

  if (!rawId) return null;
  const itemId = String(rawId);

  const lat = toFiniteNumber(item.lat ?? item.lost_lat ?? item.latitude);
  const lng = toFiniteNumber(item.lng ?? item.lost_lng ?? item.longitude);

  if (lat === null || lng === null) {
    return null; // Pins absolutely require coordinates
  }

  return {
    itemId,
    lat,
    lng,
    isOwn: Boolean(item.isOwn ?? item.is_own),
  };
};

const normalizeHomeLostFeedCard = (payload: unknown): HomeLostFeedCard | null => {
  const item = (payload || {}) as Record<string, any>;
  const rawId = item.itemId || item.id || item._id;

  if (!rawId) {
    if (__DEV__) console.log('[RadarAPI] Dropping card due to missing ID:', item);
    return null;
  }

  const itemId = String(rawId);
  const name = typeof item.name === 'string' ? item.name : 'Vật phẩm không tên';

  const reportedAtRaw = item.reportedAt || item.created_at || item.createdAt;
  const reportedAt = typeof reportedAtRaw === 'string' ? reportedAtRaw : new Date().toISOString();

  const distanceMeters = toFiniteNumber(item.distanceMeters ?? item.distance_meters);
  const lostLat = toFiniteNumber(item.lostLat ?? item.lost_lat ?? item.latitude);
  const lostLng = toFiniteNumber(item.lostLng ?? item.lost_lng ?? item.longitude);

  const ownerDisplayName = item.ownerDisplayName || item.owner_display_name;

  return {
    itemId,
    name,
    category: typeof item.category === 'string' ? item.category : 'other',
    imagePublicUrl:
      typeof (item.imagePublicUrl || item.image_url) === 'string'
        ? item.imagePublicUrl || item.image_url
        : null,
    lostMessage:
      typeof (item.lostMessage || item.lost_message) === 'string'
        ? item.lostMessage || item.lost_message
        : null,
    address:
      typeof item.address === 'string' && item.address.trim().length > 0
        ? item.address.trim()
        : null,
    distanceMeters,
    distanceLabel:
      typeof (item.distanceLabel || item.distance_label) === 'string'
        ? item.distanceLabel || item.distance_label
        : null,
    lostLat,
    lostLng,
    isOwn: Boolean(item.isOwn ?? item.is_own),
    ownerDisplayName:
      typeof ownerDisplayName === 'string' && ownerDisplayName.trim().length > 0
        ? ownerDisplayName
        : 'Ẩn danh',
    ownerPhotoURL:
      typeof (item.ownerPhotoURL || item.owner_photo_url) === 'string'
        ? item.ownerPhotoURL || item.owner_photo_url
        : null,
    reportedAt,
    reportType: item.reportType === 'FOUND' ? 'FOUND' : 'LOST',
  };
};

const normalizeHomeLostFeedData = (payload: unknown): HomeLostFeedData => {
  const item = (payload || {}) as Record<string, unknown>;
  const feedPayload =
    item.lostFeed && typeof item.lostFeed === 'object'
      ? (item.lostFeed as Record<string, unknown>)
      : item;

  const myLostCount = Math.max(0, Math.floor(toFiniteNumber(feedPayload.myLostCount) ?? 0));
  const nearbyCount = Math.max(0, Math.floor(toFiniteNumber(feedPayload.nearbyCount) ?? 0));

  const pins = Array.isArray(feedPayload.pins)
    ? feedPayload.pins
        .map(pin => normalizeHomeLostFeedPin(pin))
        .filter((pin): pin is HomeLostFeedPin => Boolean(pin))
    : [];

  const cards = Array.isArray(feedPayload.cards)
    ? feedPayload.cards
        .map(card => normalizeHomeLostFeedCard(card))
        .filter((card): card is HomeLostFeedCard => Boolean(card))
    : [];

  const user =
    item.user && typeof item.user === 'object'
      ? {
          userId: String((item.user as Record<string, unknown>).userId || ''),
          fullName: String((item.user as Record<string, unknown>).fullName || ''),
          avatarUrl:
            typeof (item.user as Record<string, unknown>).avatarUrl === 'string'
              ? String((item.user as Record<string, unknown>).avatarUrl)
              : null,
        }
      : undefined;

  return {
    myLostCount,
    nearbyCount,
    pins,
    cards,
    user,
  };
};

const normalizeNearbyItem = (payloadRaw: unknown): RadarLostItem | null => {
  const payload = (payloadRaw || {}) as Record<string, any>;
  const rawId = payload.itemId || payload.id || payload._id;

  if (!rawId) {
    if (__DEV__) console.log('[RadarAPI] Dropping nearby due to missing ID:', payload);
    return null;
  }
  const itemId = String(rawId);
  const name = typeof payload.name === 'string' ? payload.name : 'Vật phẩm không tên';

  const status = typeof payload.status === 'string' ? payload.status.toUpperCase() : 'LOST';
  if (status !== 'LOST' && status !== 'PENDING_PAYMENT') {
    return null;
  }

  const latitude = toFiniteNumber(
    payload.lostLat ?? payload.lost_lat ?? payload.latitude ?? payload.lat
  );
  const longitude = toFiniteNumber(
    payload.lostLng ?? payload.lost_lng ?? payload.longitude ?? payload.lng
  );

  if (latitude === null || longitude === null) {
    return null;
  }

  const distanceMeters = toFiniteNumber(
    payload.distanceMetres ?? payload.distance_meters ?? payload.distanceMeters
  );

  return {
    itemId,
    name,
    category: typeof payload.category === 'string' ? payload.category : 'other',
    status: 'LOST',
    lostMessage:
      typeof (payload.lostMessage || payload.lost_message) === 'string'
        ? payload.lostMessage || payload.lost_message
        : undefined,
    imagePublicUrl:
      typeof (payload.imagePublicUrl || payload.image_url) === 'string'
        ? payload.imagePublicUrl || payload.image_url
        : undefined,
    latitude,
    longitude,
    distanceMeters: distanceMeters ?? undefined,
    ownerDisplayName: payload.ownerDisplayName ?? payload.owner_display_name,
    ownerPhotoURL: payload.ownerPhotoURL ?? payload.owner_photo_url,
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

interface GuardianRadarPayload {
  lat: number;
  lng: number;
  radius?: number;
}

/** Response từ GET /v1/map/active-users */
interface ActiveUsersResponse {
  active_users_count?: number;
}

export interface GuardianRadarSimulation {
  activeUsersCount: number;
  /** Radius (mét) người dùng đã chọn – echo lại từ request */
  recommendedRadius: number;
  /** Thời lượng giờ mặc định, backend không còn trả về riêng */
  estimatedDurationHours: number;
}

export const radarApi = {
  /**
   * Lấy số người dùng hoạt động gần khu vực (Radar step)
   * GET /v1/map/active-users  ← V2 BREAKING CHANGE (cũ: POST /v1/radar/simulate)
   * Gọi mỗi khi user kéo slider chọn bán kính (500m / 2000m / 5000m)
   */
  async simulateGuardianRadar(payload: GuardianRadarPayload): Promise<GuardianRadarSimulation> {
    assertRange(payload.lat, 'lat', -90, 90);
    assertRange(payload.lng, 'lng', -180, 180);

    const radius = typeof payload.radius === 'number' ? Math.floor(payload.radius) : 500;
    assertRange(radius, 'radius', 100, 5000);

    // V2: GET /v1/map/active-users?lat=...&lng=...&radius=...
    const params = new URLSearchParams({
      lat: String(payload.lat),
      lng: String(payload.lng),
      radius: String(radius),
    });

    const response = await fetchWithAuth(
      `${buildV1Url('map', 'active-users')}?${params.toString()}`,
      {
        method: 'GET',
      }
    );

    const apiPayload = await parseJsonSafely<RadarApiResponse<ActiveUsersResponse>>(response);

    if (!response.ok || !apiPayload?.success || !apiPayload.data) {
      const fallbackMessage = `Failed to fetch active users (HTTP ${response.status})`;
      throw new Error(apiPayload?.message || apiPayload?.error || fallbackMessage);
    }

    // V2: backend chỉ trả active_users_count;
    // recommendedRadius & estimatedDurationHours echo lại từ request
    return {
      activeUsersCount: Math.max(0, Math.floor(apiPayload.data.active_users_count || 0)),
      recommendedRadius: radius,
      estimatedDurationHours: 24, // mặc định; user có thể chỉnh ở Reward step
    };
  },

  async getHomeLostFeed(query: HomeLostFeedQuery): Promise<HomeLostFeedData> {
    const lat = normalizeOptionalNumberInput(query?.lat);
    const lng = normalizeOptionalNumberInput(query?.lng);
    const radius = normalizeOptionalNumberInput(query?.radius);

    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      !isWithinRange(lat, -90, 90) ||
      !isWithinRange(lng, -180, 180)
    ) {
      throw new Error('Tọa độ GPS (lat, lng) là bắt buộc để tải dữ liệu Radar.');
    }

    const safeRadius =
      typeof radius === 'number' && isWithinRange(radius, MIN_RADIUS, MAX_RADIUS)
        ? Math.floor(radius)
        : DEFAULT_RADIUS;

    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(safeRadius),
    });

    if (query.category && query.category.toLowerCase() !== 'all') {
      params.set('category', query.category);
    }

    // Ưu tiên GET /v1/home/lost-feed, fallback GET /api/home/lost-feed
    const v1Url = `${buildV1Url('home', 'lost-feed')}?${params.toString()}`;
    const apiUrl = `${buildHomeUrl('lost-feed')}?${params.toString()}`;

    if (__DEV__) {
      console.log('[RadarAPI][getHomeLostFeed] Request', {
        v1Url,
        sentQuery: {
          lat,
          lng,
          radius: safeRadius,
        },
      });
    }

    let response = await fetchWithOptionalAuth(v1Url, {
      method: 'GET',
    });

    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await fetchWithOptionalAuth(apiUrl, {
        method: 'GET',
      });
    }

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

    const response = await fetchWithAuth(url, {
      method: 'GET',
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
