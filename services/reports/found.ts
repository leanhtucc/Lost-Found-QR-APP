import * as Crypto from 'expo-crypto';
import { authStorage } from '@storage/auth';
import { buildApiUrl } from '@services/shared/url';
import type { ItemCategory } from '@/types/item';

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
}

export interface CreateFoundReport {
  idempotencyKey: string;
  name: string;
  category: ItemCategory;
  description?: string;
  imagePublicUrl: string;
  location: { lat: number; lng: number; address: string };
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
    const response = await fetch(buildApiUrl('found-reports', encodeURIComponent(id)));
    const json = await response.json();
    if (!response.ok || !json?.success || !json.data?.id) {
      throw new Error(json?.message || 'Không thể tải bài đăng.');
    }
    return json.data;
  },
};
