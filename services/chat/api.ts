/**
 * Chat API Service
 * Service xử lý các API liên quan đến chat
 */

import { CreateChannelResponse, GetInboxResponse, CloseChannelResponse } from '@/types/chat';
import { authStorage } from '@/storage/auth';

const API_BASE = 'http://192.168.10.102:3000';

const createHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Tạo cuộc hội thoại mới khi quét QR
 * @param itemId - ID của món đồ từ QR code
 * @param finderId - ID của người tìm thấy (current user)
 */
export const createChannel = async (
  itemId: string,
  finderId: string
): Promise<CreateChannelResponse['data']> => {
  try {
    const url = `${API_BASE}/api/stream/channels/${itemId}/${finderId}`;
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: CreateChannelResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hộp thư (inbox) của user
 */
export const getInbox = async (): Promise<GetInboxResponse['data']> => {
  try {
    const url = `${API_BASE}/api/stream/channels`;
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: GetInboxResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching inbox:', error);
    throw error;
  }
};

/**
 * Đóng cuộc hội thoại (read-only mode)
 * @param channelId - ID của channel cần đóng
 */
export const closeChannel = async (channelId: string): Promise<void> => {
  try {
    const url = `${API_BASE}/api/stream/channels/${channelId}/close`;
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: CloseChannelResponse = await response.json();
    console.log('Channel closed:', result.message);
  } catch (error) {
    console.error('Error closing channel:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một channel
 * @param channelId - ID của channel
 */
export const getChannelById = async (channelId: string): Promise<any> => {
  try {
    const url = `${API_BASE}/api/stream/channels/${channelId}`;
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching channel:', error);
    throw error;
  }
};
