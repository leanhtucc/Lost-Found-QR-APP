/**
 * useNotificationHandler Hook
 * Handles Foreground, Background, and Quit-state push notifications and deeplinking.
 */

import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import type { RootStackParamList } from '@/navigation';
import {
  markNotificationAsOpened,
  parseFcmNotificationData,
  resolveNotificationDestination,
} from '@/services/notifications';
import { useNotificationContext } from '@/contexts/NotificationContext';

export function useNotificationHandler() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { refreshUnreadCount } = useNotificationContext();

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

      const data = parseFcmNotificationData(remoteMessageData);
      const type = typeof data.type === 'string' ? data.type : undefined;
      const destination = resolveNotificationDestination(type, data);

      switch (destination.screen) {
        case 'ItemDetails':
          navigation.navigate('ItemDetails', destination.params);
          break;
        case 'FoundReportDetails':
          navigation.navigate('FoundReportDetails', destination.params);
          break;
        case 'Chat':
          navigation.navigate('Chat', destination.params);
          break;
        case 'ChatList':
          navigation.navigate('ChatList');
          break;
        case 'LiveTracking':
          navigation.navigate('LiveTracking', destination.params);
          break;
        case 'HandoverConfirm':
          navigation.navigate('HandoverConfirm', destination.params);
          break;
        case 'RewardStatus':
          navigation.navigate('RewardStatus', destination.params);
          break;
        default:
          navigation.navigate('Notifications');
      }

      void refreshUnreadCount();
    },
    [navigation, refreshUnreadCount]
  );

  useEffect(() => {
    try {
      const messagingInstance = getMessaging();

      // 1. App in Foreground
      const unsubscribeOnMessage = onMessage(messagingInstance, async remoteMessage => {
        console.log('[NotificationHandler] Foreground notification received:', remoteMessage);
        await refreshUnreadCount();
      });

      // 2. App in Background (opened by user click)
      const unsubscribeOnOpened = onNotificationOpenedApp(messagingInstance, remoteMessage => {
        console.log(
          '[NotificationHandler] Notification opened from background:',
          remoteMessage?.data
        );
        if (remoteMessage?.data) {
          void handleNotificationNavigation(remoteMessage.data);
        }
      });

      // 3. App in Quit State (opened by user click from cold start)
      getInitialNotification(messagingInstance)
        .then(remoteMessage => {
          if (remoteMessage?.data) {
            console.log(
              '[NotificationHandler] Notification opened from quit state:',
              remoteMessage.data
            );
            void handleNotificationNavigation(remoteMessage.data);
          }
        })
        .catch(error => {
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
  }, [handleNotificationNavigation, refreshUnreadCount]);
}

export default useNotificationHandler;
