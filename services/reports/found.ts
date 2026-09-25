import * as Crypto from 'expo-crypto';
import { authStorage } from '@storage/auth';
import { buildApiUrl, buildV1Url } from '@services/shared/url';
import type { ItemCategory } from '@/types/item';
import type { HomeLostFeedCard, HomeLostFeedPin } from '@/types/radar';

export interface FoundReport {
  id: string;
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
  foundReportId: string;
  claimantId: string;
  ownershipProof: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  returnSessionId?: string | null;
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
    const token = await authStorage.getAccessToken();
    if (!token) throw new Error('Vui lòng đăng nhập để đăng bài.');
    const response = await fetch(buildApiUrl('found-reports'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    const token = await authStorage.getAccessToken();
    const response = await fetch(buildApiUrl('found-reports', encodeURIComponent(id)), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await response.json();
    if (!response.ok || !json?.success || !json.data?.id) {
      throw new Error(json?.message || 'Không thể tải bài đăng.');
    }
    return json.data;
  },
  async createClaim(id: string, ownershipProof: string): Promise<FoundReportClaim> {
    const token = await authStorage.getAccessToken();
    if (!token) throw new Error('Vui lòng đăng nhập để nhận đồ.');
    const response = await fetch(buildApiUrl('found-reports', id, 'claims'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownershipProof }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể gửi bằng chứng sở hữu.');
    return json.data;
  },
  async getMyClaim(id: string): Promise<FoundReportClaim | null> {
    const token = await authStorage.getAccessToken();
    if (!token) return null;
    const response = await fetch(buildApiUrl('found-reports', id, 'claims', 'mine'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể tải yêu cầu nhận đồ.');
    return json.data;
  },
  async getClaims(id: string): Promise<FoundReportClaim[]> {
    const token = await authStorage.getAccessToken();
    if (!token) return [];
    const response = await fetch(buildApiUrl('found-reports', id, 'claims'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể tải danh sách yêu cầu.');
    return json.data;
  },
  async reviewClaim(id: string, claimId: string, decision: 'accept' | 'reject') {
    const token = await authStorage.getAccessToken();
    if (!token) throw new Error('Vui lòng đăng nhập lại.');
    const response = await fetch(buildApiUrl('found-reports', id, 'claims', claimId, decision), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Không thể xử lý yêu cầu.');
    return json.data as {
      returnSessionId?: string;
      channel?: { channelId: string };
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

    const token = await authStorage.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const v1Url = `${buildV1Url('found-reports', 'feed')}?${params.toString()}`;
    const apiUrl = `${buildApiUrl('found-reports', 'feed')}?${params.toString()}`;

    let response = await fetch(v1Url, { method: 'GET', headers });
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await fetch(apiUrl, { method: 'GET', headers });
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
