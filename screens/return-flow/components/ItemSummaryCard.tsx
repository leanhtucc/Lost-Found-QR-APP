/**
 * ItemSummaryCard Component
 * Tóm tắt thông tin món đồ, danh mục và số tiền thưởng
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { Package, Award } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ItemSummaryCardProps {
  name: string;
  category?: string;
  imageUrl?: string | null;
  rewardAmount?: number;
}

export const ItemSummaryCard: React.FC<ItemSummaryCardProps> = ({
  name,
  category,
  imageUrl,
  rewardAmount,
}) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 đ';
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-fb-border-subtle bg-fb-surface p-3">
      {/* Image / Icon */}
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-fb-border-subtle bg-fb-surface-elevated">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Package size={24} color={FIND_BACK.primaryLight} />
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-fb-content" numberOfLines={1}>
          {name}
        </Text>
        {category && (
          <Text className="text-xs text-fb-muted" numberOfLines={1}>
            {category}
          </Text>
        )}
        {rewardAmount !== undefined && (
          <View className="mt-1 flex-row items-center gap-1">
            <Award size={14} color={FIND_BACK.secondary} />
            <Text className="text-xs font-semibold text-fb-secondary">
              Thưởng: {formatCurrency(rewardAmount)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
