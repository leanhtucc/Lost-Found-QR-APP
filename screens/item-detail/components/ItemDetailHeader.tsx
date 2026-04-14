/**
 * Item Detail Header Component
 * Header của màn hình chi tiết item với nút back và delete
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ItemDetailHeaderProps {
  itemId: string;
  onDelete: () => void;
}

export const ItemDetailHeader: React.FC<ItemDetailHeaderProps> = ({ itemId, onDelete }) => {
  const navigation = useNavigation();

  const handleDelete = () => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa món đồ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: onDelete,
      },
    ]);
  };

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
        >
          <ArrowLeft size={20} color={FIND_BACK.neutral} />
        </TouchableOpacity>

        <Text className="font-bold text-gray-900 text-lg">Chi tiết món đồ</Text>

        <TouchableOpacity
          onPress={handleDelete}
          className="w-10 h-10 rounded-full bg-red-50 items-center justify-center active:bg-red-100"
        >
          <Trash2 size={20} color={FIND_BACK.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
