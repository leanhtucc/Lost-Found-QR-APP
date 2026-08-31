/**
 * useNotificationHandler Hook
 * Handles Foreground, Background, and Quit-state push notifications and deeplinking.
 */

import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation';
import { markNotificationAsOpened } from '@/services/notifications';

let messagingModule: any = null;
try {
  messagingModule = require('@react-native-firebase/messaging').default;
} catch {
  messagingModule = null;
}

export function useNotificationHandler() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleNotificationNavigation = useCallback(
    async (remoteMessageData?: Record<string, any>) => {
      if (!remoteMessageData) return;

      const notificationId = remoteMessageData.id || remoteMessageData.notification_id;
      if (notificationId) {
        try {
          await markNotificationAsOpened(String(notificationId));
        } catch (error) {
          console.warn('[NotificationHandler] Failed to mark opened:', error);
        }
      }

      let metadata: Record<string, any> = {};
      if (typeof remoteMessageData.metadata === 'string') {
        try {
          metadata = JSON.parse(remoteMessageData.metadata);
        } catch {
          metadata = {};
        }
      } else if (
        typeof remoteMessageData.metadata === 'object' &&
        remoteMessageData.metadata !== null
      ) {
        metadata = remoteMessageData.metadata;
      }

      const type = remoteMessageData.type || metadata.type;
      const itemId =
        metadata.post_id ||
        metadata.item_id ||
        remoteMessageData.postId ||
        remoteMessageData.itemId;
      const channelId =
        metadata.channel_id ||
        metadata.room_id ||
        remoteMessageData.channelId ||
        remoteMessageData.roomId;

      switch (type) {
        case 'MATCH_FOUND':
        case 'PROXIMITY':
          if (itemId) {
            navigation.navigate('ItemDetails', { itemId: String(itemId) });
          } else {
            navigation.navigate('Notifications');
          }
          break;

        case 'NEW_CHAT':
        case 'QR_SCANNED':
          if (channelId) {
            navigation.navigate('Chat', {
              channelId: String(channelId),
              itemName: metadata.item_name || 'Đồ thất lạc',
              userName: metadata.user_name || metadata.finder_name || 'Người dùng',
              userAvatar: metadata.user_avatar,
              isVerified: Boolean(metadata.is_verified),
            });
          } else {
            navigation.navigate('ChatList');
          }
          break;

        default:
          navigation.navigate('Notifications');
          break;
      }
    },
    [navigation]
  );

  useEffect(() => {
    if (!messagingModule) return;

    try {
      const messaging = messagingModule();

      // 1. App in Foreground
      const unsubscribeOnMessage = messaging.onMessage(async (remoteMessage: any) => {
        console.log('[NotificationHandler] Foreground notification received:', remoteMessage);
      });

      // 2. App in Background (opened by user click)
      const unsubscribeOnOpened = messaging.onNotificationOpenedApp((remoteMessage: any) => {
        console.log(
          '[NotificationHandler] Notification opened from background:',
          remoteMessage?.data
        );
        if (remoteMessage?.data) {
          void handleNotificationNavigation(remoteMessage.data);
        }
      });

      // 3. App in Quit State (opened by user click from cold start)
      messaging()
        .getInitialNotification()
        .then((remoteMessage: any) => {
          if (remoteMessage?.data) {
            console.log(
              '[NotificationHandler] Notification opened from quit state:',
              remoteMessage.data
            );
            void handleNotificationNavigation(remoteMessage.data);
          }
        })
        .catch((error: any) => {
          console.warn('[NotificationHandler] Error getting initial notification:', error);
        });

      return () => {
        unsubscribeOnMessage();
        unsubscribeOnOpened();
      };
    } catch (error) {
      console.warn('[NotificationHandler] Failed to initialize listeners:', error);
      return;
    }
  }, [handleNotificationNavigation]);
}

export default useNotificationHandler;
