import { registerRootComponent } from 'expo';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

// FCM invokes this handler when a data message arrives while the app is in the
// background or terminated. Notification payloads are displayed by the OS;
// persisted notification state is reconciled when the app becomes active.
try {
  setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
    if (__DEV__) {
      console.log('[FCM] Background message received:', remoteMessage.messageId);
    }
  });
} catch (error) {
  if (__DEV__) {
    console.warn('[FCM] Background message handler init error:', error);
  }
}

ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash is already controlled by native runtime.
});

// Use require to ensure preventAutoHideAsync runs before App module evaluation.

const { default: App } = require('./App');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
