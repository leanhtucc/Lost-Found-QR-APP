/**
 * Empty Chat Component
 * Hiển thị khi chưa có cuộc hội thoại nào
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

export const EmptyChat: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-5 h-24 w-24 items-center justify-center rounded-3xl border border-fb-primary/20 bg-fb-primary/10">
        <MessageCircle size={42} color={FIND_BACK.primaryLight} />
      </View>

      <Text className="mb-2 text-center text-xl font-bold text-fb-content">Chưa có tin nhắn</Text>

      <Text className="text-center text-base leading-6 text-fb-muted">
        Khi một mã QR được quét, cuộc trò chuyện an toàn với chủ sở hữu sẽ xuất hiện tại đây.
      </Text>
    </View>
  );
};
