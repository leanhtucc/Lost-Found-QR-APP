import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Reads from app.config.js extra field which loads from .env files
 */

// Get extra config from expo
const expoExtra = Constants.expoConfig?.extra || {};

// Environment configuration
export const ENV = {
  // API URL from .env file (via app.config.js)
  API_URL: expoExtra.apiUrl || process.env.API_URL || 'http://192.168.10.102:3000',

  // Current environment
  ENVIRONMENT: expoExtra.environment || process.env.ENV || 'development',

  // Check if we're in development mode
  IS_DEV: __DEV__,

  // Check if we're in production mode
  IS_PROD: !__DEV__,

  SENTRY_DSN: expoExtra.sentryDsn || process.env.SENTRY_DSN || '',

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
console.log('🔍 Environment Config:');
console.log('SENTRY_DSN:', ENV.SENTRY_DSN);
console.log('API_URL:', ENV.API_URL);
console.log('ENVIRONMENT:', ENV.ENVIRONMENT);
console.log('GOOGLE_WEB_CLIENT_ID:', ENV.GOOGLE_WEB_CLIENT_ID);
console.log('expoExtra:', expoExtra);
// Helper function to get API URL
export const getApiUrl = (): string => {
  return ENV.API_URL;
};

// Helper function to get auth API URL
export const getAuthApiUrl = (): string => {
  return `${ENV.API_URL}/api/auth`;
};

// Helper function to check environment
export const isDevelopment = (): boolean => {
  return ENV.IS_DEV;
};

export const isProduction = (): boolean => {
  return ENV.IS_PROD;
};

export default ENV;
