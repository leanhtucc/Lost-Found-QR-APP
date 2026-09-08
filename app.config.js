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
    name: 'LostAndFoundQR',
    slug: 'lost-and-found-qr',
    scheme: 'lostfoundqr',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logoApp.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/logoApp.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
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
      adaptiveIcon: {
        foregroundImage: './assets/logoApp.png',
        backgroundColor: '#000000',
      },
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      googleServicesFile: './firebase/android/google-services.json',
    },
    web: {
      favicon: './assets/logoApp.png',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/logoApp.png',
          imageWidth: 220,
          resizeMode: 'contain',
          backgroundColor: '#000000',
        },
      ],
      'expo-secure-store',
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
