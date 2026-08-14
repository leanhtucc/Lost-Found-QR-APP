/**
 * Loading Chat Component
 * Loading state cho chat list
 */

import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FIND_BACK } from '@constants/theme';

export const LoadingChat: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-fb-neutral">
      <ActivityIndicator size="large" color={FIND_BACK.primary} />
      <Text className="mt-4 text-sm text-fb-muted">Đang tải tin nhắn...</Text>
    </SafeAreaView>
  );
};
