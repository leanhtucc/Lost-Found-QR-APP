/**
 * Push Notification Service
 * Manages FCM device token registration, refresh, and unregistration with backend.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { deviceStorage } from '@/storage/device';
import { registerPushDevice, unregisterPushDevice } from './api';

// Safely attempt to import Firebase messaging if available
let messagingModule: any = null;
try {
  messagingModule = require('@react-native-firebase/messaging').default;
} catch {
  // Messaging module not linked or running in unsupported environment
  messagingModule = null;
}

export const pushNotificationService = {
  /**
   * Request push permission and register FCM device token to backend
   */
  async registerDeviceToken(): Promise<string | null> {
    try {
      const deviceId = await deviceStorage.getOrCreateDeviceId();
      const appVersion = Constants.expoConfig?.version || '1.0.0';
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'web' ? 'web' : 'android';

      let pushToken: string | null = null;

      if (messagingModule) {
        try {
          const messaging = messagingModule();
          const authStatus = await messaging.requestPermission();
          const enabled =
            authStatus === 1 || // AUTHORIZED
            authStatus === 2; // PROVISIONAL

          if (!enabled) {
            console.log('[PushNotification] User declined push notification permission');
            return null;
          }

          pushToken = await messaging.getToken();
        } catch (fcmError) {
          console.warn('[PushNotification] Firebase messaging getToken error:', fcmError);
        }
      }

      if (!pushToken) {
        console.log('[PushNotification] No push token generated, skipping backend registration');
        return null;
      }

      await registerPushDevice({
        pushToken,
        platform,
        deviceId,
        appVersion,
      });

      console.log('[PushNotification] Device registered successfully:', { deviceId, platform });
      return pushToken;
    } catch (error) {
      console.error('[PushNotification] Failed to register device token:', error);
      return null;
    }
  },

  /**
   * Listen for token refresh and sync with backend
   */
  setupTokenRefreshListener(onTokenRefreshed?: (newToken: string) => void): () => void {
    if (!messagingModule) return () => {};

    try {
      const messaging = messagingModule();
      const unsubscribe = messaging.onTokenRefresh(async (newToken: string) => {
        try {
          const deviceId = await deviceStorage.getOrCreateDeviceId();
          const appVersion = Constants.expoConfig?.version || '1.0.0';
          const platform =
            Platform.OS === 'ios' ? 'ios' : Platform.OS === 'web' ? 'web' : 'android';

          await registerPushDevice({
            pushToken: newToken,
            platform,
            deviceId,
            appVersion,
          });

          console.log('[PushNotification] Refreshed token registered with backend');
          onTokenRefreshed?.(newToken);
        } catch (error) {
          console.error('[PushNotification] Failed to register refreshed token:', error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.warn('[PushNotification] Failed to set up token refresh listener:', error);
      return () => {};
    }
  },

  /**
   * Unregister device on logout
   */
  async unregisterDevice(): Promise<void> {
    try {
      const deviceId = await deviceStorage.getDeviceId();
      if (deviceId) {
        await unregisterPushDevice(deviceId);
        console.log('[PushNotification] Device unregistered from backend:', deviceId);
      }
    } catch (error) {
      console.warn('[PushNotification] Failed to unregister device:', error);
    }
  },
};
