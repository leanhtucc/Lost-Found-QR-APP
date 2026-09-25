/* eslint-disable no-undef */
// Jest Setup for LostAndFoundQR (React Native + Expo)

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'LostAndFoundQR',
    slug: 'lost-and-found-qr',
    version: '1.0.0',
    extra: {
      apiUrl: 'https://test-api.example.com',
      environment: 'test',
      googleMapsApiKey: 'mock-google-maps-key',
      googleWebClientId: '123456789-mock.apps.googleusercontent.com',
      telegramBotToken: 'mock-bot-token',
      telegramChatId: '-100mockchat',
      telegramTestOnLaunch: false,
    },
  },
}));

// Mock Expo SecureStore
const mockSecureStore = new Map();
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async (key, value) => {
    mockSecureStore.set(key, String(value));
  }),
  getItemAsync: jest.fn(async key => mockSecureStore.get(key) || null),
  deleteItemAsync: jest.fn(async key => {
    mockSecureStore.delete(key);
  }),
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: component => component,
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  mobileReplayIntegration: jest.fn(),
  feedbackIntegration: jest.fn(),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
    }));
    return React.createElement(View, { testID: 'mock-mapview', ...props }, props.children);
  });

  const MockMarker = props => {
    return React.createElement(View, { testID: 'mock-marker', ...props }, props.children);
  };

  const MockPolyline = props => {
    return React.createElement(View, { testID: 'mock-polyline', ...props });
  };

  const MockCircle = props => {
    return React.createElement(View, { testID: 'mock-circle', ...props });
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    Circle: MockCircle,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    canAskAgain: true,
  })),
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 10.7769, longitude: 106.7009, accuracy: 5 },
    timestamp: Date.now(),
  })),
  reverseGeocodeAsync: jest.fn(async () => [
    { street: 'Lê Lợi', district: 'Quận 1', city: 'TP.HCM' },
  ]),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    SafeAreaView: ({ children, ...props }) => {
      const React = require('react');
      const { View } = require('react-native');
      return React.createElement(View, props, children);
    },
  };
});

// Mock React Native Reanimated
try {
  require('react-native-reanimated').setUpTests();
} catch {
  // Reanimated might not have setUpTests in some versions
}

// Silence noisy console warnings during test runs
global.console = {
  ...console,
  warn: jest.fn(),
};
