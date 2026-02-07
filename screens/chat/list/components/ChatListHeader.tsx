/**
 * Chat List Header Component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface ChatListHeaderProps {
  onBack: () => void;
  unreadCount: number;
}

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({ onBack, unreadCount }) => {
  return (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>

          <View>
            <Text className="text-xl font-bold text-gray-900">Tin nhắn</Text>
            {unreadCount > 0 && (
              <Text className="text-xs text-blue-600">{unreadCount} tin chưa đọc</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
