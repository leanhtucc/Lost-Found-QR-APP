/**
 * Item Info Card Component
 * Card hiển thị thông tin cơ bản của item
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Item } from '@/types/item';
import { getCategoryIcon, getCategoryLabel } from '@/constants/categories';
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
          backgroundColor: 'rgba(215, 51, 87, 0.14)',
          color: FIND_BACK.danger,
          label: 'Đang mất',
        };
      case 'PENDING_PAYMENT':
        return {
          backgroundColor: 'rgba(244, 132, 95, 0.14)',
          color: FIND_BACK.tertiary,
          label: 'Chờ thanh toán',
        };
      case 'FOUND':
        return {
          backgroundColor: 'rgba(173, 163, 255, 0.14)',
          color: FIND_BACK.info,
          label: 'Đã tìm thấy',
        };
      case 'RESOLVED':
        return {
          backgroundColor: 'rgba(124, 106, 246, 0.14)',
          color: FIND_BACK.primaryLight,
          label: 'Đã hoàn trả',
        };
      case 'SAFE':
      default:
        return {
          backgroundColor: 'rgba(46, 204, 139, 0.14)',
          color: FIND_BACK.secondary,
          label: 'An toàn',
        };
    }
  })();

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="mb-4 rounded-3xl border border-fb-border-subtle bg-fb-surface p-5"
    >
      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-fb-primary/15">
          <CategoryIcon size={30} color={FIND_BACK.primaryLight} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="mb-1 text-xl font-bold text-fb-content">{item.name}</Text>
          <Text className="text-sm text-fb-muted">{getCategoryLabel(item.category)}</Text>
        </View>

        {/* Status Badge */}
        <View
          className="rounded-full px-3 py-2"
          style={{ backgroundColor: statusVisual.backgroundColor }}
        >
          <Text className="text-xs font-bold" style={{ color: statusVisual.color }}>
            {statusVisual.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <View className="mt-4 border-t border-fb-border-subtle pt-4">
          <Text className="text-sm leading-6 text-fb-muted">{item.description}</Text>
        </View>
      )}
    </Animated.View>
  );
};
