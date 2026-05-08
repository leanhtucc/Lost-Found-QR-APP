/**
 * Notification Utils
 * Helpers for the notification screen (dark theme)
 */

import {
  Notification,
  NotificationType,
  NotificationCategory,
  MatchFoundMetadata,
  ProximityMetadata,
  QrScannedMetadata,
  NewChatMetadata,
  EscrowMetadata,
} from '@/types/notification';

// ─── Time formatting ─────────────────────────────────────────────────────────

export const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

// ─── Type → accent color ────────────────────────────────────────────────────

export const getNotificationAccentColor = (type: NotificationType): string => {
  switch (type) {
    case 'MATCH_FOUND':
    case 'PROXIMITY':
      return '#F97316'; // orange
    case 'QR_SCANNED':
      return '#22C55E'; // green
    case 'NEW_CHAT':
      return '#8B5CF6'; // purple
    case 'ESCROW_LOCKED':
      return '#22C55E'; // green
    case 'REFUNDED':
    case 'RELEASED':
      return '#22D3EE'; // cyan
    default:
      return '#71717A';
  }
};

// ─── Category → tab label ────────────────────────────────────────────────────

export const CATEGORY_TABS: { id: string; label: string; category?: NotificationCategory }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'important', label: 'Quan trọng', category: 'IMPORTANT' },
  { id: 'transaction', label: 'Giao dịch', category: 'TRANSACTION' },
  { id: 'item', label: 'Vật phẩm', category: 'ITEM' },
  { id: 'social', label: 'Xã hội', category: 'SOCIAL' },
];

/**
 * Map tab id → API category param.
 * Returns undefined for "all" (no filter).
 */
export const tabToCategory = (tabId: string): NotificationCategory | undefined => {
  const tab = CATEGORY_TABS.find(t => t.id === tabId);
  return tab?.category;
};

// ─── Mock data (for demo / fallback) ─────────────────────────────────────────

export const getMockNotifications = (): Notification[] => [
  {
    id: 'notif-001',
    receiver_id: 'user-self',
    category: 'IMPORTANT',
    type: 'MATCH_FOUND',
    title: 'Có người vừa nhặt được đồ gần bạn!',
    content: 'iPhone 15 có người báo tìm thấy trong bán kính 300m',
    metadata: { distance: '300m', post_id: 'post-123', item_name: 'iPhone 15' },
    is_read: false,
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-002',
    receiver_id: 'user-self',
    category: 'SOCIAL',
    type: 'NEW_CHAT',
    title: 'Người nhặt: Tôi nghĩ tôi có đồ của bạn',
    content: '',
    metadata: {
      room_id: 'room-456',
      sender_avatar: 'https://ui-avatars.com/api/?name=NT&background=8B5CF6&color=fff&size=88',
      message_preview: 'Tôi nghĩ tôi có đồ của bạn',
      item_id: 'item-789',
    },
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-003',
    receiver_id: 'user-self',
    category: 'TRANSACTION',
    type: 'ESCROW_LOCKED',
    title: '500.000đ đã được khóa an toàn',
    content: 'Giao dịch được bảo vệ bởi FindBack Escrow',
    metadata: { amount: 500000, transaction_id: 'txn-789', status: 'locked', post_id: 'post-123' },
    is_read: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-004',
    receiver_id: 'user-self',
    category: 'IMPORTANT',
    type: 'PROXIMITY',
    title: 'Người nhặt còn cách bạn 100m',
    content: 'Sẵn sàng để nhận lại món đồ của mình',
    metadata: { distance: '100m', post_id: 'post-456' },
    is_read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-005',
    receiver_id: 'user-self',
    category: 'ITEM',
    type: 'QR_SCANNED',
    title: 'Bạn đã nhận lại 2 món đồ tuần này 🎉',
    content: 'Hãy tiếp tục lan tỏa sự tử tế cùng cộng đồng.',
    metadata: { item_id: 'item-999', room_id: 'room-111', finder_id: 'user-finder' },
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];
