import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface MyItemsHeaderProps {
  totalItems: number;
  onAddClick: () => void;
}

export const MyItemsHeader: React.FC<MyItemsHeaderProps> = ({ totalItems, onAddClick }) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
      <View>
        <Text className="text-xl font-bold text-gray-900">Đồ của tôi</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{totalItems} món đồ đã đăng ký</Text>
      </View>
      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-blue-500 justify-center items-center"
        onPress={onAddClick}
      >
        <Plus size={24} color={FIND_BACK.bodyText} />
      </TouchableOpacity>
    </View>
  );
};
