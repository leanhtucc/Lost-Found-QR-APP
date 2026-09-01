import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Reads from app.config.js extra field which loads from .env files
 */

// Get extra config from expo
const expoExtra = Constants.expoConfig?.extra || {};

const resolveRequiredApiUrl = (): string => {
  const rawApiUrl = expoExtra.apiUrl || process.env.API_URL;

  if (typeof rawApiUrl !== 'string' || rawApiUrl.trim().length === 0) {
    throw new Error(
      '[ENV] Missing API_URL. Set extra.apiUrl in app.config.js or API_URL in the environment.'
    );
  }

  return rawApiUrl.trim().replace(/\/+$/, '');
};

// Environment configuration
export const ENV = {
  // Required API URL from env/app.config (no hardcoded fallback)
  API_URL: resolveRequiredApiUrl(),

  // Current environment
  ENVIRONMENT: expoExtra.environment || process.env.ENV || 'development',

  // Check if we're in development mode
  IS_DEV: __DEV__,

  // Check if we're in production mode
  IS_PROD: !__DEV__,

  SENTRY_DSN: expoExtra.sentryDsn || process.env.SENTRY_DSN || '',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY:
    expoExtra.googleMapsApiKey ||
    process.env.GOOGLE_MAPS_API_KEY ||
    'AIzaSyCNgLlZO_-OSVz89vNxggZp8W8VPvzmnMg',

  // Google OAuth Client IDs
  // Lấy từ Firebase Console > Project Settings > General > Your apps
  GOOGLE_WEB_CLIENT_ID:
    expoExtra.googleWebClientId ||
    process.env.GOOGLE_WEB_CLIENT_ID ||
    '970897912928-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com',
  GOOGLE_IOS_CLIENT_ID: expoExtra.googleIosClientId || process.env.GOOGLE_IOS_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID:
    expoExtra.googleAndroidClientId || process.env.GOOGLE_ANDROID_CLIENT_ID || '',
};
// Helper function to get API URL
export const getApiUrl = (): string => {
  return ENV.API_URL;
};

// Helper function to get auth API URL
export const getAuthApiUrl = (): string => {
  return `${getApiUrl()}/api/auth`;
};

// Helper function to check environment
export const isDevelopment = (): boolean => {
  return ENV.IS_DEV;
};

export const isProduction = (): boolean => {
  return ENV.IS_PROD;
};

export default ENV;
