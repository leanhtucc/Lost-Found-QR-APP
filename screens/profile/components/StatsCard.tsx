/**
 * Stats Card Component
 * Hiển thị thống kê tổng số items, safe, lost
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Package, QrCode, AlertTriangle } from 'lucide-react-native';

interface StatsCardProps {
  totalItems: number;
  safeItems: number;
  lostItems: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ totalItems, safeItems, lostItems }) => {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} className="flex-row gap-3 px-4">
      {/* Total Items */}
      <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
        <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mb-2">
          <Package size={24} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{totalItems}</Text>
        <Text className="text-xs text-gray-500 mt-1">Tổng món đồ</Text>
      </View>

      {/* Safe Items */}
      <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
        <View className="w-12 h-12 rounded-2xl bg-green-50 items-center justify-center mb-2">
          <QrCode size={24} color="#10b981" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{safeItems}</Text>
        <Text className="text-xs text-gray-500 mt-1">An toàn</Text>
      </View>

      {/* Lost Items */}
      <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
        <View className="w-12 h-12 rounded-2xl bg-red-50 items-center justify-center mb-2">
          <AlertTriangle size={24} color="#ef4444" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{lostItems}</Text>
        <Text className="text-xs text-gray-500 mt-1">Đang mất</Text>
      </View>
    </Animated.View>
  );
};
