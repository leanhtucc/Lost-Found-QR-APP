/**
 * Push Notification Service
 * Manages FCM device token registration, refresh, and unregistration with backend.
 */

import { PermissionsAndroid, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  deleteToken,
  requestPermission,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { deviceStorage } from '@/storage/device';
import { registerPushDevice, unregisterPushDevice } from './api';

const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  if (Platform.OS === 'ios') {
    const authStatus = await requestPermission(getMessaging());
    // 1 = AUTHORIZED, 2 = PROVISIONAL
    return authStatus === 1 || authStatus === 2;
  }

  return false;
};

export const pushNotificationService = {
  /**
   * Request push permission and register FCM device token to backend
   */
  async registerDeviceToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return null;

      const deviceId = await deviceStorage.getOrCreateDeviceId();
      const appVersion = Constants.expoConfig?.version || '1.0.0';
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        console.log('[PushNotification] User declined push notification permission');
        return null;
      }

      const firebaseMessaging = getMessaging();
      if (Platform.OS === 'ios') {
        try {
          await registerDeviceForRemoteMessages(firebaseMessaging);
        } catch (regError) {
          console.warn('[PushNotification] Remote message registration warning:', regError);
        }
      }

      let pushToken: string;
      try {
        pushToken = await getToken(firebaseMessaging);
      } catch (tokenError: any) {
        const errorMsg = String(tokenError?.message || tokenError);
        if (errorMsg.includes('FIS_AUTH_ERROR')) {
          console.warn(
            '[PushNotification] Firebase Installations Auth Error (FIS_AUTH_ERROR). Verify Google Cloud API key restrictions and package name/SHA-1 in Firebase Console.'
          );
          return null;
        }
        throw tokenError;
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
    if (Platform.OS === 'web') return () => {};

    try {
      const unsubscribe = onTokenRefresh(getMessaging(), async (newToken: string) => {
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
    } finally {
      if (Platform.OS !== 'web') {
        await deleteToken(getMessaging()).catch(error =>
          console.warn('[PushNotification] Failed to revoke FCM token:', error)
        );
      }
    }
  },
};
