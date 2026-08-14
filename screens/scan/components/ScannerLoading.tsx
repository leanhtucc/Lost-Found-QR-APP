/**
 * Scanner Loading Component
 * Loading state khi khởi tạo camera
 */

import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FIND_BACK } from '@constants/theme';

export const ScannerLoading: React.FC = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="absolute inset-0 items-center justify-center bg-fb-neutral"
    >
      <ActivityIndicator size="large" color={FIND_BACK.primary} />
      <Text className="mt-4 text-base text-fb-muted">Đang khởi động camera...</Text>
    </Animated.View>
  );
};
