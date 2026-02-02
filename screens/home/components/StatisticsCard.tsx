/**
 * StatisticsCard Component
 * Hiển thị thống kê số lượng items safe/lost với UI đẹp
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatisticsCardProps {
  safeCount: number;
  lostCount: number;
  totalCount: number;
  lastAdded?: string; // ISO date string
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  safeCount,
  lostCount,
  totalCount,
  lastAdded,
}) => {
  // Calculate days since last added
  const getDaysSinceLastAdded = () => {
    if (!lastAdded) return null;

    const lastAddedDate = new Date(lastAdded);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastAddedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysSince = getDaysSinceLastAdded();

  return (
    <View className="px-4 py-3">
      {/* Hero Banner với Gradient */}
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        className="overflow-hidden rounded-3xl mb-4"
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 relative"
        >
          {/* Content */}
          <View className="relative z-10">
            <View className="flex-row items-center gap-2 mb-2">
              <Shield size={20} color="rgba(255,255,255,0.8)" />
              <Text className="text-white/80 text-sm font-semibold">Bảo vệ tài sản</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-1">{safeCount} món đồ an toàn</Text>
            <Text className="text-white/70 text-sm">
              {lostCount > 0 ? `${lostCount} món đồ đang bị mất` : 'Tất cả tài sản đều an toàn!'}
            </Text>
          </View>

          {/* Decorative Background Icon */}
          <View className="absolute -right-6 -bottom-6 opacity-10">
            <Shield size={128} color="#ffffff" />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats Cards Grid */}
      <View className="flex-row gap-3">
        {/* Safe Card */}
        <Animated.View
          entering={FadeInRight.duration(400).delay(100).springify()}
          className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 border-l-green-500"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-green-50 items-center justify-center">
              <CheckCircle2 size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">{safeCount}</Text>
              <Text className="text-sm text-gray-500">An toàn</Text>
            </View>
          </View>
        </Animated.View>

        {/* Lost Card */}
        <Animated.View
          entering={FadeInRight.duration(400).delay(150).springify()}
          className={`flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${
            lostCount > 0 ? 'border-l-red-500' : 'border-l-gray-300'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${
                lostCount > 0 ? 'bg-red-50' : 'bg-gray-50'
              }`}
            >
              <AlertCircle size={24} color={lostCount > 0 ? '#ef4444' : '#9ca3af'} />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">{lostCount}</Text>
              <Text className="text-sm text-gray-500">Đang mất</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Summary Footer */}
      {(totalCount > 0 || daysSince !== null) && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(200).springify()}
          className="mt-3 px-2"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-xs text-gray-500">
              📊 Tổng: <Text className="font-semibold text-gray-700">{totalCount}</Text>
            </Text>
            {daysSince !== null && (
              <>
                <Text className="text-xs text-gray-300">•</Text>
                <Text className="text-xs text-gray-500">
                  Thêm: <Text className="font-semibold text-gray-700">{daysSince} ngày</Text>
                </Text>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default StatisticsCard;
