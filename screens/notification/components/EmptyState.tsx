/**
 * EmptyState Component
 * Trạng thái khi không có thông báo
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';

export const EmptyState: React.FC = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-1 items-center justify-center px-6 py-16"
    >
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Bell size={40} color="#9ca3af" />
      </View>
      <Text className="text-gray-900 font-semibold text-base mb-1">Không có thông báo</Text>
      <Text className="text-sm text-gray-500 text-center">
        Bạn sẽ nhận được thông báo khi có người quét mã QR
      </Text>
    </Animated.View>
  );
};
