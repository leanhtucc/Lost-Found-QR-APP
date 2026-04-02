/**
 * Trust Metrics Card Component
 * Hiển thị điểm uy tín, số đồ vật đã trả, và cấp bậc thành viên
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Star, Package, Award } from 'lucide-react-native';
import { getUserLevel, getLevelInfo } from '@/services/auth/types';

interface TrustMetricsCardProps {
  trustScore: number;
  totalReturned: number;
}

export const TrustMetricsCard: React.FC<TrustMetricsCardProps> = ({
  trustScore,
  totalReturned,
}) => {
  const userLevel = getUserLevel(trustScore);
  const levelInfo = getLevelInfo(userLevel);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mx-4">
      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <View className="flex-row gap-3">
          {/* Trust Score */}
          <View className="flex-1 items-center p-3 bg-amber-50 rounded-xl">
            <View className="flex-row items-center gap-1 mb-1">
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
              <Text className="text-xs font-medium text-amber-700">Uy tín</Text>
            </View>
            <Text className="text-2xl font-bold text-amber-900">{trustScore}</Text>
            <Text className="text-xs text-amber-600 mt-0.5">điểm</Text>
          </View>

          {/* Total Returned */}
          <View className="flex-1 items-center p-3 bg-emerald-50 rounded-xl">
            <View className="flex-row items-center gap-1 mb-1">
              <Package size={18} color="#10b981" />
              <Text className="text-xs font-medium text-emerald-700">Đã trả lại</Text>
            </View>
            <Text className="text-2xl font-bold text-emerald-900">{totalReturned}</Text>
            <Text className="text-xs text-emerald-600 mt-0.5">vật phẩm</Text>
          </View>

          {/* User Level */}
          <View className="flex-1 items-center p-3 bg-indigo-50 rounded-xl">
            <View className="flex-row items-center gap-1 mb-1">
              <Award size={18} color="#4f46e5" />
              <Text className="text-xs font-medium text-indigo-700">Cấp bậc</Text>
            </View>
            <Text className="text-lg font-bold text-indigo-900" numberOfLines={1}>
              {levelInfo.label}
            </Text>
            <Text className="text-xs text-indigo-600 mt-0.5">thành viên</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
