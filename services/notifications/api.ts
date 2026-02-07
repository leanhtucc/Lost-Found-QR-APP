/**
 * Notifications API Service
 * Service xử lý các API liên quan đến thông báo với Stream Chat
 */

import {
  NotificationsResponse,
  StreamTokenResponse,
  ActivityType,
  ActivityMetadata,
} from '@/types/notification';
import { authStorage } from '@/storage/auth';
import { authApi } from '@/services/auth';

const API_BASE = 'http://192.168.10.102:3000';

const createHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();

  if (!token) {
    throw new Error('No access token found. Please login again.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Helper để tự động refresh token khi gặp 401
 */
const fetchWithAuth = async (url: string, options: RequestInit): Promise<Response> => {
  let response = await fetch(url, options);

  // Nếu gặp 401, thử refresh token và gọi lại
  if (response.status === 401) {
    console.log('Token expired, attempting to refresh...');

    try {
      const refreshToken = await authStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Refresh token
      const refreshResponse = await authApi.refreshToken({ refreshToken });

      if (refreshResponse.success && refreshResponse.data) {
        // Token đã được lưu trong authApi.refreshToken
        // Tạo headers mới và gọi lại request
        const newHeaders = await createHeaders();
        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens và yêu cầu đăng nhập lại
      await authStorage.clearTokens();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

/**
 * Cập nhật Push Token lên server
 * @param pushToken - Expo Push Token từ thiết bị
 */
export const updatePushToken = async (pushToken: string): Promise<void> => {
  try {
    const url = `${API_BASE}/api/auth/profile`;
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ pushToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Push token updated:', result.message);
  } catch (error) {
    console.error('Error updating push token:', error);
    throw error;
  }
};

/**
 * Lấy Stream Chat Token để kết nối real-time
 */
export const getStreamToken = async (): Promise<StreamTokenResponse['data']> => {
  try {
    const url = `${API_BASE}/api/stream/token`;
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: StreamTokenResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching stream token:', error);
    throw error;
  }
};

/**
 * Lấy danh sách thông báo (Activity Feed)
 */
export const getNotifications = async (): Promise<NotificationsResponse['data']> => {
  try {
    const url = `${API_BASE}/api/stream/notifications`;
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: NotificationsResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const url = `${API_BASE}/api/stream/notifications/mark-read`;
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Marked all as read:', result.message);
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Ghi nhận hoạt động (tạo thông báo tự động)
 * @param activityType - Loại hoạt động: item_found, new_message, item_returned
 * @param metadata - Dữ liệu bổ sung (itemId, finderName, v.v.)
 */
export const logActivity = async (
  activityType: ActivityType,
  metadata?: ActivityMetadata
): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (metadata?.itemId) params.append('itemId', metadata.itemId);
    if (metadata?.finderName) params.append('finderName', metadata.finderName);
    if (metadata?.message) params.append('message', metadata.message);
    if (metadata?.location) params.append('location', metadata.location);

    const url = `${API_BASE}/api/stream/activity/${activityType}${
      params.toString() ? `?${params}` : ''
    }`;
    const headers = await createHeaders();
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Activity logged:', result.message);
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};
