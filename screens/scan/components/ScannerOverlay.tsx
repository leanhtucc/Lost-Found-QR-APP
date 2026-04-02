/**
 * Scanner Overlay Component
 * Overlay với khung quét và animation scanning line
 */

import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
} from 'react-native-reanimated';

interface ScannerOverlayProps {
  isScanning: boolean;
  hasCodeInFrame: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = Math.min(SCREEN_WIDTH * 0.8, 320);

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isScanning, hasCodeInFrame }) => {
  const scanLinePosition = useSharedValue(0.1);

  useEffect(() => {
    if (isScanning && hasCodeInFrame) {
      // Scanning line animation from 10% to 90%
      scanLinePosition.value = 0.1;
      scanLinePosition.value = withRepeat(
        withTiming(0.9, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        true
      );
    } else {
      scanLinePosition.value = withTiming(0.1, { duration: 200 });
    }
  }, [isScanning, hasCodeInFrame]);

  const scanLineStyle = useAnimatedStyle(() => {
    const scannerHeight = SCANNER_SIZE;
    return {
      transform: [
        {
          translateY: scanLinePosition.value * scannerHeight,
        },
      ],
      opacity: interpolate(scanLinePosition.value, [0.1, 0.5, 0.9], [0.6, 1, 0.6]),
    };
  });

  return (
    <View style={{ position: 'absolute', top: -150, left: 0, right: 0, bottom: 0 }}>
      {/* Dark Overlay */}
      <View className="absolute inset-0 bg-black/80" />

      {/* Scanner Frame Container - Centered */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            width: SCANNER_SIZE,
            height: SCANNER_SIZE,
            position: 'relative',
          }}
        >
          {/* Semi-transparent border */}
          <View className="absolute inset-0 border border-white/15 rounded-3xl" />

          {/* Corner Frames - Clean Design with Tailwind */}
          {/* Top Left */}
          <View className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
          {/* Top Right */}
          <View className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
          {/* Bottom Left */}
          <View className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
          {/* Bottom Right */}
          <View className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />

          {/* Scanning Line - Only show when QR code is detected */}
          {isScanning && hasCodeInFrame && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={[
                scanLineStyle,
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(59, 130, 246, 0)',
                  'rgba(59, 130, 246, 0.4)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(59, 130, 246, 0.4)',
                  'rgba(59, 130, 246, 0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full rounded-sm"
              />
              {/* Glow effect */}
              <View
                style={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  top: -4,
                  bottom: -4,
                  backgroundColor: '#3b82f6',
                  opacity: 0.4,
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                  elevation: 10,
                  borderRadius: 10,
                }}
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};
