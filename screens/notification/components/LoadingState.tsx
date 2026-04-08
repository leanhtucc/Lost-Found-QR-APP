/**
 * LoadingState Component
 * Trạng thái loading khi đang tải thông báo
 */

import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export const LoadingState: React.FC = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 items-center justify-center py-16"
    >
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-gray-500 mt-4">Đang tải thông báo...</Text>
    </Animated.View>
  );
};
