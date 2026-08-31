/**
 * Stats Card Component
 * Hàng thống kê theo Figma
 */

import React from 'react';
import { View, Text } from 'react-native';
import { FIND_BACK } from '@constants/theme';

interface StatsCardProps {
  protectedItems: number;
  safeItems: number;
  lostItems: number;
}

function MetricBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl border border-fb-border-subtle bg-fb-surface px-2 py-4">
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="mt-1 text-center text-[10px] font-bold uppercase leading-[12.5px] text-fb-muted">
        {label}
      </Text>
    </View>
  );
}

export const StatsCard: React.FC<StatsCardProps> = ({ protectedItems, safeItems, lostItems }) => {
  return (
    <View className="mt-4 flex-row gap-3">
      <MetricBox value={protectedItems} label={`Đồ được\nbảo vệ`} color={FIND_BACK.info} />
      <MetricBox value={safeItems} label={`Đồ an\ntoàn`} color={FIND_BACK.secondary} />
      <MetricBox value={lostItems} label={`Đồ đang\nmất`} color={FIND_BACK.danger} />
    </View>
  );
};
