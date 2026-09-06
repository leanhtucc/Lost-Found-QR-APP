require('dotenv').config({ path: process.env.ENVFILE || '.env' });

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

if (!googleMapsApiKey) {
  throw new Error('[ENV] Missing GOOGLE_MAPS_API_KEY. Add it to .env before building the app.');
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
      googleServicesFile:
        process.env.ENV === 'production'
          ? './firebase/android/google-services.json'
          : './firebase/android/google-services.json',
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
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.573454777935-0dqcumi7da5h5425d67cv6p4r2l7m7vu',
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
    ],
    extra: {
      apiUrl: process.env.API_URL || 'https://backend-api-8rw9.onrender.com',
      environment: process.env.ENV || 'development',
      sentryDsn: process.env.SENTRY_DSN || '',
      googleMapsApiKey,
      // Google OAuth Client IDs
      googleWebClientId:
        process.env.GOOGLE_WEB_CLIENT_ID ||
        '573454777935-u0sp5nj8ks2u7r6nocgk4pjd87qc4l5e.apps.googleusercontent.com',
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
    },
  },
};
