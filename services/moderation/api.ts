/**
 * Moderation API Service
 * Service xử lý các API liên quan đến kiểm duyệt nội dung
 */

import {
  FlagResponse,
  UnflagResponse,
  MuteUserParams,
  MuteResponse,
  UnmuteResponse,
  BanUserParams,
  BanResponse,
  FlaggedMessagesResponse,
} from '@/types/moderation';
import { authStorage } from '@/storage/auth';
import { buildStreamUrl } from '@services/shared/url';

const createHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Báo cáo tin nhắn vi phạm
 * @param messageId - ID của tin nhắn cần báo cáo
 */
export const flagMessage = async (messageId: string): Promise<FlagResponse> => {
  try {
    const url = buildStreamUrl('messages', messageId, 'flag');
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: FlagResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error flagging message:', error);
    throw error;
  }
};

/**
 * Gỡ bỏ báo cáo tin nhắn
 * @param messageId - ID của tin nhắn cần gỡ báo cáo
 */
export const unflagMessage = async (messageId: string): Promise<UnflagResponse> => {
  try {
    const url = buildStreamUrl('messages', messageId, 'flag');
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: UnflagResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error unflagging message:', error);
    throw error;
  }
};

/**
 * Tắt tiếng người dùng trong channel
 * @param channelId - ID của channel
 * @param targetUserId - ID của người dùng cần tắt tiếng
 * @param params - Tham số tắt tiếng (timeout)
 */
export const muteUser = async (
  channelId: string,
  targetUserId: string,
  params?: MuteUserParams
): Promise<MuteResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.timeout !== undefined) {
      queryParams.append('timeout', String(params.timeout));
    }

    const url = `${buildStreamUrl('channels', channelId, 'mute', targetUserId)}${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: MuteResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error muting user:', error);
    throw error;
  }
};

/**
 * Bỏ tắt tiếng người dùng trong channel
 * @param channelId - ID của channel
 * @param targetUserId - ID của người dùng cần bỏ tắt tiếng
 */
export const unmuteUser = async (
  channelId: string,
  targetUserId: string
): Promise<UnmuteResponse> => {
  try {
    const url = buildStreamUrl('channels', channelId, 'mute', targetUserId);
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: UnmuteResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error unmuting user:', error);
    throw error;
  }
};

/**
 * Chặn người dùng khỏi channel
 * @param channelId - ID của channel
 * @param targetUserId - ID của người dùng cần chặn
 * @param params - Lý do và thời gian chặn
 */
export const banUser = async (
  channelId: string,
  targetUserId: string,
  params?: BanUserParams
): Promise<BanResponse> => {
  try {
    const url = buildStreamUrl('channels', channelId, 'ban', targetUserId);
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: BanResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tin nhắn bị flag trong channel (cho admin/owner)
 * @param channelId - ID của channel
 */
export const getFlaggedMessages = async (
  channelId: string
): Promise<FlaggedMessagesResponse['data']> => {
  try {
    const url = buildStreamUrl('channels', channelId, 'flagged-messages');
    const headers = await createHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: FlaggedMessagesResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    throw error;
  }
};
