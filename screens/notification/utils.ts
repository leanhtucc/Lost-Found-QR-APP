/**
 * Notification Utils
 * Các hàm tiện ích cho màn hình thông báo
 */

import { ActivityType, Notification } from '@/types/notification';

/**
 * Format thời gian thông báo
 */
export const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  // Format ngày tháng cho thông báo cũ hơn
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/**
 * Lấy màu background cho icon theo loại thông báo
 */
export const getNotificationIconBg = (type: ActivityType): string => {
  switch (type) {
    case 'qr_scanned':
    case 'item_found':
      return 'bg-green-100';
    case 'new_message':
      return 'bg-blue-100';
    case 'item_returned':
      return 'bg-emerald-100';
    default:
      return 'bg-gray-100';
  }
};

/**
 * Lấy màu icon theo loại thông báo
 */
export const getNotificationIconColor = (type: ActivityType): string => {
  switch (type) {
    case 'qr_scanned':
    case 'item_found':
      return '#22c55e';
    case 'new_message':
      return '#3b82f6';
    case 'item_returned':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

/**
 * Tạo title cho thông báo
 */
export const getNotificationTitle = (notification: Notification): string => {
  switch (notification.type) {
    case 'qr_scanned':
      return '📱 Có người quét mã QR của bạn!';
    case 'item_found':
      return '🎉 Đồ vật của bạn đã được tìm thấy!';
    case 'new_message':
      return '💬 Tin nhắn mới';
    case 'item_returned':
      return '✅ Đồ vật đã được trả lại';
    default:
      return 'Thông báo';
  }
};

/**
 * Tạo message cho thông báo
 */
export const getNotificationMessage = (notification: Notification): string => {
  const actorName = notification.actor.name;
  const itemName = notification.item?.name || 'món đồ';

  switch (notification.type) {
    case 'qr_scanned':
      return `${actorName} vừa quét mã QR của "${itemName}"`;
    case 'item_found':
      return `${actorName} báo đã tìm thấy "${itemName}" của bạn`;
    case 'new_message':
      return notification.message || `${actorName} gửi tin nhắn về "${itemName}"`;
    case 'item_returned':
      return `"${itemName}" đã được trả lại thành công từ ${actorName}`;
    default:
      return notification.message || 'Bạn có thông báo mới';
  }
};

/**
 * Mock notifications cho demo
 */
export const getMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'qr_scanned',
    actor: { id: 'user1', name: 'Nguyễn Văn A' },
    item: { id: 'item1', name: 'Laptop Dell Vostro' },
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'new_message',
    actor: { id: 'user2', name: 'Trần Thị B' },
    item: { id: 'item2', name: 'Ví da đen' },
    message: 'Tôi đã nhặt được ví của bạn ở khu A',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'item_found',
    actor: { id: 'user3', name: 'Lê Văn C' },
    item: { id: 'item3', name: 'Chìa khóa xe' },
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'item_returned',
    actor: { id: 'user4', name: 'Phạm Thị D' },
    item: { id: 'item4', name: 'Tai nghe AirPods' },
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];
