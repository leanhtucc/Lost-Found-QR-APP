/**
 * Item Info Card Component
 * Card hiển thị thông tin cơ bản của item
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Item } from '@/types/item';
import { getCategoryIcon } from '@/constants/categories';
import { FIND_BACK } from '@constants/theme';

interface ItemInfoCardProps {
  item: Item;
}

export const ItemInfoCard: React.FC<ItemInfoCardProps> = ({ item }) => {
  const CategoryIcon = getCategoryIcon(item.category);

  const statusVisual = (() => {
    switch (item.status) {
      case 'LOST':
        return {
          badgeClass: 'bg-red-100',
          textClass: 'text-red-600',
          label: 'ĐANG MẤT',
        };
      case 'PENDING_PAYMENT':
        return {
          badgeClass: 'bg-amber-100',
          textClass: 'text-amber-700',
          label: 'CHỜ THANH TOÁN',
        };
      case 'FOUND':
        return {
          badgeClass: 'bg-orange-100',
          textClass: 'text-orange-700',
          label: 'ĐÃ TÌM THẤY',
        };
      case 'RESOLVED':
        return {
          badgeClass: 'bg-blue-100',
          textClass: 'text-blue-700',
          label: 'ĐÃ HOÀN TRẢ',
        };
      case 'SAFE':
      default:
        return {
          badgeClass: 'bg-green-100',
          textClass: 'text-green-600',
          label: 'AN TOÀN',
        };
    }
  })();

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
    >
      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center">
          <CategoryIcon size={32} color={FIND_BACK.primary} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 mb-1">{item.name}</Text>
          <Text className="text-sm text-gray-500">ID: {item.id}</Text>
        </View>

        {/* Status Badge */}
        <View className={`px-4 py-2 rounded-full ${statusVisual.badgeClass}`}>
          <Text className={`text-sm font-bold ${statusVisual.textClass}`}>
            {statusVisual.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          <Text className="text-sm text-gray-600">{item.description}</Text>
        </View>
      )}
    </Animated.View>
  );
};
