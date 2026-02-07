/**
 * Loading Chat Component
 * Loading state cho chat list
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoadingChat: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-gray-500 mt-4">Đang tải tin nhắn...</Text>
    </SafeAreaView>
  );
};
