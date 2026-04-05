export default {
  expo: {
    name: 'LostAndFoundQR',
    slug: 'lost-and-found-qr',
    scheme: 'lostfoundqr',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anhtu081204.lostandfoundqr',
    },
    android: {
      package: 'com.anhtu081204.lostandfoundqr',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },
      googleServicesFile:
        process.env.ENV === 'production'
          ? './firebase/android/google-services.json'
          : './firebase/android/google-services.json',
    },
    web: {
      favicon: './assets/icon.png',
    },
    plugins: [
      'expo-secure-store',
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
      // Google OAuth Client IDs
      googleWebClientId:
        process.env.GOOGLE_WEB_CLIENT_ID ||
        '573454777935-u0sp5nj8ks2u7r6nocgk4pjd87qc4l5e.apps.googleusercontent.com',
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
    },
  },
};
