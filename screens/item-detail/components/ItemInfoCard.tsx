/**
 * Item Info Card Component
 * Card hiển thị thông tin cơ bản của item
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Item } from '@/types/item';
import { getCategoryIcon } from '@/constants/categories';

interface ItemInfoCardProps {
  item: Item;
}

export const ItemInfoCard: React.FC<ItemInfoCardProps> = ({ item }) => {
  const CategoryIcon = getCategoryIcon(item.category);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
    >
      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center">
          <CategoryIcon size={32} color="#3b82f6" />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 mb-1">{item.name}</Text>
          <Text className="text-sm text-gray-500">ID: {item.id}</Text>
        </View>

        {/* Status Badge */}
        <View
          className={`px-4 py-2 rounded-full ${
            item.status === 'lost' ? 'bg-red-100' : 'bg-green-100'
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              item.status === 'lost' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {item.status === 'lost' ? 'ĐANG MẤT' : 'AN TOÀN'}
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
