import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { StatusFilterType } from '../hooks/useItemsFilter';

interface SummaryCardsProps {
  totalItems: number;
  safeCount: number;
  lostCount: number;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalItems,
  safeCount,
  lostCount,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <View className="flex-row px-4 pt-4 gap-3">
      <TouchableOpacity
        className={`flex-1 bg-white rounded-xl p-3 items-center border ${
          statusFilter === 'all' ? 'border-blue-500 border-2' : 'border-gray-200'
        }`}
        onPress={() => onStatusFilterChange('all')}
      >
        <View className="w-10 h-10 rounded-xl bg-blue-100 justify-center items-center mb-2">
          <Package size={20} color={FIND_BACK.primary} />
        </View>
        <Text className="text-lg font-bold text-gray-900">{totalItems}</Text>
        <Text className="text-xs text-gray-500 mt-0.5">Tổng cộng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 bg-white rounded-xl p-3 items-center border ${
          statusFilter === 'safe' ? 'border-emerald-500 border-2' : 'border-gray-200'
        }`}
        onPress={() => onStatusFilterChange('safe')}
      >
        <View className="w-10 h-10 rounded-xl bg-emerald-100 justify-center items-center mb-2">
          <Package size={20} color={FIND_BACK.secondary} />
        </View>
        <Text className="text-lg font-bold text-gray-900">{safeCount}</Text>
        <Text className="text-xs text-gray-500 mt-0.5">An toàn</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 bg-white rounded-xl p-3 items-center border ${
          statusFilter === 'lost' ? 'border-red-500 border-2' : 'border-gray-200'
        }`}
        onPress={() => onStatusFilterChange('lost')}
      >
        <View className="w-10 h-10 rounded-xl bg-red-100 justify-center items-center mb-2">
          <Package size={20} color={FIND_BACK.danger} />
        </View>
        <Text className="text-lg font-bold text-gray-900">{lostCount}</Text>
        <Text className="text-xs text-gray-500 mt-0.5">Đang mất</Text>
      </TouchableOpacity>
    </View>
  );
};
