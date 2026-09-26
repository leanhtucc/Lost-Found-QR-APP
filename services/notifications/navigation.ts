import type { Notification, NotificationType } from '@/types/notification';

type NotificationData = Record<string, unknown>;

export type NotificationDestination =
  | { screen: 'Notifications' }
  | { screen: 'ItemDetails'; params: { itemId: string } }
  | { screen: 'FoundReportDetails'; params: { reportId: string } }
  | { screen: 'ChatList' }
  | {
      screen: 'Chat';
      params: {
        channelId: string;
        itemName: string;
        userName: string;
        userAvatar?: string;
        isVerified?: boolean;
      };
    }
  | { screen: 'LiveTracking'; params: { returnSessionId: string } }
  | { screen: 'HandoverConfirm'; params: { returnSessionId: string } }
  | { screen: 'RewardStatus'; params: { returnSessionId: string } };

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

export const parseFcmNotificationData = (data?: NotificationData): NotificationData => {
  if (!data) return {};
  const metadataValue = data.metadata;

  if (typeof metadataValue === 'string') {
    try {
      const parsed = JSON.parse(metadataValue);
      if (parsed && typeof parsed === 'object') return { ...data, ...parsed };
    } catch {
      return data;
    }
  }

  return metadataValue && typeof metadataValue === 'object'
    ? { ...data, ...(metadataValue as NotificationData) }
    : data;
};

export const resolveNotificationDestination = (
  type: NotificationType | string | undefined,
  rawData: NotificationData = {}
): NotificationDestination => {
  const data = parseFcmNotificationData(rawData);
  const itemId = stringValue(data.item_id ?? data.itemId ?? data.post_id ?? data.postId);
  const reportId = stringValue(data.found_report_id ?? data.report_id ?? data.reportId);
  const channelId = stringValue(data.room_id ?? data.channel_id ?? data.roomId ?? data.channelId);
  const returnSessionId = stringValue(
    data.return_session_id ?? data.returnSessionId ?? data.session_id ?? data.sessionId
  );

  if (type === 'MATCH_FOUND' || type === 'PROXIMITY' || type === 'ITEM_MARKED_LOST') {
    return itemId ? { screen: 'ItemDetails', params: { itemId } } : { screen: 'Notifications' };
  }

  if (type?.startsWith('FOUND_REPORT_')) {
    return reportId
      ? { screen: 'FoundReportDetails', params: { reportId } }
      : { screen: 'Notifications' };
  }

  if (type === 'NEW_CHAT' || type === 'QR_SCANNED') {
    if (!channelId) return { screen: 'ChatList' };
    return {
      screen: 'Chat',
      params: {
        channelId,
        itemName: stringValue(data.item_name) ?? 'Đồ thất lạc',
        userName: stringValue(data.user_name ?? data.finder_name) ?? 'Người dùng',
        userAvatar: stringValue(data.user_avatar ?? data.sender_avatar),
        isVerified: data.is_verified === true || data.is_verified === 'true',
      },
    };
  }

  if (returnSessionId) {
    if (type === 'HANDOVER_READY') {
      return { screen: 'HandoverConfirm', params: { returnSessionId } };
    }
    if (
      type === 'HANDOVER_CONFIRMED' ||
      type === 'RETURN_COMPLETED' ||
      type === 'REWARD_PAID' ||
      type === 'RATING_RECEIVED'
    ) {
      return { screen: 'RewardStatus', params: { returnSessionId } };
    }
    return { screen: 'LiveTracking', params: { returnSessionId } };
  }

  return { screen: 'Notifications' };
};

export const resolveStoredNotificationDestination = (
  notification: Notification
): NotificationDestination =>
  resolveNotificationDestination(notification.type, notification.metadata as NotificationData);
