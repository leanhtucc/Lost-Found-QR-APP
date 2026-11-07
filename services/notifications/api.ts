/**
 * Notifications API Service
 * Lost and Found QR Alerts.
 *
 * Backend contract (adapted here so screens keep their own types):
 *   GET    /v1/notifications?page&per_page&status      -> { items, total, total_unread, page, per_page }
 *   POST   /v1/notifications/:id/view                  -> mark one as read
 *   POST   /v1/user-devices                            -> register FCM token
 *   GET    /v1/user-devices                            -> list devices
 *   DELETE /v1/user-devices/:id                        -> deactivate device (DB id)
 *   GET    /api/auth/profile/preferences               -> preferences
 *   PATCH  /api/auth/profile/preferences               -> update preferences
 */

import {
  GetNotificationsResponse,
  Notification,
  NotificationCategory,
  NotificationPreferences,
  NotificationType,
  RegisterPushDeviceRequest,
  RegisterPushDeviceResponse,
} from '@/types/notification';
import { apiClient } from '@/services/http';
import { buildNotificationsUrl, buildAuthUrl, buildV1Url } from '@services/shared/url';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return apiClient.fetch(url, { ...options, headers: { ...JSON_HEADERS, ...options.headers } });
};

const throwIfNotOk = async (response: Response): Promise<void> => {
  if (response.ok) return;
  const body = await response.json().catch(() => ({}));
  throw new Error(body?.message || `HTTP ${response.status}`);
};

/** Backend notifications carry no category; derive it from the type. */
const CATEGORY_BY_TYPE: Record<string, NotificationCategory> = {
  MATCH_FOUND: 'ITEM',
  PROXIMITY: 'ITEM',
  ITEM_MARKED_LOST: 'ITEM',
  QR_SCANNED: 'ITEM',
  NEW_CHAT: 'SOCIAL',
  ESCROW_LOCKED: 'TRANSACTION',
  REFUNDED: 'TRANSACTION',
  RELEASED: 'TRANSACTION',
  REWARD_PAID: 'TRANSACTION',
  RATING_RECEIVED: 'SOCIAL',
};

const categoryForType = (type: string): NotificationCategory => {
  if (CATEGORY_BY_TYPE[type]) return CATEGORY_BY_TYPE[type];
  if (type.startsWith('FOUND_REPORT_')) return 'ITEM';
  return 'IMPORTANT';
};

interface BackendNotification {
  _id: string;
  type: string;
  title?: { vi?: string; en?: string } | string;
  content?: { vi?: string; en?: string } | string;
  status?: 'VIEW' | 'UN_VIEW';
  user_id?: string;
  entity_type?: 'ITEM' | 'FOUND_REPORT' | 'RETURN_SESSION' | 'CHAT' | null;
  entity_id?: string | null;
  created_at?: string;
}

const localized = (value: BackendNotification['title']): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.vi || value.en || '';
};

/** Build the metadata keys the navigation resolver understands from entity_type/entity_id. */
const metadataFromEntity = (item: BackendNotification): Record<string, unknown> => {
  if (!item.entity_id) return {};
  switch (item.entity_type) {
    case 'ITEM':
      return { item_id: item.entity_id };
    case 'FOUND_REPORT':
      return { found_report_id: item.entity_id };
    case 'RETURN_SESSION':
      return { return_session_id: item.entity_id };
    case 'CHAT':
      return { room_id: item.entity_id };
    default:
      return {};
  }
};

const toNotification = (item: BackendNotification): Notification => ({
  id: String(item._id),
  receiver_id: item.user_id ?? '',
  category: categoryForType(item.type),
  type: item.type as NotificationType,
  title: localized(item.title),
  content: localized(item.content),
  metadata: metadataFromEntity(item),
  is_read: item.status === 'VIEW',
  created_at: item.created_at ?? new Date().toISOString(),
});

// ─── Notifications ───────────────────────────────────────────────────────────

export interface GetNotificationsParams {
  category?: NotificationCategory;
  page?: number;
  limit?: number;
}

/**
 * GET /v1/notifications
 * The backend has no category filter, so category is applied to the fetched page.
 */
export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse['data']> => {
  const { category, page = 1, limit = 20 } = params;
  const query = new URLSearchParams({ page: String(page), per_page: String(limit) });

  const response = await fetchWithAuth(`${buildNotificationsUrl()}?${query}`, { method: 'GET' });
  await throwIfNotOk(response);

  const result = await response.json();
  const payload = result?.data ?? {};
  const rawItems: BackendNotification[] = Array.isArray(payload.items) ? payload.items : [];
  const all = rawItems.map(toNotification);
  const data = category ? all.filter(item => item.category === category) : all;

  const total = Number(payload.total) || 0;
  const perPage = Number(payload.per_page) || limit;
  const currentPage = Number(payload.page) || page;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    data,
    total_unread: Number(payload.total_unread) || 0,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
    },
  };
};

/** Unread count for the bell badge, taken from the list response. */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const data = await getNotifications({ limit: 1 });
    return data.total_unread;
  } catch {
    return 0;
  }
};

/** POST /v1/notifications/:id/view — mark one notification as read. */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await fetchWithAuth(
    buildNotificationsUrl(encodeURIComponent(notificationId), 'view'),
    { method: 'POST' }
  );
  await throwIfNotOk(response);
  const result = await response.json();
  return toNotification(result.data);
};

/**
 * No bulk endpoint exists: mark each unread notification (up to 50) as read.
 * Returns how many were updated.
 */
export const markAllNotificationsAsRead = async (): Promise<number> => {
  const query = new URLSearchParams({ page: '1', per_page: '50', status: 'UN_VIEW' });
  const listResponse = await fetchWithAuth(`${buildNotificationsUrl()}?${query}`, {
    method: 'GET',
  });
  await throwIfNotOk(listResponse);
  const list = await listResponse.json();
  const unread: BackendNotification[] = Array.isArray(list?.data?.items) ? list.data.items : [];

  const results = await Promise.allSettled(unread.map(item => markNotificationAsRead(item._id)));
  return results.filter(r => r.status === 'fulfilled').length;
};

/** Opening a notification marks it as viewed (idempotent on the backend). */
export const markNotificationAsOpened = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  await markNotificationAsRead(notificationId);
  return { success: true };
};

// ─── Push devices ────────────────────────────────────────────────────────────

/** POST /v1/user-devices — register the FCM token. */
export const registerPushDevice = async (
  data: RegisterPushDeviceRequest
): Promise<RegisterPushDeviceResponse> => {
  if (data.platform !== 'android' && data.platform !== 'ios') {
    return { success: false, message: 'Push is only supported on android and ios' };
  }

  const response = await fetchWithAuth(buildV1Url('user-devices'), {
    method: 'POST',
    body: JSON.stringify({
      fcm_token: data.pushToken,
      platform: data.platform,
      device_id: data.deviceId,
      ...(data.appVersion ? { app_version: data.appVersion } : {}),
    }),
  });
  await throwIfNotOk(response);
  return response.json();
};

/**
 * DELETE /v1/user-devices/:id — the backend deletes by its own id, so look the
 * device up by our deviceId first.
 */
export const unregisterPushDevice = async (
  deviceId: string
): Promise<{ success: boolean; message?: string }> => {
  const listResponse = await fetchWithAuth(buildV1Url('user-devices'), { method: 'GET' });
  await throwIfNotOk(listResponse);
  const list = await listResponse.json();
  const devices: { _id: string; device_id: string }[] = Array.isArray(list?.data) ? list.data : [];
  const match = devices.find(device => device.device_id === deviceId);

  if (!match) return { success: true, message: 'Device already removed' };

  const response = await fetchWithAuth(buildV1Url('user-devices', encodeURIComponent(match._id)), {
    method: 'DELETE',
  });
  await throwIfNotOk(response);
  return response.json();
};

// ─── Preferences ─────────────────────────────────────────────────────────────

/** GET /api/auth/profile/preferences */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await fetchWithAuth(buildAuthUrl('profile', 'preferences'), { method: 'GET' });
  await throwIfNotOk(response);
  const result = await response.json();
  return result.data;
};

/** PATCH /api/auth/profile/preferences (backend rejects unknown fields). */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await fetchWithAuth(buildAuthUrl('profile', 'preferences'), {
    method: 'PATCH',
    body: JSON.stringify(preferences),
  });
  await throwIfNotOk(response);
  const result = await response.json();
  return result.data;
};

/**
 * Cập nhật Push Token lên server (giữ lại cho tương thích).
 */
export const updatePushToken = async (pushToken: string): Promise<void> => {
  const response = await fetchWithAuth(buildAuthUrl('profile'), {
    method: 'PATCH',
    body: JSON.stringify({ pushToken }),
  });
  await throwIfNotOk(response);
};
