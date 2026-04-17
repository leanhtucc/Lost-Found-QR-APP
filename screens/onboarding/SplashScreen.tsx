import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { IconLogoApp } from '@components/icons';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { FIND_BACK, THEME } from '@constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PARTICLE_COLORS = [
  THEME.primary[300],
  FIND_BACK.primaryDark,
  THEME.primary[200],
  THEME.primary[700],
];

// ─── Design Spell: Particle Burst ────────────────────────────────────────────
// Mỗi hạt là một chấm nhỏ bay ra từ logo theo hướng ngẫu nhiên
interface ParticleProps {
  delay: number;
  angle: number; // radian
  distance: number;
  size: number;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ delay, angle, distance, size, color }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const x = Math.cos(angle) * distance * p;
    const y = Math.sin(angle) * distance * p;
    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      transform: [{ translateX: x }, { translateY: y }],
      opacity: interpolate(p, [0, 0.3, 1], [0, 1, 0]),
    };
  });

  return <Animated.View style={style} />;
};

// ─── Design Spell: Shimmer Bar ────────────────────────────────────────────────
const ShimmerBar: React.FC<{ delay: number }> = ({ delay }) => {
  const x = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    x.value = withDelay(
      delay,
      withSequence(
        withTiming(SCREEN_WIDTH, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(SCREEN_WIDTH * 2, { duration: 0 })
      )
    );
  }, [delay, x]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: SCREEN_WIDTH * 0.4,
        },
      ]}
      className="bg-white/5"
    />
  );
};

// ─── Particle Config ──────────────────────────────────────────────────────────
const PARTICLES: ParticleProps[] = Array.from({ length: 14 }, (_, i) => ({
  delay: 400 + i * 30,
  angle: (i / 14) * Math.PI * 2,
  distance: 55 + (i % 3) * 18,
  size: i % 3 === 0 ? 5 : i % 3 === 1 ? 3.5 : 2.5,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
}));

// ─── Main SplashScreen ────────────────────────────────────────────────────────
/**
 * SplashScreen – màn hình chờ tích hợp `expo-splash-screen`
 *
 * Luồng:
 * 1. Native splash (app.config.js) hiển thị ngay lập tức khi mở app
 * 2. App.tsx gọi `SplashScreen.preventAutoHideAsync()` để giữ native splash
 * 3. Khi App.tsx sẵn sàng, gọi `SplashScreen.hideAsync()` → native splash ẩn
 * 4. Component này render với animation: logo scale + particle burst + shimmer
 * 5. Sau khi animation xong, gọi `onFinish` để chuyển sang màn hình chính
 */
interface SplashScreenProps {
  /** Gọi khi animation splash kết thúc */
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // ── Shared values ──────────────────────────────────
  const screenOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  const exitOpacity = useSharedValue(1);
  const hasHiddenNativeSplash = useRef(false);

  const hideNativeSplashOnLayout = useCallback(() => {
    if (hasHiddenNativeSplash.current) {
      return;
    }

    hasHiddenNativeSplash.current = true;
    ExpoSplashScreen.hideAsync().catch(() => {
      // Native splash có thể đã ẩn trước đó
    });
  }, []);

  useEffect(() => {
    const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // Expo ease-out mượt mà

    // Bước 2 → Logo spring vào (delay nhỏ để tránh flash)
    logoOpacity.value = withDelay(80, withTiming(1, { duration: 300 }));
    logoScale.value = withDelay(80, withSpring(1, { damping: 12, stiffness: 120, mass: 0.8 }));

    // Bước 3 → Text trượt lên nhẹ nhàng
    textOpacity.value = withDelay(380, withTiming(1, { duration: 400, easing: easeOut }));
    textY.value = withDelay(380, withTiming(0, { duration: 500, easing: easeOut }));

    // Bước 4 → Giữ 1400ms rồi fade out toàn màn hình → onFinish
    exitOpacity.value = withDelay(
      1700,
      withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) }, finished => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, [exitOpacity, logoOpacity, logoScale, onFinish, textOpacity, textY]);

  // ── Animated styles ─────────────────────────────────
  const screenStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value * exitOpacity.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textY.value }],
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View style={screenStyle}>
      <SafeAreaView
        onLayout={hideNativeSplashOnLayout}
        className="flex-1"
        style={{ backgroundColor: FIND_BACK.canvas }}
        edges={['top', 'bottom']}
      >
        <StatusBar style="light" />

        <ResponsiveContainer className="flex-1 items-center justify-center gap-5" variant="form">
          {/* Logo + Particle Burst */}
          <View className="items-center justify-center">
            {/* Các hạt particle bay ra từ logo */}
            <View style={{ position: 'absolute', width: 0, height: 0 }}>
              {PARTICLES.map((p, i) => (
                <Particle key={i} {...p} />
              ))}
            </View>

            {/* Logo chính với spring animation */}
            <Animated.View
              className="w-24 h-24 items-center justify-center mb-1"
              style={logoContainerStyle}
            >
              <IconLogoApp width={188} height={188} />
            </Animated.View>
          </View>

          {/* Text block trượt lên */}
          <Animated.View className="items-center" style={textStyle}>
            <Text className="text-fb-content text-4xl font-bold tracking-tight mb-2">FindBack</Text>
            <Text className="text-fb-muted text-[11px] font-medium tracking-[2.5px]">
              FIND IT. RETURN IT. REWARDED.
            </Text>
          </Animated.View>

          {/* Design Spell: Shimmer sweep qua màn hình */}
          <ShimmerBar delay={500} />
          <ShimmerBar delay={700} />
        </ResponsiveContainer>
      </SafeAreaView>
    </Animated.View>
  );
};

export default SplashScreen;
