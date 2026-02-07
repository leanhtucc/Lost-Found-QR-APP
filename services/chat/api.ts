/**
 * Chat API Service
 * Service xử lý các API liên quan đến chat
 */

import {
  CreateChannelResponse,
  GetInboxResponse,
  CloseChannelResponse,
  Conversation,
} from '@/types/chat';
import { authStorage } from '@/storage/auth';

const API_BASE = 'http://192.168.10.102:3000';

const createHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();

  if (!token) {
    throw new Error('No access token found');
  }

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
 * Map sang Conversation format cho UI
 */
export const getInbox = async (): Promise<{ total: number; channels: Conversation[] }> => {
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

    // Map InboxChannel to Conversation
    const conversations: Conversation[] = result.data.channels.map(channel => ({
      id: channel.id,
      itemName: extractItemName(channel.id), // Extract from channel ID or metadata
      userName: channel.receiver.name,
      userAvatar: channel.receiver.image || channel.receiver.avatar,
      lastMessage: channel.last_message || 'Chưa có tin nhắn',
      lastMessageAt: channel.created_at || new Date().toISOString(),
      unreadCount: channel.unread_count || 0,
      isOnline: false, // TODO: Get from real-time presence
    }));

    return {
      total: result.data.total,
      channels: conversations,
    };
  } catch (error) {
    console.error('Error fetching inbox:', error);
    throw error;
  }
};

/**
 * Helper: Extract item name from channel ID
 * Format: item-{itemId} or similar
 */
const extractItemName = (channelId: string): string => {
  // TODO: Fetch item name from metadata or separate API call
  // For now, return a placeholder
  return 'Món đồ';
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
