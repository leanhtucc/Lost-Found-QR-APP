/**
 * Item Types
 * Định nghĩa các type cho đồ vật trong ứng dụng
 */

import { User } from '@/services/auth/types';

// Item Categories
export type ItemCategory =
  | 'electronics'
  | 'wallet'
  | 'bag'
  | 'keys'
  | 'phone'
  | 'jewelry'
  | 'documents'
  | 'laptop'
  | 'other';

// Item Status
export type ItemStatus = 'SAFE' | 'LOST' | 'FOUND' | 'RESOLVED';

// Location coordinates
export interface Location {
  lat: number;
  lng: number;
}

// Main Item interface - matches backend schema
export interface Item {
  id: string; // UUID - Database ID
  itemId: string; // nanoid(16) / cuid - Unique ID cho QR
  publicItemId?: string; // Public Item ID
  qrCodeId?: string; // Mã dùng để quét QR
  ownerId: string; // User ID của chủ sở hữu
  owner?: User; // Full owner info with trust metrics
  name: string; // Tên vật phẩm (max 100 chars)
  category: ItemCategory; // Danh mục
  description?: string; // Mô tả (max 500 chars)
  status: ItemStatus; // Trạng thái
  lostMessage?: string; // Tin nhắn khi mất (max 500 chars)
  lostAddress?: string; // Địa chỉ mất
  lostLat?: number;
  lostLng?: number;
  qrCodeUrl?: string; // URL QR Code
  imagePublicUrl?: string; // URL ảnh vật phẩm
  lastSeenLocation?: Location | string; // JSON: {lat: number, lng: number}
  securityPin?: string; // Mã PIN 4 số
  // Registered capture location (safe storage)
  captureLatitude?: number | null;
  captureLongitude?: number | null;
  captureAddress?: string | null;
  captureAccuracyMeters?: number | null;
  capturedAt?: string | null;
  captureLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracyMeters?: number;
    capturedAt?: string;
  } | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Create item params
export interface CreateItemParams {
  name: string;
  category: ItemCategory;
  description?: string;
  imagePublicUrl?: string;
  lastSeenLocation?: Location | string;
  latitude?: number;
  longitude?: number;
  address?: string;
  captureLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracyMeters?: number;
    capturedAt?: string;
  } | null;
  securityPin?: string;
}

// Update item params
export interface UpdateItemParams {
  name?: string;
  category?: ItemCategory;
  description?: string;
  imagePublicUrl?: string;
  lastSeenLocation?: Location | string;
  latitude?: number;
  longitude?: number;
  address?: string;
  captureLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracyMeters?: number;
    capturedAt?: string;
  } | null;
  securityPin?: string;
}

// List items response
export interface ListItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard data
export interface DashboardData {
  items: Item[];
  total: number;
  safeCount: number;
  lostCount: number;
}

// Items Summary Data (from /api/items/summary)
export interface ItemsSummary {
  totalItems: number;
  safeItems: number;
  lostItems: number;
  foundItems: number;
}

// Update status params
export type UpdateStatusParams =
  | {
      status: 'SAFE';
    }
  | {
      status: 'LOST';
      latitude: number;
      longitude: number;
      lostMessage?: string;
      lostAddress?: string;
    };

export interface ScanItemOwnerInfo {
  memberId?: string;
  display_name: string;
  avatar?: string;
  trust_score?: number;
  is_verified?: boolean;
  joined_date?: string;
  total_returned?: number;
}

export interface ScanItemInfo {
  id: string;
  itemId?: string;
  name: string;
  category: ItemCategory | string;
  status: ItemStatus;
  lost_message?: string;
  owner_info?: ScanItemOwnerInfo;
}

// Scan QR response - khi item safe
export interface ScanItemSafeResponse {
  success?: boolean;
  item_info: ScanItemInfo;
  action: 'info_only';
  message: string;
}

// Scan QR response - khi item lost
export interface ScanItemLostResponse {
  success?: boolean;
  item_info: ScanItemInfo;
  action: 'open_chat';
  message?: string;
  channelId?: string;
}

export type ScanItemResponse = ScanItemSafeResponse | ScanItemLostResponse;

export interface ScanGuestInitParams {
  itemId: string;
  phoneNumber: string;
  lat?: number;
  lng?: number;
}

export interface ScanGuestInitResponse {
  success: boolean;
  chatToken: string;
  guestId: string;
  channelId: string;
  guestInfo?: {
    id: string;
    displayName: string;
  };
  message?: string;
}

// API Response wrapper
export interface ItemApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Category display configuration
export const CATEGORY_CONFIG: Record<
  ItemCategory,
  {
    label: string;
    icon: string;
    bgColor: string;
    textColor: string;
  }
> = {
  electronics: {
    label: 'Điện tử',
    icon: 'laptop',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  wallet: {
    label: 'Ví/Bóp',
    icon: 'wallet',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
  },
  bag: {
    label: 'Túi xách',
    icon: 'briefcase',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-600',
  },
  keys: {
    label: 'Chìa khóa',
    icon: 'key',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
  },
  phone: {
    label: 'Điện thoại',
    icon: 'smartphone',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
  },
  jewelry: {
    label: 'Trang sức',
    icon: 'gem',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-600',
  },
  documents: {
    label: 'Giấy tờ',
    icon: 'file-text',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  other: {
    label: 'Khác',
    icon: 'package',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  laptop: {
    label: 'Laptop',
    icon: 'laptop',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
};
