import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package } from 'lucide-react-native';
import { Item } from '@/types/item';
import { FIND_BACK } from '@constants/theme';
import { StatusFilterType } from '../hooks/useItemsFilter';
import { EmptyState } from './EmptyState';

interface ItemsListProps {
  items: Item[];
  filteredItems: Item[];
  statusFilter: StatusFilterType;
  onSelectItem: (id: string) => void;
  onAddClick: () => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  filteredItems,
  statusFilter,
  onSelectItem,
  onAddClick,
}) => {
  const getStatusLabel = () => {
    switch (statusFilter) {
      case 'safe':
        return 'An toàn';
      case 'lost':
        return 'Đang mất';
      default:
        return 'Tất cả';
    }
  };

  return (
    <>
      <View className="flex-row justify-between items-center px-4 pt-5 pb-3">
        <Text className="text-base font-bold text-gray-900">{getStatusLabel()}</Text>
        <Text className="text-sm text-gray-500">{filteredItems.length} kết quả</Text>
      </View>

      {filteredItems.length > 0 ? (
        <View className="px-4 pb-6">
          {filteredItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
              onPress={() => onSelectItem(item.id)}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-12 h-12 rounded-xl justify-center items-center ${
                    item.status === 'lost' ? 'bg-red-100' : 'bg-blue-100'
                  }`}
                >
                  <Package
                    size={24}
                    color={item.status === 'lost' ? FIND_BACK.danger : FIND_BACK.primary}
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-semibold text-gray-900 mb-1">{item.name}</Text>
                  <Text className="text-sm text-gray-500">{item.category}</Text>
                </View>
                {item.status === 'lost' && (
                  <View className="bg-red-100 px-2 py-1 rounded-md">
                    <Text className="text-xs font-semibold text-red-600">Đang mất</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState type="no-items" onAddClick={onAddClick} />
      ) : (
        <EmptyState type="no-results" />
      )}
    </>
  );
};
