import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';

import RootStack from './navigation';

/**
 * Initialize Sentry for error tracking and crash reporting
 * https://docs.sentry.io/platforms/react-native/
 */
Sentry.init({
  dsn: 'https://ea6dd677088dcb31aabbd85249df6c02@o4510742785228800.ingest.de.sentry.io/4510742789423184',
  
  // Collect additional context data (IP, user agent, etc.)
  sendDefaultPii: true,
  
  // Enable Sentry Logs integration
  enableLogs: true,
  
  // Only enable in production to avoid noise during development
  enabled: !__DEV__,
  
  // Performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in production
  
  // Session Replay configuration
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors
  
  // Integrations
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
    Sentry.feedbackIntegration({
      colorScheme: 'light',
    }),
  ],
  
  // Environment
  environment: __DEV__ ? 'development' : 'production',
  
  // Uncomment to enable Spotlight in development
  // spotlight: __DEV__,
});

/**
 * Main App Component
 * 
 * Providers hierarchy (important order):
 * 1. GestureHandlerRootView: Required for react-native-gesture-handler
 * 2. SafeAreaProvider: Handle safe areas on devices with notches
 * 3. KeyboardProvider: Advanced keyboard handling and smooth animations
 * 4. Sentry.wrap: Error boundary and crash reporting
 */
function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <RootStack />
          <StatusBar style="light" />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Wrap with Sentry for automatic error tracking
export default Sentry.wrap(App);