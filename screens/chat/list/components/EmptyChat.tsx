/**
 * Empty Chat Component
 * Hiển thị khi chưa có cuộc hội thoại nào
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

export const EmptyChat: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
        <MessageCircle size={48} color="#9ca3af" />
      </View>

      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">Chưa có tin nhắn</Text>

      <Text className="text-base text-gray-500 text-center leading-6">
        Khi bạn quét mã QR của món đồ, cuộc hội thoại với chủ sở hữu sẽ được tạo tự động
      </Text>
    </View>
  );
};
