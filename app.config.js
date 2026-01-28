export default {
  expo: {
    name: 'LostAndFoundQR',
    slug: 'lost-and-found-qr',
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
    },
    android: {
      package: 'com.anhtu081204.lostandfoundqr',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/icon.png',
    },
    plugins: ['expo-secure-store'],
    extra: {
      apiUrl: process.env.API_URL || 'https://backend-api-8rw9.onrender.com',
    },
  },
};
