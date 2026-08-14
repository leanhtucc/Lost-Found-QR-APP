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
    <View className="border-b border-fb-border-subtle bg-fb-surface px-4 py-3">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="h-11 w-11 items-center justify-center rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated"
        >
          <ArrowLeft size={20} color={FIND_BACK.bodyText} />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-bold text-fb-content">Chi tiết món đồ</Text>
          <Text className="mt-0.5 max-w-[170px] text-[10px] text-fb-label" numberOfLines={1}>
            {itemId}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Xóa món đồ"
          className="h-11 w-11 items-center justify-center rounded-2xl border border-fb-danger/20 bg-fb-danger/10"
        >
          <Trash2 size={20} color={FIND_BACK.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
