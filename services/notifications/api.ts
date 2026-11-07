/**
 * Notifications API Service
 * Lost and Found QR Alerts — /v1/notifications
 *
 * Endpoints:
 *   GET    /v1/notifications?category=...&page=...&limit=...
 *   GET    /v1/notifications/unread-count
 *   PATCH  /v1/notifications/:id/read
 *   POST   /v1/notifications/read-all
 */

import {
  GetNotificationsResponse,
  MarkAllReadResponse,
  MarkReadResponse,
  Notification,
  NotificationCategory,
  NotificationPreferences,
  NotificationPreferencesResponse,
  RegisterPushDeviceRequest,
  RegisterPushDeviceResponse,
  UnreadCountResponse,
} from '@/types/notification';
import { apiClient } from '@/services/http';
import { buildNotificationsUrl, buildAuthUrl } from '@services/shared/url';

// ─── Auth helpers ────────────────────────────────────────────────────────────

const createHeaders = async (): Promise<HeadersInit> => {
  return {
    'Content-Type': 'application/json',
  };
};

/** Auto-refresh on 401 */
const fetchWithAuth = async (url: string, options: RequestInit): Promise<Response> => {
  return apiClient.fetch(url, options);
};

// ─── Public API ──────────────────────────────────────────────────────────────

export interface GetNotificationsParams {
  category?: NotificationCategory;
  page?: number;
  limit?: number;
}

/**
 * GET /v1/notifications
 * Lấy danh sách thông báo (có filter theo category, phân trang).
 */
export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse['data']> => {
  const { category, page = 1, limit = 20 } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category) query.append('category', category);

  const url = `${buildNotificationsUrl()}?${query}`;
  const headers = await createHeaders();

  console.log('[NotifAPI] Notifications requested');
  const response = await fetchWithAuth(url, { method: 'GET', headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  const result: GetNotificationsResponse = await response.json();
  return result.data;
};

/**
 * GET /v1/notifications/unread-count
 * Lấy nhanh số thông báo chưa đọc (dùng cho badge 🔔).
 */
export const getUnreadCount = async (): Promise<number> => {
  const url = buildNotificationsUrl('unread-count');
  try {
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, { method: 'GET', headers });
    if (response.ok) {
      const result: UnreadCountResponse = await response.json();
      return result.data?.unread_count ?? 0;
    }
  } catch {
    // unread-count endpoint may not be implemented on server
  }

  // Graceful fallback: GET /v1/notifications returns total_unread
  try {
    const notifData = await getNotifications({ limit: 1 });
    return notifData?.total_unread ?? 0;
  } catch {
    return 0;
  }
};

/**
 * PATCH /v1/notifications/:id/read
 * Đánh dấu 1 thông báo đã đọc.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const url = buildNotificationsUrl(notificationId, 'read');
  const headers = await createHeaders();

  console.log('[NotifAPI] Notification update requested');
  const response = await fetchWithAuth(url, { method: 'PATCH', headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  const result: MarkReadResponse = await response.json();
  return result.data;
};

/**
 * POST /v1/notifications/read-all
 * Đánh dấu tất cả thông báo đã đọc.
 */
export const markAllNotificationsAsRead = async (): Promise<number> => {
  const url = buildNotificationsUrl('read-all');
  const headers = await createHeaders();

  console.log('[NotifAPI] Mark-all-read requested');
  const response = await fetchWithAuth(url, { method: 'POST', headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  const result: MarkAllReadResponse = await response.json();
  console.log(`[NotifAPI] Marked ${result.data.updated_count} as read`);
  return result.data.updated_count;
};

/**
 * POST /v1/notifications/devices
 * Đăng ký Push Token thiết bị (FCM / APNs) với backend.
 */
export const registerPushDevice = async (
  data: RegisterPushDeviceRequest
): Promise<RegisterPushDeviceResponse> => {
  const url = buildNotificationsUrl('devices');
  const headers = await createHeaders();

  console.log('[NotifAPI] Push device registration requested');
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  const result: RegisterPushDeviceResponse = await response.json();
  return result;
};

/**
 * DELETE /v1/notifications/devices/:deviceId
 * Hủy đăng ký push token của thiết bị khi logout.
 */
export const unregisterPushDevice = async (
  deviceId: string
): Promise<{ success: boolean; message?: string }> => {
  const url = buildNotificationsUrl('devices', encodeURIComponent(deviceId));
  const headers = await createHeaders();

  console.log('[NotifAPI] Push device removal requested');
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * POST /v1/notifications/:id/opened
 * Ghi nhận user đã click mở notification.
 */
export const markNotificationAsOpened = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  const url = buildNotificationsUrl(notificationId, 'opened');
  const headers = await createHeaders();

  console.log('[NotifAPI] Notification-open event requested');
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * GET /v1/notifications/preferences
 * Lấy cấu hình thông báo hiện tại của user.
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const url = buildNotificationsUrl('preferences');
  const headers = await createHeaders();

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  const result: NotificationPreferencesResponse = await response.json();
  return result.data;
};

/**
 * PATCH /v1/notifications/preferences
 * Cập nhật cấu hình thông báo (push, email, proximity, quiet hours, ...).
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const url = buildNotificationsUrl('preferences');
  const headers = await createHeaders();

  console.log('[NotifAPI] Notification preferences update requested');
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${response.status}`);
  }

  const result: NotificationPreferencesResponse = await response.json();
  return result.data;
};

/**
 * Cập nhật Push Token lên server (giữ lại cho tương thích).
 */
export const updatePushToken = async (pushToken: string): Promise<void> => {
  try {
    const url = buildAuthUrl('profile');
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ pushToken }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.json();
    console.log('[NotifAPI] Push token registration updated');
  } catch (error) {
    console.error('[NotifAPI] Error updating push token:', error);
    throw error;
  }
};
