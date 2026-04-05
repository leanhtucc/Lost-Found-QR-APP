import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { IconLogoApp } from '@components/icons';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';

interface SplashScreenProps {
  /** Gọi khi animation splash kết thúc */
  onFinish: () => void;
}

/**
 * SplashScreen – màn hình đầu tiên khi mở app
 * Thực hiện hiệu ứng phóng to logo thật mượt và mờ dần chậm lại để tạo cảm giác xịn xò.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Reanimated 3 Shared Values
  const logoScale = useSharedValue(1);
  const splashOpacity = useSharedValue(1);

  // Easing mượt mà mô phỏng vật lý tự nhiên
  const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

  useEffect(() => {
    // 1. Phóng to nhẹ logo từ 1 -> 1.25 thật chậm và êm (kéo dài suốt dọc 2500ms)
    logoScale.value = withTiming(1.25, { duration: 2500, easing: customEasing });

    // 2. Giữ nguyên màn hình trong 1200ms để hút mắt, sau đó mờ dần trong 1200ms
    splashOpacity.value = withDelay(
      1200,
      withTiming(0, { duration: 1200, easing: customEasing }, finished => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, [customEasing, logoScale, splashOpacity, onFinish]);

  // Animated styles bám vào UI thread
  const screenAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: splashOpacity.value,
      flex: 1,
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  return (
    <Animated.View style={screenAnimatedStyle}>
      <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0E13" />

        {/* Vùng chính: flex-1 items-center justify-center sẽ căn giữa mọi thứ và giới hạn chiều rộng */}
        <ResponsiveContainer className="flex-1 items-center justify-center gap-5" variant="form">
          <Animated.View
            className="w-24 h-24 items-center justify-center mb-1"
            style={logoAnimatedStyle}
          >
            <IconLogoApp width={188} height={188} />
          </Animated.View>

          <View className="items-center">
            <Text className="text-[#F9F5FD] text-4xl font-bold tracking-tight mb-2">FindBack</Text>
            <Text className="text-[#ACAAB1] text-[11px] font-medium tracking-[2.5px]">
              FIND IT. RETURN IT. REWARDED.
            </Text>
          </View>
        </ResponsiveContainer>

        {/* Thanh loading mờ được gỡ bỏ để giữ sự tối giản và theo đúng yêu cầu Splash mới */}
      </SafeAreaView>
    </Animated.View>
  );
};

export default SplashScreen;
