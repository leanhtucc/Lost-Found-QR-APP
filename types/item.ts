/**
 * Item Types
 * Định nghĩa các type cho đồ vật trong ứng dụng
 */

// Item Categories
export type ItemCategory =
  | 'electronics'
  | 'wallet'
  | 'bag'
  | 'keys'
  | 'phone'
  | 'jewelry'
  | 'documents'
  | 'other';

// Item Status
export type ItemStatus = 'safe' | 'lost';

// Location coordinates
export interface Location {
  lat: number;
  lng: number;
}

// Main Item interface - matches backend schema
export interface Item {
  id: string; // UUID - Database ID
  itemId: string; // nanoid(16) - Unique ID cho QR
  ownerId: string; // User ID của chủ sở hữu
  name: string; // Tên vật phẩm (max 100 chars)
  category: ItemCategory; // Danh mục
  description?: string; // Mô tả (max 500 chars)
  status: ItemStatus; // Trạng thái
  lostMessage?: string; // Tin nhắn khi mất (max 500 chars)
  qrCodeUrl: string; // URL QR Code
  imagePublicUrl?: string; // URL ảnh vật phẩm
  lastSeenLocation?: Location | string; // JSON: {lat: number, lng: number}
  securityPin?: string; // Mã PIN 4 số
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
  securityPin?: string;
}

// Update item params
export interface UpdateItemParams {
  name?: string;
  category?: ItemCategory;
  description?: string;
  imagePublicUrl?: string;
  lastSeenLocation?: Location | string;
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

// Update status params
export interface UpdateStatusParams {
  status: ItemStatus;
  lostMessage?: string;
}

// Scan QR response - khi item safe
export interface ScanItemSafeResponse {
  item_info: {
    id: string;
    name: string;
    category: ItemCategory;
    status: 'safe';
    owner_info: {
      display_name: string;
      avatar?: string;
      joined_date: string;
    };
  };
  action: 'info_only';
  message: string;
}

// Scan QR response - khi item lost
export interface ScanItemLostResponse {
  item_info: {
    id: string;
    name: string;
    category: ItemCategory;
    status: 'lost';
    lost_message: string;
    owner_info: {
      display_name: string;
      avatar?: string;
      joined_date: string;
    };
  };
  action: 'open_chat';
}

export type ScanItemResponse = ScanItemSafeResponse | ScanItemLostResponse;

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
};
