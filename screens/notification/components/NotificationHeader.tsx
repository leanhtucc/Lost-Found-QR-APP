/**
 * NotificationHeader Component
 * Header của màn hình thông báo với nút back và mark all as read
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  onMarkAllRead,
}) => {
  const navigation = useNavigation();

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
          >
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="font-bold text-gray-900 text-lg">Thông báo</Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-gray-500">{unreadCount} thông báo chưa đọc</Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={onMarkAllRead}
            className="flex-row items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg active:bg-blue-100"
          >
            <Check size={16} color="#3b82f6" />
            <Text className="text-sm text-blue-600 font-semibold">Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
