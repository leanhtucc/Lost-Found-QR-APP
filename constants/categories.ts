/**
 * Category Constants
 * Icons và tên tiếng Việt cho các category
 */

import type { ItemCategory } from '@/types/item';
import {
  Laptop,
  Wallet,
  Briefcase,
  Key,
  Smartphone,
  Gem,
  FileText,
  Package,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

/**
 * Category Icons (Lucide Icons)
 * Sử dụng Lucide icons cho UI đẹp hơn
 */
export const CATEGORY_ICONS: Record<ItemCategory, LucideIcon> = {
  electronics: Laptop,
  wallet: Wallet,
  bag: Briefcase,
  keys: Key,
  phone: Smartphone,
  jewelry: Gem,
  documents: FileText,
  laptop: Laptop,
  other: Package,
};

/**
 * Category Icons (Emoji) - Fallback
 * Sử dụng emoji để hiển thị icon cho mỗi category
 */
export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  electronics: '💻',
  wallet: '👛',
  bag: '🎒',
  keys: '🔑',
  phone: '📱',
  jewelry: '💍',
  documents: '📄',
  laptop: '💻',
  other: '📦',
};

/**
 * Category Names (Vietnamese)
 * Tên tiếng Việt cho các category
 */
export const CATEGORY_NAMES_VI: Record<ItemCategory, string> = {
  electronics: 'Điện tử',
  wallet: 'Ví/Bóp',
  bag: 'Túi xách',
  keys: 'Chìa khóa',
  phone: 'Điện thoại',
  jewelry: 'Trang sức',
  documents: 'Giấy tờ',
  laptop: 'Laptop',
  other: 'Khác',
};

/**
 * Category Options for Picker/Select
 * Sử dụng cho form dropdown
 */
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_NAMES_VI).map(([value, label]) => ({
  value: value as ItemCategory,
  label,
  icon: CATEGORY_EMOJI[value as ItemCategory],
}));

/**
 * Helper function để lấy category label
 */
export const getCategoryLabel = (category: ItemCategory): string => {
  return CATEGORY_NAMES_VI[category] || category;
};

/**
 * Helper function để lấy category icon (Lucide)
 */
export const getCategoryIcon = (category: ItemCategory): LucideIcon => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
};

/**
 * Helper function để lấy category emoji
 */
export const getCategoryEmoji = (category: ItemCategory): string => {
  return CATEGORY_EMOJI[category] || CATEGORY_EMOJI.other;
};
