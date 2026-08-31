/**
 * Notification Types
 * Định nghĩa các kiểu dữ liệu cho hệ thống thông báo FindBack Alerts
 * Matching API spec: /v1/notifications
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

/** Category — dùng cho tab filtering */
export type NotificationCategory = 'IMPORTANT' | 'TRANSACTION' | 'ITEM' | 'SOCIAL';

/** Type — mã loại, dùng để render UI + deep link */
export type NotificationType =
  | 'MATCH_FOUND'
  | 'PROXIMITY'
  | 'QR_SCANNED'
  | 'NEW_CHAT'
  | 'ESCROW_LOCKED'
  | 'REFUNDED'
  | 'RELEASED';

// ─── Metadata (JSONB — dynamic per type) ─────────────────────────────────────

export interface MatchFoundMetadata {
  distance?: string;
  post_id?: string;
  item_name?: string;
}

export interface ProximityMetadata {
  distance?: string;
  post_id?: string;
}

export interface QrScannedMetadata {
  item_id?: string;
  room_id?: string;
  finder_id?: string;
}

export interface NewChatMetadata {
  room_id?: string;
  sender_avatar?: string;
  message_preview?: string;
  item_id?: string;
}

export interface EscrowMetadata {
  amount?: number;
  transaction_id?: string;
  status?: 'locked' | 'refunded' | 'released';
  post_id?: string;
}

/** Union of all possible metadata shapes */
export type NotificationMetadata =
  | MatchFoundMetadata
  | ProximityMetadata
  | QrScannedMetadata
  | NewChatMetadata
  | EscrowMetadata
  | Record<string, unknown>;

// ─── Core Notification Object ────────────────────────────────────────────────

export interface Notification {
  id: string;
  receiver_id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  content: string;
  metadata: NotificationMetadata;
  is_read: boolean;
  created_at: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface GetNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    data: Notification[];
    total_unread: number;
    pagination: NotificationPagination;
  };
  timestamp: string;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: Notification;
  timestamp: string;
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  data: {
    updated_count: number;
  };
  timestamp: string;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  };
  timestamp: string;
}

// ─── Push Notification & Device Types ────────────────────────────────────────

export interface RegisterPushDeviceRequest {
  pushToken: string;
  platform: 'android' | 'ios' | 'web';
  deviceId: string;
  appVersion?: string;
}

export interface RegisterPushDeviceResponse {
  success: boolean;
  message: string;
  data?: {
    deviceId: string;
    token: string;
  };
}

export interface NotificationPreferences {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  proximityEnabled?: boolean;
  notificationRadiusMeters?: number;
  language?: 'vi' | 'en';
  importantEnabled?: boolean;
  transactionEnabled?: boolean;
  itemEnabled?: boolean;
  socialEnabled?: boolean;
  dailyDigestEnabled?: boolean;
  nearbyAlertsEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietStart?: string;
  quietEnd?: string;
  timezone?: string;
  dailyDigestTime?: string;
  nearbyRadius?: number;
}

export interface NotificationPreferencesResponse {
  success: boolean;
  message: string;
  data: NotificationPreferences;
  timestamp?: string;
}

// ─── Legacy compat (kept for gradual migration elsewhere) ────────────────────

/** @deprecated Use NotificationType instead */
export type ActivityType = 'item_found' | 'new_message' | 'item_returned' | 'qr_scanned';

/** @deprecated Use Notification.metadata instead */
export interface ActivityMetadata {
  itemId?: string;
  finderName?: string;
  message?: string;
  location?: string;
}

/** @deprecated Use Notification instead */
export interface NotificationActor {
  id: string;
  name: string;
  avatar?: string;
}

/** @deprecated Use Notification.metadata instead */
export interface NotificationItem {
  id: string;
  name: string;
  category?: string;
}

/** @deprecated Use GetNotificationsResponse instead */
export interface NotificationsResponse {
  success: boolean;
  data: {
    total: number;
    unreadTotal: number;
    notifications: Notification[];
  };
}

/** @deprecated Kept for Stream token if still used elsewhere */
export interface StreamTokenResponse {
  success: boolean;
  data: {
    token: string;
    apiKey: string;
    userId: string;
  };
  message: string;
}
