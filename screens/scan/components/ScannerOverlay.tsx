/**
 * Scanner Overlay Component
 * Overlay với khung quét và animation scanning line
 */

import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIND_BACK } from '@constants/theme';
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

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isScanning, hasCodeInFrame }) => {
  const { width } = useWindowDimensions();
  const scannerSize = Math.min(width * 0.78, 320);
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
  }, [isScanning, hasCodeInFrame, scanLinePosition]);

  const scanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scanLinePosition.value * scannerSize,
        },
      ],
      opacity: interpolate(scanLinePosition.value, [0.1, 0.5, 0.9], [0.6, 1, 0.6]),
    };
  }, [scannerSize]);

  return (
    <View className="absolute inset-0">
      {/* Dark Overlay */}
      <View className="absolute inset-0 bg-black/80" />

      {/* Scanner Frame Container - Centered */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateY: -36 }],
        }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            width: scannerSize,
            height: scannerSize,
            position: 'relative',
          }}
        >
          {/* Semi-transparent border */}
          <View className="absolute inset-0 border border-white/15 rounded-3xl" />

          {/* Corner Frames - Clean Design with Tailwind */}
          {/* Top Left */}
          <View className="absolute left-4 top-4 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-fb-primary-light" />
          {/* Top Right */}
          <View className="absolute right-4 top-4 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-fb-primary-light" />
          {/* Bottom Left */}
          <View className="absolute bottom-4 left-4 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-fb-primary-light" />
          {/* Bottom Right */}
          <View className="absolute bottom-4 right-4 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-fb-primary-light" />

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
                  'rgba(124, 106, 246, 0)',
                  'rgba(124, 106, 246, 0.4)',
                  'rgba(124, 106, 246, 1)',
                  'rgba(124, 106, 246, 0.4)',
                  'rgba(124, 106, 246, 0)',
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
                  backgroundColor: FIND_BACK.primary,
                  opacity: 0.4,
                  shadowColor: FIND_BACK.primary,
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
