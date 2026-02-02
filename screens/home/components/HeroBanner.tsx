/**
 * HeroBanner Component
 * Banner hiển thị tổng quan trạng thái tài sản
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Shield, QrCode } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface HeroBannerProps {
  safeCount: number;
  lostCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ safeCount, lostCount }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      className="relative overflow-hidden rounded-3xl bg-blue-600 p-6 mb-6"
    >
      {/* Gradient overlay effect */}
      <View className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />

      {/* Content */}
      <View className="relative z-10">
        <View className="flex-row items-center gap-2 mb-2">
          <Shield size={20} color="rgba(255,255,255,0.8)" />
          <Text className="text-white/80 text-sm font-medium">Bảo vệ tài sản</Text>
        </View>

        <Text className="text-white text-xl font-bold mb-1">{safeCount} món đồ an toàn</Text>

        <Text className="text-white/70 text-sm">
          {lostCount > 0 ? `${lostCount} món đồ đang bị mất` : 'Tất cả tài sản đều an toàn!'}
        </Text>
      </View>

      {/* Decorative QR icon */}
      <View className="absolute -right-6 -bottom-6 opacity-20">
        <QrCode size={128} color="white" />
      </View>
    </Animated.View>
  );
};

export default HeroBanner;
