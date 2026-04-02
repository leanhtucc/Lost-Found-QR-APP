/**
 * Scanner Loading Component
 * Loading state khi khởi tạo camera
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export const ScannerLoading: React.FC = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="absolute inset-0 bg-gray-900 items-center justify-center"
    >
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-white/70 text-base mt-4">Đang khởi động camera...</Text>
    </Animated.View>
  );
};
