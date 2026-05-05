import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  useFonts,
} from '@expo-google-fonts/be-vietnam-pro';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootStack from './navigation';
import { AuthProvider } from '@contexts/AuthContext';
import { ToastProvider } from '@contexts/ToastContext';
import { ItemsProvider } from '@/contexts';
import { logo } from '@assets';

const CUSTOM_SPLASH_DURATION_MS = 2000;
const CUSTOM_SPLASH_FADE_MS = 240;

interface CustomSplashScreenProps {
  opacity: Animated.Value;
  versionLabel: string;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ opacity, versionLabel }) => {
  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <StatusBar style="light" />

      <View style={styles.overlayBackground}>
        <View style={styles.brandWrapper}>
          <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
        </View>

        <Text style={styles.version}>{versionLabel}</Text>
      </View>
    </Animated.View>
  );
};

const AppRoot: React.FC = () => {
  const [fontsLoaded, fontError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const hasHiddenNativeSplash = useRef(false);

  const isFontReady = fontsLoaded || Boolean(fontError);
  const versionLabel = useMemo(() => {
    const version = Constants.expoConfig?.version ?? '1.0.0';
    return `v${version}`;
  }, []);

  useEffect(() => {
    if (!isFontReady || hasHiddenNativeSplash.current) {
      return;
    }

    hasHiddenNativeSplash.current = true;
    SplashScreen.hideAsync().catch(() => {
      // Ignore if native splash is already hidden.
    });
  }, [isFontReady]);

  useEffect(() => {
    if (!isFontReady || !showCustomSplash) {
      return;
    }

    const holdTimer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: CUSTOM_SPLASH_FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShowCustomSplash(false);
        }
      });
    }, CUSTOM_SPLASH_DURATION_MS);

    return () => {
      clearTimeout(holdTimer);
      splashOpacity.stopAnimation();
    };
  }, [isFontReady, showCustomSplash, splashOpacity]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <ToastProvider>
              <ItemsProvider>
                <RootStack />
                {showCustomSplash ? (
                  <CustomSplashScreen opacity={splashOpacity} versionLabel={versionLabel} />
                ) : null}
                <StatusBar style="light" />
              </ItemsProvider>
            </ToastProvider>
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  brandWrapper: {
    alignItems: 'center',
    gap: 16,
  },
  brandLogo: {
    width: 220,
    height: 220,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E6EE',
    letterSpacing: 0.6,
    fontFamily: 'BeVietnamPro_500Medium',
  },
  version: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    color: '#8B8DA0',
    fontFamily: 'BeVietnamPro_400Regular',
  },
});

export default AppRoot;
