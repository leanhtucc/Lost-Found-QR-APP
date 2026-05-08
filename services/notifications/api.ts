/**
 * Notifications API Service
 * FindBack Alerts — /v1/notifications
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
  UnreadCountResponse,
} from '@/types/notification';
import { authStorage } from '@/storage/auth';
import { authApi } from '@/services/auth';
import { buildNotificationsUrl, buildAuthUrl } from '@services/shared/url';

// ─── Auth helpers ────────────────────────────────────────────────────────────

const createHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  if (!token) throw new Error('No access token found. Please login again.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/** Auto-refresh on 401 */
const fetchWithAuth = async (url: string, options: RequestInit): Promise<Response> => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log('[NotifAPI] Token expired, attempting refresh…');
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const refreshResponse = await authApi.refreshToken({ refreshToken });
      if (refreshResponse.success && refreshResponse.data) {
        const newHeaders = await createHeaders();
        response = await fetch(url, { ...options, headers: newHeaders });
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('[NotifAPI] Token refresh failed:', error);
      await authStorage.clearTokens();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
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

  console.log('[NotifAPI] GET', url);
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
  const headers = await createHeaders();

  const response = await fetchWithAuth(url, { method: 'GET', headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result: UnreadCountResponse = await response.json();
  return result.data.unread_count;
};

/**
 * PATCH /v1/notifications/:id/read
 * Đánh dấu 1 thông báo đã đọc.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const url = buildNotificationsUrl(notificationId, 'read');
  const headers = await createHeaders();

  console.log('[NotifAPI] PATCH', url);
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

  console.log('[NotifAPI] POST', url);
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
 * Cập nhật Push Token lên server (giữ lại cho FCM integration).
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
    const result = await response.json();
    console.log('[NotifAPI] Push token updated:', result.message);
  } catch (error) {
    console.error('[NotifAPI] Error updating push token:', error);
    throw error;
  }
};
