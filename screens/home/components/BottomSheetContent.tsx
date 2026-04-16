import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Item } from '@/types/item';
import { RadarLostItem } from '@/types/radar';
import { HomeItemCard } from './HomeItemCard';

interface BottomSheetContentProps {
  items: Item[];
  nearbyLostItems?: RadarLostItem[];
  myLostItems?: Item[];
  onSelectItem: (itemId: string) => void;
  onScanPress?: () => void;
  onReportLostPress?: () => void;
}

const isOwnedItem = (item: Item | RadarLostItem): item is Item => {
  return 'ownerId' in item;
};

const getItemIdentifier = (item: Item | RadarLostItem): string => {
  return isOwnedItem(item) ? item.id : item.itemId;
};

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  items,
  nearbyLostItems,
  myLostItems,
  onSelectItem,
  onScanPress,
  onReportLostPress,
}) => {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');

  const safeItems = items.filter(item => item.status === 'safe');
  const lostItems = nearbyLostItems?.length
    ? nearbyLostItems
    : myLostItems?.length
      ? myLostItems
      : items.filter(item => item.status === 'lost');
  const filteredItems = activeTab === 'lost' ? lostItems : safeItems;

  const emptyStateText =
    activeTab === 'lost'
      ? 'Chưa có dữ liệu mất đồ gần bạn.'
      : 'Chưa có đồ an toàn trong danh sách của bạn.';

  return (
    <View className="flex-1 rounded-t-[32px] bg-[#131318] px-6 pb-6 pt-2">
      <View>
        <View className="flex-row gap-4">
          <TouchableOpacity
            activeOpacity={0.85}
            className={`rounded-full px-5 py-2.5 ${activeTab === 'lost' ? 'bg-[#c7bfff]' : 'bg-[#2a292f]'}`}
            onPress={() => setActiveTab('lost')}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === 'lost' ? 'text-[#25008c]' : 'text-[#c9c4d7]'}`}
            >
              Mất gần đây
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            className={`rounded-full px-5 py-2.5 ${activeTab === 'found' ? 'bg-[#c7bfff]' : 'bg-[#2a292f]'}`}
            onPress={() => setActiveTab('found')}
          >
            <Text
              className={`text-sm font-medium ${activeTab === 'found' ? 'text-[#25008c]' : 'text-[#c9c4d7]'}`}
            >
              Nhặt được
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 h-[196px]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <HomeItemCard
                key={getItemIdentifier(item)}
                item={item}
                onPress={() => onSelectItem(getItemIdentifier(item))}
              />
            ))
          ) : (
            <View className="h-full w-[220px] items-center justify-center rounded-2xl bg-[#1b1b20]">
              <Text className="px-4 text-center text-[#64748b]">{emptyStateText}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};
