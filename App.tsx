import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';
import '@/styles/global.css';
import AppRoot from './app-root';
// eslint-disable-next-line import/no-named-as-default
import ENV from './constants/environment';
import { LogBox } from 'react-native';
import { initTelegramLogger } from './services/telegram';

// Ignore known non-breaking library-level events on Fabric / New Architecture
LogBox.ignoreLogs([
  'Unsupported top level event type "topSvgLayout" dispatched',
  'This method is deprecated (as well as all React Native Firebase namespaced API)',
]);

/**
 * Initialize Telegram Bot error tracking & startup notifications
 */
initTelegramLogger();

/**
 * Initialize Sentry for error tracking and crash reporting
 * https://docs.sentry.io/platforms/react-native/
 */
Sentry.init({
  dsn: ENV.SENTRY_DSN,

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

// Wrap with Sentry for automatic error tracking
export default Sentry.wrap(AppRoot);
