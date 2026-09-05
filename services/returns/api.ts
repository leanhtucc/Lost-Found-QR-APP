/**
 * Returns API Service
 * REST endpoints cho luồng hoàn trả đồ: /v1/returns
 *
 * Đã cấu hình kết nối trực tiếp Backend production, loại bỏ silent fallback mock,
 * áp dụng cơ chế Zero-Trust Identity và If-Match Concurrency Control.
 */

import { authStorage } from '@/storage/auth';
import { authApi } from '@/services/auth';
import { buildV1Url } from '@/services/shared/url';
import {
  ReturnSession,
  ProposeMeetupRequest,
  ConfirmHandoverRequest,
  DisputeHandoverRequest,
  SubmitRatingRequest,
  RewardPayout,
  HandoverDetails,
} from '@/types/return-flow';

// Đặt false để ép buộc gọi API Backend thật trong cả DEV và PROD
const USE_MOCK_FALLBACK = __DEV__ && false;

// ─── Headers & Auth ────────────────────────────────────────────────────────────

const createHeaders = async (extraHeaders?: Record<string, string>): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No access token found. Please login again.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
};

const fetchWithAuth = async (url: string, options: RequestInit): Promise<Response> => {
  const existingHeaders = (options.headers as Record<string, string>) || {};
  let headers = await createHeaders(existingHeaders);
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const refreshResponse = await authApi.refreshToken({ refreshToken });
      if (refreshResponse.success && refreshResponse.data) {
        headers = await createHeaders(existingHeaders);
        response = await fetch(url, { ...options, headers });
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('[ReturnAPI] Token refresh failed:', error);
      throw error;
    }
  }

  return response;
};

/**
 * Xử lý response từ server, parse mã lỗi chuẩn mực
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorCode = json?.error?.code || json?.code || 'UNKNOWN_ERROR';
    const message = json?.message || `Yêu cầu thất bại (${response.status})`;
    const error = new Error(message) as Error & {
      code?: string;
      status?: number;
      detail?: string;
    };
    error.code = errorCode;
    error.status = response.status;
    error.detail = json?.error?.detail;
    throw error;
  }

  return (json.data !== undefined ? json.data : json) as T;
};

// ─── Dev Mock Session (Chỉ dùng khi USE_MOCK_FALLBACK = true) ────────────────

const inMemorySessions: Record<string, ReturnSession> = {};

const createMockSession = (
  channelId: string,
  itemId?: string,
  extra?: Partial<ReturnSession>
): ReturnSession => {
  const now = new Date().toISOString();
  const sessionId = `return_${channelId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (inMemorySessions[sessionId]) {
    return inMemorySessions[sessionId];
  }

  const newSession: ReturnSession = {
    id: sessionId,
    channelId,
    itemId: itemId || 'item_default',
    itemName: extra?.itemName || 'Ví da cầm tay & Giấy tờ',
    itemCategory: extra?.itemCategory || 'Ví / Giấy tờ',
    itemImageUrl: extra?.itemImageUrl || null,
    rewardAmount: extra?.rewardAmount || 200000,
    status: 'CHAT_ACTIVE',
    owner: extra?.owner || {
      id: 'owner_user',
      role: 'OWNER',
      displayName: 'Marcus (Chủ đồ)',
      photoURL: null,
      phoneNumber: '0901234567',
      isVerified: true,
      trustScore: 95,
      isArrived: false,
      sharingLocation: false,
    },
    finder: extra?.finder || {
      id: 'finder_user',
      role: 'FINDER',
      displayName: 'Hoàng Long (Người nhặt)',
      photoURL: null,
      phoneNumber: '0987654321',
      isVerified: true,
      trustScore: 88,
      isArrived: false,
      sharingLocation: false,
    },
    meetup: null,
    handover: null,
    reward: null,
    rating: null,
    createdAt: now,
    updatedAt: now,
    serverRevision: 1,
  };

  inMemorySessions[sessionId] = newSession;
  return newSession;
};

// ─── API Client ──────────────────────────────────────────────────────────────

export const returnApi = {
  /**
   * Tạo hoặc lấy phiên hoàn trả dựa trên channelId
   * POST /v1/returns
   */
  async createOrGetSession(
    channelId: string,
    itemId?: string,
    initialData?: Partial<ReturnSession>
  ): Promise<ReturnSession> {
    try {
      const url = buildV1Url('returns');
      const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({ channelId, itemId }),
      });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback createOrGetSession:', err);
        return createMockSession(channelId, itemId, initialData);
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết phiên theo sessionId
   * GET /v1/returns/:id
   */
  async getSession(sessionId: string): Promise<ReturnSession> {
    try {
      const url = buildV1Url('returns', sessionId);
      const response = await fetchWithAuth(url, { method: 'GET' });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback getSession:', err);
        return inMemorySessions[sessionId] || createMockSession(sessionId);
      }
      throw err;
    }
  },

  /**
   * Đề xuất điểm hẹn
   * POST /v1/returns/:id/meetup/propose
   */
  async proposeMeetup(
    sessionId: string,
    payload: ProposeMeetupRequest,
    revision?: number
  ): Promise<ReturnSession> {
    const headers: Record<string, string> = {};
    if (revision != null) {
      headers['If-Match'] = String(revision);
    }

    try {
      const url = buildV1Url('returns', sessionId, 'meetup', 'propose');
      const response = await fetchWithAuth(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback proposeMeetup:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'MEETUP_PROPOSED';
        session.meetup = {
          proposedBy: 'current_user',
          proposedByName: 'Bạn',
          address: payload.address,
          name: payload.name,
          latitude: payload.latitude,
          longitude: payload.longitude,
          scheduledTime: payload.scheduledTime,
          notes: payload.notes,
          status: 'PENDING',
          proposedAt: new Date().toISOString(),
        };
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Chấp nhận điểm hẹn (Chỉ đối tác được chấp nhận)
   * POST /v1/returns/:id/meetup/accept
   */
  async acceptMeetup(sessionId: string, revision?: number): Promise<ReturnSession> {
    const headers: Record<string, string> = {};
    if (revision != null) {
      headers['If-Match'] = String(revision);
    }

    try {
      const url = buildV1Url('returns', sessionId, 'meetup', 'accept');
      const response = await fetchWithAuth(url, { method: 'POST', headers });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback acceptMeetup:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'MEETUP_ACCEPTED';
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Từ chối / Hủy điểm hẹn
   * POST /v1/returns/:id/meetup/reject
   */
  async rejectMeetup(sessionId: string, revision?: number): Promise<ReturnSession> {
    const headers: Record<string, string> = {};
    if (revision != null) {
      headers['If-Match'] = String(revision);
    }

    try {
      const url = buildV1Url('returns', sessionId, 'meetup', 'reject');
      const response = await fetchWithAuth(url, { method: 'POST', headers });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback rejectMeetup:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'CHAT_ACTIVE';
        session.meetup = null;
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Bắt đầu chia sẻ vị trí (Live Tracking)
   * POST /v1/returns/:id/tracking/start
   */
  async startTracking(sessionId: string): Promise<ReturnSession> {
    try {
      const url = buildV1Url('returns', sessionId, 'tracking', 'start');
      const response = await fetchWithAuth(url, { method: 'POST' });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback startTracking:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'TRACKING_ACTIVE';
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Dừng chia sẻ vị trí (Xóa cache vị trí trên Redis)
   * POST /v1/returns/:id/tracking/stop
   */
  async stopTracking(sessionId: string): Promise<void> {
    try {
      const url = buildV1Url('returns', sessionId, 'tracking', 'stop');
      await fetchWithAuth(url, { method: 'POST' });
    } catch (err) {
      console.warn('[ReturnAPI] stopTracking error:', err);
    }
  },

  /**
   * Báo đã đến điểm hẹn (Tự động chuyển HANDOVER_PENDING khi cả 2 đã đến)
   * POST /v1/returns/:id/arrival
   */
  async notifyArrival(sessionId: string): Promise<ReturnSession> {
    try {
      const url = buildV1Url('returns', sessionId, 'arrival');
      const response = await fetchWithAuth(url, { method: 'POST' });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback notifyArrival:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'HANDOVER_PENDING';
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Khởi tạo bàn giao (Sinh mã ngẫu nhiên 6 số CSPRNG, TTL 5 phút, max 5 lần thử)
   * POST /v1/returns/:id/handover/init
   */
  async initHandover(sessionId: string): Promise<HandoverDetails> {
    try {
      const url = buildV1Url('returns', sessionId, 'handover', 'init');
      const response = await fetchWithAuth(url, { method: 'POST' });
      return await handleResponse<HandoverDetails>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback initHandover:', err);
        return {
          code: '852963',
          qrPayload: `handover://${sessionId}?code=852963`,
          finderConfirmed: false,
          ownerConfirmed: false,
        };
      }
      throw err;
    }
  },

  /**
   * Xác nhận bàn giao từ phía Owner hoặc Finder
   * POST /v1/returns/:id/handover/confirm
   * Zero-Trust: Server tự xác định role từ Bearer token
   */
  async confirmHandover(
    sessionId: string,
    request: ConfirmHandoverRequest,
    revision?: number
  ): Promise<ReturnSession> {
    const headers: Record<string, string> = {};
    if (revision != null) {
      headers['If-Match'] = String(revision);
    }

    try {
      const url = buildV1Url('returns', sessionId, 'handover', 'confirm');
      const response = await fetchWithAuth(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: request.code,
          idempotencyKey: request.idempotencyKey,
        }),
      });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback confirmHandover:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'REWARD_RELEASING';
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Báo cáo sự cố bàn giao (Dispute)
   * POST /v1/returns/:id/handover/dispute
   * Zero-Trust: Server tự xác định disputedBy từ Bearer token
   */
  async disputeHandover(
    sessionId: string,
    request: DisputeHandoverRequest
  ): Promise<ReturnSession> {
    try {
      const url = buildV1Url('returns', sessionId, 'handover', 'dispute');
      const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({
          reason: request.reason,
        }),
      });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback disputeHandover:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'HANDOVER_DISPUTED';
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },

  /**
   * Lấy trạng thái giải ngân phần thưởng
   * GET /v1/returns/:id/reward
   */
  async getRewardStatus(sessionId: string): Promise<RewardPayout> {
    try {
      const url = buildV1Url('returns', sessionId, 'reward');
      const response = await fetchWithAuth(url, { method: 'GET' });
      return await handleResponse<RewardPayout>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback getRewardStatus:', err);
        return {
          baseReward: 200000,
          platformFee: 0,
          netAmount: 200000,
          currency: 'VND',
          payoutMethodMasked: 'Vietcombank •••• 5678',
          status: 'PAID',
          transactionId: `TXN-${Date.now().toString().slice(-8)}`,
          paidAt: new Date().toISOString(),
        };
      }
      throw err;
    }
  },

  /**
   * Gửi đánh giá người nhặt (Chỉ Chủ đồ được đánh giá 1 lần duy nhất)
   * POST /v1/returns/:id/rating
   */
  async submitRating(sessionId: string, request: SubmitRatingRequest): Promise<ReturnSession> {
    try {
      const url = buildV1Url('returns', sessionId, 'rating');
      const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return await handleResponse<ReturnSession>(response);
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[ReturnAPI] Dev fallback submitRating:', err);
        const session = inMemorySessions[sessionId] || createMockSession(sessionId);
        session.status = 'COMPLETED';
        session.serverRevision += 1;
        return session;
      }
      throw err;
    }
  },
};
