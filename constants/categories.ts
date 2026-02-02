/**
 * Category Constants
 * Icons và tên tiếng Việt cho các category
 */

import type { ItemCategory } from '@types/item';

/**
 * Category Icons (Emoji)
 * Sử dụng emoji để hiển thị icon cho mỗi category
 */
export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  electronics: '💻',
  wallet: '👛',
  bag: '🎒',
  keys: '🔑',
  phone: '📱',
  jewelry: '💍',
  documents: '📄',
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
  other: 'Khác',
};

/**
 * Category Options for Picker/Select
 * Sử dụng cho form dropdown
 */
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_NAMES_VI).map(([value, label]) => ({
  value: value as ItemCategory,
  label,
  icon: CATEGORY_ICONS[value as ItemCategory],
}));

/**
 * Helper function để lấy category label
 */
export const getCategoryLabel = (category: ItemCategory): string => {
  return CATEGORY_NAMES_VI[category] || category;
};

/**
 * Helper function để lấy category icon
 */
export const getCategoryIcon = (category: ItemCategory): string => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
};
