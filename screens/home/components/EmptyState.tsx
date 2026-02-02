/**
 * EmptyState Component
 * Hiển thị khi không có item hoặc không tìm thấy kết quả
 */

import React from 'react';
import { View, Text } from 'react-native';
import { QrCode, Search } from 'lucide-react-native';

interface EmptyStateProps {
  type: 'no-items' | 'no-results';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const isNoItems = type === 'no-items';
  const Icon = isNoItems ? QrCode : Search;

  return (
    <View className="items-center py-12">
      {/* Icon container */}
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Icon size={40} color="#9ca3af" />
      </View>

      {/* Text content */}
      <Text className="text-gray-500 font-medium text-center">
        {isNoItems ? 'Chưa có món đồ nào' : 'Không tìm thấy kết quả'}
      </Text>

      <Text className="text-sm text-gray-400 mt-1 text-center">
        {isNoItems ? 'Nhấn nút + để thêm món đồ mới' : 'Thử tìm kiếm với từ khóa khác'}
      </Text>
    </View>
  );
};

export default EmptyState;
