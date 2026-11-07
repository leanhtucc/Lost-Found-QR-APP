const path = require('path');
const dotenv = require('dotenv');

// Load shared local values first. A selected environment file only overrides
// values that belong to that environment. Variables configured in EAS still
// take precedence because they already exist in process.env.
const projectRoot = __dirname; // eslint-disable-line no-undef

dotenv.config({ path: path.resolve(projectRoot, '.env') });
if (process.env.ENVFILE) {
  dotenv.config({ path: path.resolve(projectRoot, process.env.ENVFILE), override: true });
}

const environment = process.env.ENV || process.env.APP_ENV || 'development';

const requireEnv = name => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[ENV] Missing ${name} for ${environment} build.`);
  }
  return value;
};

const apiUrl = requireEnv('API_URL').replace(/\/+$/, '');
const apiHostname = new URL(apiUrl).hostname.toLowerCase();
const isPrivateDevHost =
  ['localhost', '127.0.0.1', '10.0.2.2', '::1'].includes(apiHostname) ||
  /^10\./.test(apiHostname) ||
  /^192\.168\./.test(apiHostname) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(apiHostname) ||
  apiHostname.endsWith('.local');

if (
  environment === 'development' &&
  !isPrivateDevHost &&
  process.env.ALLOW_REMOTE_DEV_API !== 'true'
) {
  throw new Error(
    '[ENV] Development builds require a local/private API_URL. Set ALLOW_REMOTE_DEV_API=true only for a verified remote development backend.'
  );
}

if (environment === 'production' && isPrivateDevHost) {
  throw new Error('[ENV] Production API_URL must not point to localhost or a private LAN host.');
}
const googleMapsApiKey = requireEnv('GOOGLE_MAPS_API_KEY');
const googleWebClientId = requireEnv('GOOGLE_WEB_CLIENT_ID');
const googleIosClientId = process.env.GOOGLE_IOS_CLIENT_ID?.trim() || '';
const googleAndroidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID?.trim() || '';

if (
  !/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(googleWebClientId) ||
  /X{4,}/i.test(googleWebClientId)
) {
  throw new Error('[ENV] GOOGLE_WEB_CLIENT_ID is not a valid Google OAuth Web client ID.');
}

export default {
  expo: {
    name: 'Lost and Found QR',
    slug: 'lost-and-found-qr',
    scheme: 'lostfoundqr',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#08111F',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lostfound.app',
      config: {
        googleMapsApiKey,
      },
    },
    android: {
      package: 'com.lostfound.app',
      permissions: ['android.permission.POST_NOTIFICATIONS'],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#08111F',
      },
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      googleServicesFile: './firebase/android/google-services.json',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: false,
          data: [{ scheme: 'lostfoundqr' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/icon.png',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 220,
          resizeMode: 'contain',
          backgroundColor: '#08111F',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'react-native',
          organization: 'anh-tu-studio',
        },
      ],
      'expo-secure-store',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Cho phép ứng dụng dùng vị trí khi mở để hỗ trợ gặp mặt và bàn giao đồ.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Cho phép ứng dụng truy cập thư viện ảnh để chọn hình ảnh đồ vật.',
          cameraPermission: 'Cho phép ứng dụng truy cập camera để chụp ảnh đồ vật.',
        },
      ],
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: 'Cho phép ứng dụng truy cập camera để quét mã QR.',
        },
      ],
      // The native module is autolinked on Android. Add the Google Sign-In
      // config plugin here only after GOOGLE_IOS_CLIENT_ID is configured.
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      '@react-native-firebase/messaging',
    ],
    extra: {
      apiUrl,
      environment,
      sentryDsn: process.env.SENTRY_DSN || '',
      googleMapsApiKey,
      // Google OAuth Client IDs
      googleWebClientId,
      googleIosClientId,
      googleAndroidClientId,
    },
  },
};
