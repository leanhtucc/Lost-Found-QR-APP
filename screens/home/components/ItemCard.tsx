/**
 * ItemCard Component
 * Card hiển thị thông tin một món đồ
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Laptop,
  Wallet,
  Key,
  Smartphone,
  Briefcase,
  Package,
  LucideIcon,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Item, ItemCategory, CATEGORY_CONFIG } from '@/types/item';

interface ItemCardProps {
  item: Item;
  index: number;
  onPress: () => void;
}

// Icon mapping
const CATEGORY_ICONS: Record<ItemCategory, LucideIcon> = {
  laptop: Laptop,
  wallet: Wallet,
  keys: Key,
  phone: Smartphone,
  bag: Briefcase,
  other: Package,
};

// Color mapping for icons
const ICON_COLORS: Record<ItemCategory, string> = {
  laptop: '#2563eb',
  wallet: '#d97706',
  keys: '#9333ea',
  phone: '#059669',
  bag: '#e11d48',
  other: '#64748b',
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ItemCard: React.FC<ItemCardProps> = ({ item, index, onPress }) => {
  const Icon = CATEGORY_ICONS[item.category];
  const config = CATEGORY_CONFIG[item.category];
  const iconColor = ICON_COLORS[item.category];

  const formatDate = (date: Date) => {
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
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row items-center gap-4">
        {/* Category Icon */}
        <View className={`w-14 h-14 rounded-2xl items-center justify-center ${config.bgColor}`}>
          <Icon size={28} color={iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>
              {item.name}
            </Text>
            {item.isLost && <View className="w-2 h-2 rounded-full bg-red-500" />}
          </View>
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            ID: {item.id}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</Text>
        </View>

        {/* Status Badge */}
        <View className={`px-3 py-1.5 rounded-full ${item.isLost ? 'bg-red-100' : 'bg-green-100'}`}>
          <Text
            className={`text-xs font-semibold ${item.isLost ? 'text-red-600' : 'text-green-600'}`}
          >
            {item.isLost ? 'MẤT' : 'AN TOÀN'}
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

export default ItemCard;
