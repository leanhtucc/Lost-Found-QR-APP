/**
 * Scanner Overlay Component
 * Overlay với khung quét animated theo vị trí QR code thực tế.
 * Khung tím di chuyển mượt mà theo QR, quay về giữa khi mất QR.
 */

import React, { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIND_BACK } from '@constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  interpolate,
} from 'react-native-reanimated';
import type { QRBounds } from '../utils/mapCodeBoundsToPreview';
import type { ScannerStatus } from '../hooks/useScanProcessor';

// ─── Spring config: responsive but not bouncy ───────────────────────────────────

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 220,
  mass: 0.6,
};

// ─── Props ──────────────────────────────────────────────────────────────────────

interface ScannerOverlayProps {
  status: ScannerStatus;
  qrBounds: QRBounds | null;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ status, qrBounds }) => {
  const { width, height } = useWindowDimensions();
  const defaultSize = Math.min(width * 0.78, 320);
  const defaultX = (width - defaultSize) / 2;
  const defaultY = (height - defaultSize) / 2 - 36; // offset up like original

  // ── Animated shared values ────────────────────────────────────
  const frameX = useSharedValue(defaultX);
  const frameY = useSharedValue(defaultY);
  const frameW = useSharedValue(defaultSize);
  const frameH = useSharedValue(defaultSize);
  const pulseScale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.6);
  const scanLinePosition = useSharedValue(0.1);
  const prevHadBounds = useRef(false);

  // ── Update frame position when QR bounds change ───────────────
  useEffect(() => {
    if (qrBounds) {
      // Add padding around detected QR
      const padding = 24;
      const targetX = qrBounds.x - padding;
      const targetY = qrBounds.y - padding;
      const targetW = qrBounds.width + padding * 2;
      const targetH = qrBounds.height + padding * 2;

      frameX.value = withSpring(targetX, SPRING_CONFIG);
      frameY.value = withSpring(targetY, SPRING_CONFIG);
      frameW.value = withSpring(targetW, SPRING_CONFIG);
      frameH.value = withSpring(targetH, SPRING_CONFIG);

      // Pulse effect only on first detection (not every callback)
      if (!prevHadBounds.current) {
        prevHadBounds.current = true;
        pulseScale.value = withSequence(
          withTiming(1.06, { duration: 150 }),
          withTiming(1, { duration: 200 })
        );
        borderOpacity.value = withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0.8, { duration: 300 })
        );
      }
    } else {
      // Return to default center
      prevHadBounds.current = false;
      frameX.value = withSpring(defaultX, SPRING_CONFIG);
      frameY.value = withSpring(defaultY, SPRING_CONFIG);
      frameW.value = withSpring(defaultSize, SPRING_CONFIG);
      frameH.value = withSpring(defaultSize, SPRING_CONFIG);
      borderOpacity.value = withTiming(0.6, { duration: 300 });
    }
  }, [
    qrBounds,
    defaultX,
    defaultY,
    defaultSize,
    frameX,
    frameY,
    frameW,
    frameH,
    pulseScale,
    borderOpacity,
  ]);

  // ── Scanning line animation ───────────────────────────────────
  useEffect(() => {
    const shouldAnimate = status === 'idle' || status === 'tracking';
    if (shouldAnimate) {
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
      // Pause/reset scanning line during processing
      scanLinePosition.value = withTiming(0.1, { duration: 200 });
    }
  }, [status, scanLinePosition]);

  // ── Animated styles ───────────────────────────────────────────

  const frameStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: frameX.value,
    top: frameY.value,
    width: frameW.value,
    height: frameH.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePosition.value * frameH.value }],
    opacity: interpolate(scanLinePosition.value, [0.1, 0.5, 0.9], [0.6, 1, 0.6]),
  }));

  const showScanLine = status === 'idle' || status === 'tracking';

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {/* Dark Overlay — we use a simple semi-transparent bg instead of cutout */}
      <View className="absolute inset-0 bg-black/60" />

      {/* Animated Scanner Frame */}
      <Animated.View entering={FadeIn.duration(400)} style={frameStyle}>
        {/* Semi-transparent border */}
        <Animated.View
          style={borderStyle}
          className="absolute inset-0 border border-white/15 rounded-3xl"
        />

        {/* Corner Frames — Clean Design */}
        {/* Top Left */}
        <View className="absolute left-4 top-4 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-fb-primary-light" />
        {/* Top Right */}
        <View className="absolute right-4 top-4 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-fb-primary-light" />
        {/* Bottom Left */}
        <View className="absolute bottom-4 left-4 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-fb-primary-light" />
        {/* Bottom Right */}
        <View className="absolute bottom-4 right-4 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-fb-primary-light" />

        {/* Scanning Line — relative to frame size */}
        {showScanLine && (
          <Animated.View
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
  );
};
