/**
 * StatsCard Component
 * Card hiển thị thống kê số lượng đồ vật
 */

import React from 'react';
import { View, Text } from 'react-native';
import { QrCode } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface StatsCardProps {
  count: number;
  label: string;
  type: 'safe' | 'lost';
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ count, label, type, delay = 0 }) => {
  const isSafe = type === 'safe';
  const hasItems = count > 0;

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay).springify()}
      className={`flex-1 bg-white rounded-2xl p-5 shadow-sm border-l-4 ${
        isSafe ? 'border-l-green-500' : hasItems ? 'border-l-red-500' : 'border-l-gray-300'
      }`}
    >
      <View className="flex-row items-center gap-3">
        {/* Icon container */}
        <View
          className={`w-12 h-12 rounded-2xl items-center justify-center ${
            isSafe ? 'bg-green-100' : hasItems ? 'bg-red-100' : 'bg-gray-100'
          }`}
        >
          <QrCode size={24} color={isSafe ? '#22c55e' : hasItems ? '#ef4444' : '#9ca3af'} />
        </View>

        {/* Text content */}
        <View>
          <Text className="text-2xl font-bold text-gray-900">{count}</Text>
          <Text className="text-sm text-gray-500">{label}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default StatsCard;
