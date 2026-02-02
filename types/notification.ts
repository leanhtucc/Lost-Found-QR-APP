/**
 * Notification Types
 * Định nghĩa các kiểu dữ liệu cho hệ thống thông báo dựa trên Stream Chat
 */

export type ActivityType = 'item_found' | 'new_message' | 'item_returned' | 'qr_scanned';

export interface NotificationActor {
  id: string;
  name: string;
  avatar?: string;
}

export interface NotificationItem {
  id: string;
  name: string;
  category?: string;
}

export interface Notification {
  id: string;
  type: ActivityType;
  actor: NotificationActor;
  item?: NotificationItem;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    total: number;
    unreadTotal: number;
    notifications: Notification[];
  };
}

export interface StreamTokenResponse {
  success: boolean;
  data: {
    token: string;
    apiKey: string;
    userId: string;
  };
  message: string;
}

export interface ActivityMetadata {
  itemId?: string;
  finderName?: string;
  message?: string;
  location?: string;
}
