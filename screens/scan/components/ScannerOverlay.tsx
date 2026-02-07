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
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
} from 'react-native-reanimated';

interface ScannerOverlayProps {
  isScanning: boolean;
  hasCodeInFrame: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCANNER_SIZE = Math.min(SCREEN_WIDTH * 0.75, 300); // 75% width hoặc max 300

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isScanning, hasCodeInFrame }) => {
  const scanLinePosition = useSharedValue(0);
  const cornerPulse = useSharedValue(0);

  useEffect(() => {
    if (isScanning && hasCodeInFrame) {
      // Scanning line animation - only when code is detected
      scanLinePosition.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
        -1,
        true
      );
    } else {
      scanLinePosition.value = withTiming(0, { duration: 200 });
    }

    if (isScanning) {
      // Corner pulse animation
      cornerPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      cornerPulse.value = withTiming(0);
    }
  }, [isScanning, hasCodeInFrame]);

  const scanLineStyle = useAnimatedStyle(() => {
    const scannerHeight = SCANNER_SIZE - 40; // Subtract padding
    return {
      transform: [
        {
          translateY: scanLinePosition.value * scannerHeight,
        },
      ],
      opacity: interpolate(scanLinePosition.value, [0, 0.5, 1], [0.4, 1, 0.4]),
    };
  });

  const cornerPulseStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(cornerPulse.value, [0, 1], [0.8, 1]),
      transform: [
        {
          scale: interpolate(cornerPulse.value, [0, 1], [1, 1.05]),
        },
      ],
    };
  });

  return (
    <View className="absolute inset-0 items-center justify-center">
      {/* Dark Overlay */}
      <View className="absolute inset-0 bg-black/80" />

      {/* Scanner Frame Container - Centered */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          width: SCANNER_SIZE,
          height: SCANNER_SIZE,
          position: 'relative',
        }}
      >
        {/* Semi-transparent border */}
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 24,
          }}
        />

        {/* Corner Indicators with Pulse */}
        {isScanning ? (
          <>
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 60,
                  height: 60,
                  borderTopWidth: 5,
                  borderLeftWidth: 5,
                  borderColor: '#3b82f6',
                  borderTopLeftRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 60,
                  height: 60,
                  borderTopWidth: 5,
                  borderRightWidth: 5,
                  borderColor: '#3b82f6',
                  borderTopRightRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 60,
                  height: 60,
                  borderBottomWidth: 5,
                  borderLeftWidth: 5,
                  borderColor: '#3b82f6',
                  borderBottomLeftRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 60,
                  height: 60,
                  borderBottomWidth: 5,
                  borderRightWidth: 5,
                  borderColor: '#3b82f6',
                  borderBottomRightRadius: 20,
                },
              ]}
            />
          </>
        ) : (
          <>
            {/* Static corners when not scanning */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 60,
                height: 60,
                borderTopWidth: 5,
                borderLeftWidth: 5,
                borderColor: '#6b7280',
                borderTopLeftRadius: 20,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 60,
                height: 60,
                borderTopWidth: 5,
                borderRightWidth: 5,
                borderColor: '#6b7280',
                borderTopRightRadius: 20,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 60,
                height: 60,
                borderBottomWidth: 5,
                borderLeftWidth: 5,
                borderColor: '#6b7280',
                borderBottomLeftRadius: 20,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 60,
                height: 60,
                borderBottomWidth: 5,
                borderRightWidth: 5,
                borderColor: '#6b7280',
                borderBottomRightRadius: 20,
              }}
            />
          </>
        )}

        {/* Scanning Line with Gradient - Only show when QR code is detected */}
        {isScanning && hasCodeInFrame && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[
              scanLineStyle,
              {
                position: 'absolute',
                left: 20,
                right: 20,
                height: 4,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(59, 130, 246, 0)',
                'rgba(59, 130, 246, 0.6)',
                'rgba(59, 130, 246, 1)',
                'rgba(59, 130, 246, 0.6)',
                'rgba(59, 130, 246, 0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: '100%',
                borderRadius: 2,
              }}
            />
            {/* Glow effect */}
            <View
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#3b82f6',
                opacity: 0.5,
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 20,
                elevation: 12,
              }}
            />
          </Animated.View>
        )}

        {/* Corner Glow effects when scanning */}
        {isScanning && (
          <>
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  width: 76,
                  height: 76,
                  borderTopLeftRadius: 28,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 76,
                  height: 76,
                  borderTopRightRadius: 28,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  bottom: -8,
                  left: -8,
                  width: 76,
                  height: 76,
                  borderBottomLeftRadius: 28,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                cornerPulseStyle,
                {
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  width: 76,
                  height: 76,
                  borderBottomRightRadius: 28,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                },
              ]}
            />
          </>
        )}
      </Animated.View>
    </View>
  );
};
