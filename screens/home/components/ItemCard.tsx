/**
 * ItemCard Component
 * Card hiển thị thông tin item với category icon, status badge
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { Item } from '@/types/item';
import { CATEGORY_CONFIG } from '@/types/item';
import { getCategoryIcon, getCategoryLabel } from '@/constants/categories';

interface ItemCardProps {
  item: Item;
  index: number;
  onPress: () => void;
  onMenuPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ItemCard: React.FC<ItemCardProps> = ({ item, index, onPress, onMenuPress }) => {
  const categoryConfig = CATEGORY_CONFIG[item.category];
  const categoryIcon = getCategoryIcon(item.category);
  const categoryLabel = getCategoryLabel(item.category);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AnimatedTouchable
      entering={FadeInUp.duration(300)
        .delay(index * 50)
        .springify()}
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <View className="flex-row p-3">
        {/* Left - Image or Icon */}
        <View className="mr-3">
          {item.imagePublicUrl ? (
            <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <Image
                source={{ uri: item.imagePublicUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              className={`w-16 h-16 rounded-lg ${categoryConfig.bgColor} items-center justify-center`}
            >
              <Text className="text-3xl">{categoryIcon}</Text>
            </View>
          )}
        </View>

        {/* Center - Content */}
        <View className="flex-1 justify-center">
          {/* Item Name */}
          <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
            {item.name}
          </Text>

          {/* Category & Date */}
          <View className="flex-row items-center mb-1">
            <View className={`px-2 py-0.5 rounded ${categoryConfig.bgColor}`}>
              <Text className={`text-xs font-medium ${categoryConfig.textColor}`}>
                {categoryLabel}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 ml-2">• {formatDate(item.createdAt)}</Text>
          </View>

          {/* Status Badge */}
          <View className="flex-row items-center">
            {item.status === 'safe' ? (
              <View className="flex-row items-center bg-green-50 px-2 py-1 rounded">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                <Text className="text-xs font-medium text-green-700">An toàn</Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-red-50 px-2 py-1 rounded">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                <Text className="text-xs font-medium text-red-700">Đang mất</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right - Menu Button */}
        {onMenuPress && (
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onMenuPress();
            }}
            className="w-8 h-8 items-center justify-center"
          >
            <MoreVertical size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lost Message (if exists) */}
      {item.status === 'lost' && item.lostMessage && (
        <View className="px-3 pb-3 pt-1">
          <View className="bg-red-50 border-l-2 border-red-400 p-2 rounded">
            <Text className="text-xs text-red-700" numberOfLines={2}>
              💬 {item.lostMessage}
            </Text>
          </View>
        </View>
      )}
    </AnimatedTouchable>
  );
};

export default ItemCard;
