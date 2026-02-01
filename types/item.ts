/**
 * Item Types
 * Định nghĩa các type cho đồ vật trong ứng dụng
 */

export type ItemCategory = 'laptop' | 'wallet' | 'keys' | 'phone' | 'bag' | 'other';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  isLost: boolean;
  createdAt: Date;
  description?: string;
  imageUrl?: string;
  qrCode?: string;
}

export interface ItemFormData {
  name: string;
  category: ItemCategory;
  description?: string;
  imageUrl?: string;
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
  laptop: {
    label: 'Laptop',
    icon: 'laptop',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  wallet: {
    label: 'Ví',
    icon: 'wallet',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
  },
  keys: {
    label: 'Chìa khóa',
    icon: 'key',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  phone: {
    label: 'Điện thoại',
    icon: 'smartphone',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
  },
  bag: {
    label: 'Túi xách',
    icon: 'briefcase',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-600',
  },
  other: {
    label: 'Khác',
    icon: 'package',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
};
