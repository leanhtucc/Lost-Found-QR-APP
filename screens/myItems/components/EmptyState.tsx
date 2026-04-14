import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package, Filter, Plus } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface EmptyStateProps {
  type: 'no-items' | 'no-results';
  onAddClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAddClick }) => {
  if (type === 'no-results') {
    return (
      <View className="items-center py-16">
        <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
          <Filter size={40} color={FIND_BACK.labelText} />
        </View>
        <Text className="text-base font-semibold text-gray-500 mb-1">Không tìm thấy kết quả</Text>
        <Text className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa</Text>
      </View>
    );
  }

  return (
    <View className="items-center py-16">
      <View className="w-20 h-20 rounded-full bg-blue-100 justify-center items-center mb-4">
        <Package size={40} color={FIND_BACK.primary} />
      </View>
      <Text className="text-base font-semibold text-gray-900 mb-1">Chưa có món đồ nào</Text>
      <Text className="text-sm text-gray-500 mb-4">Hãy thêm món đồ đầu tiên để bảo vệ tài sản</Text>
      <TouchableOpacity
        onPress={onAddClick}
        className="bg-blue-500 px-6 py-3 rounded-xl flex-row items-center"
      >
        <Plus size={16} color={FIND_BACK.bodyText} />
        <Text className="text-sm font-semibold text-white ml-2">Thêm món đồ</Text>
      </TouchableOpacity>
    </View>
  );
};
