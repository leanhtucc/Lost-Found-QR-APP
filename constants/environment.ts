import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Reads from app.config.js extra field which loads from .env files
 */

// Get extra config from expo
const expoExtra = Constants.expoConfig?.extra || {};
export type AppEnvironment = 'development' | 'preview' | 'production';

const resolveEnvironment = (): AppEnvironment => {
  const value = expoExtra.environment || process.env.ENV || process.env.APP_ENV || 'development';
  if (value === 'test') return 'development';
  if (!['development', 'preview', 'production'].includes(value)) {
    throw new Error(`[ENV] Unsupported environment: ${String(value)}`);
  }
  return value as AppEnvironment;
};

const resolveGoogleWebClientId = (): string => {
  const value = expoExtra.googleWebClientId || process.env.GOOGLE_WEB_CLIENT_ID;

  if (
    typeof value !== 'string' ||
    !/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(value.trim()) ||
    /X{4,}/i.test(value)
  ) {
    throw new Error('[ENV] Missing or invalid GOOGLE_WEB_CLIENT_ID.');
  }

  return value.trim();
};

const resolveRequiredApiUrl = (): string => {
  const rawApiUrl = expoExtra.apiUrl || process.env.API_URL;

  if (typeof rawApiUrl !== 'string' || rawApiUrl.trim().length === 0) {
    throw new Error(
      '[ENV] Missing API_URL. Set extra.apiUrl in app.config.js or API_URL in the environment.'
    );
  }

  return rawApiUrl.trim().replace(/\/+$/, '');
};

const environment = resolveEnvironment();

// Environment configuration
export const ENV = {
  // Required API URL from env/app.config (no hardcoded fallback)
  API_URL: resolveRequiredApiUrl(),

  // Current environment
  ENVIRONMENT: environment,

  // Check if we're in development mode
  IS_DEV: environment === 'development',

  IS_PREVIEW: environment === 'preview',

  // Check if we're in production mode
  IS_PROD: environment === 'production',

  SENTRY_DSN: expoExtra.sentryDsn || process.env.SENTRY_DSN || '',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: expoExtra.googleMapsApiKey || process.env.GOOGLE_MAPS_API_KEY || '',

  // Google OAuth Client IDs
  // Lấy từ Firebase Console > Project Settings > General > Your apps
  GOOGLE_WEB_CLIENT_ID: resolveGoogleWebClientId(),
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
