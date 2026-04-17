import { registerRootComponent } from 'expo';
import * as ExpoSplashScreen from 'expo-splash-screen';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash is already controlled by native runtime.
});

// Use require to ensure preventAutoHideAsync runs before App module evaluation.

const { default: App } = require('./App');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
