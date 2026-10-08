import * as Crypto from 'expo-crypto';
import { apiClient } from '@services/http';
import { buildApiUrl, buildV1Url } from '@services/shared/url';
import type { ItemCategory } from '@/types/item';
import type { HomeLostFeedCard, HomeLostFeedPin } from '@/types/radar';
import type { ChannelId, FoundReportId, ReturnSessionId } from '@/types/identifiers';

export interface FoundReport {
  id: FoundReportId;
  name: string;
  category: ItemCategory;
  description?: string | null;
  imagePublicUrl: string;
  lat: number;
  lng: number;
  address: string;
  createdAt: string;
  resolvedAt?: string | null;
  isOwn?: boolean;
}

export interface FoundReportClaim {
  id: string;
  foundReportId: FoundReportId;
  claimantId: string;
  ownershipProof: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  returnSessionId?: ReturnSessionId | null;
  claimant?: { displayName: string; photoURL?: string | null };
  createdAt: string;
}

export interface CreateFoundReport {
  idempotencyKey: string;
  name: string;
  category: ItemCategory;
  description?: string;
  imagePublicUrl: string;
  location: { lat: number; lng: number; address: string };
}

export interface FoundFeedResponse {
  cards: HomeLostFeedCard[];
  pins: HomeLostFeedPin[];
  totalCount: number;
}

let feedRevision = 0;
export const foundReportsApi = {
  getFeedRevision: () => feedRevision,
  createKey: () => Crypto.randomUUID(),
  async create(payload: CreateFoundReport): Promise<FoundReport> {
    if (
      !payload.location.address.trim() ||
      !Number.isFinite(payload.location.lat) ||
      Math.abs(payload.location.lat) > 90 ||
      !Number.isFinite(payload.location.lng) ||
      Math.abs(payload.location.lng) > 180
    ) {
      throw new Error('Vui lòng xác nhận vị trí nhặt được.');
    }
    const response = await apiClient.fetch(buildApiUrl('found-reports'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok || !json?.success || !json.data?.id) {
      throw new Error(json?.message || 'Không thể đăng đồ nhặt được. Vui lòng thử lại.');
    }
    feedRevision += 1;
    return json.data;
  },
  async get(id: string): Promise<FoundReport> {
    const response = await apiClient.fetch(buildApiUrl('found-reports', encodeURIComponent(id)), {
      auth: 'optional',
    });
    const json = await response.json();
    if (!response.ok || !json?.success || !json.data?.id) {
      throw new Error(json?.message || 'Không thể tải bài đăng.');
    }
    return json.data;
  },
  async createClaim(id: string, ownershipProof: string): Promise<FoundReportClaim> {
    const response = await apiClient.fetch(buildApiUrl('found-reports', id, 'claims'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownershipProof }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể gửi bằng chứng sở hữu.');
    return json.data;
  },
  async getMyClaim(id: string): Promise<FoundReportClaim | null> {
    const response = await apiClient.fetch(buildApiUrl('found-reports', id, 'claims', 'mine'), {
      auth: 'optional',
    });
    if (response.status === 401) return null;
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể tải yêu cầu nhận đồ.');
    return json.data;
  },
  async getClaims(id: string): Promise<FoundReportClaim[]> {
    const response = await apiClient.fetch(buildApiUrl('found-reports', id, 'claims'), {
      auth: 'optional',
    });
    if (response.status === 401) return [];
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể tải danh sách yêu cầu.');
    return json.data;
  },
  async reviewClaim(id: string, claimId: string, decision: 'accept' | 'reject') {
    const response = await apiClient.fetch(
      buildApiUrl('found-reports', id, 'claims', claimId, decision),
      {
        method: 'POST',
      }
    );
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể xử lý yêu cầu.');
    return json.data as {
      returnSessionId?: ReturnSessionId;
      channel?: { channelId: ChannelId };
    };
  },
  async getFeed(query: {
    lat: number;
    lng: number;
    radius?: number;
    category?: string;
  }): Promise<FoundFeedResponse> {
    const params = new URLSearchParams({
      lat: String(query.lat),
      lng: String(query.lng),
    });
    if (typeof query.radius === 'number' && Number.isFinite(query.radius)) {
      params.set('radius', String(Math.floor(query.radius)));
    }
    if (query.category && query.category.toLowerCase() !== 'all') {
      params.set('category', query.category);
    }

    const v1Url = `${buildV1Url('found-reports', 'feed')}?${params.toString()}`;
    const apiUrl = `${buildApiUrl('found-reports', 'feed')}?${params.toString()}`;

    let response = await apiClient.fetch(v1Url, { method: 'GET', auth: 'optional' });
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await apiClient.fetch(apiUrl, { method: 'GET', auth: 'optional' });
    }

    const json = await response.json();
    if (!response.ok || !json?.success || !json.data) {
      throw new Error(json?.message || 'Không thể tải danh sách đồ nhặt được.');
    }

    return {
      cards: Array.isArray(json.data.cards) ? json.data.cards : [],
      pins: Array.isArray(json.data.pins) ? json.data.pins : [],
      totalCount: typeof json.data.totalCount === 'number' ? json.data.totalCount : 0,
    };
  },
};
