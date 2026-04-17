import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { HomeLostFeedCard } from '@/types/radar';
import { HomeItemCard } from './HomeItemCard';

interface BottomSheetContentProps {
  cards: HomeLostFeedCard[];
  myLostCount: number;
  nearbyCount: number;
  onSelectItem: (itemId: string) => void;
}

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  cards,
  myLostCount,
  nearbyCount,
  onSelectItem,
}) => {
  const [activeTab, setActiveTab] = useState<'nearby' | 'mine'>('nearby');

  const nearbyCards = useMemo(() => cards.filter(card => !card.isOwn), [cards]);
  const myCards = useMemo(() => cards.filter(card => card.isOwn), [cards]);
  const filteredItems = activeTab === 'nearby' ? nearbyCards : myCards;
  const activeSource = activeTab === 'nearby' ? 'nearby-others' : 'my-lost';

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const preview = filteredItems.slice(0, 5).map(item => {
      return {
        source: activeSource,
        itemId: item.itemId,
        name: item.name,
        isOwn: item.isOwn,
        distanceLabel: item.distanceLabel,
      };
    });

    console.log('[Home][BottomSheet] Lost data source:', {
      source: activeSource,
      feedCardsCount: cards.length,
      nearbyCount,
      myLostCount,
      renderedCount: filteredItems.length,
      preview,
    });
  }, [activeSource, cards.length, filteredItems, myLostCount, nearbyCount]);

  const emptyStateText =
    activeTab === 'nearby'
      ? 'Chưa có đồ thất lạc nearby.'
      : 'Bạn chưa có đồ nào đang ở trạng thái mất.';

  return (
    <View className="flex-1 rounded-t-[32px] bg-[#131318] px-6 pb-6 pt-2">
      <View>
        <View className="flex-row gap-4">
          <TouchableOpacity
            activeOpacity={0.85}
            className={`rounded-full px-5 py-2.5 ${activeTab === 'nearby' ? 'bg-[#c7bfff]' : 'bg-[#2a292f]'}`}
            onPress={() => setActiveTab('nearby')}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === 'nearby' ? 'text-[#25008c]' : 'text-[#c9c4d7]'}`}
            >
              Mất gần đây ({nearbyCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            className={`rounded-full px-5 py-2.5 ${activeTab === 'mine' ? 'bg-[#c7bfff]' : 'bg-[#2a292f]'}`}
            onPress={() => setActiveTab('mine')}
          >
            <Text
              className={`text-sm font-medium ${activeTab === 'mine' ? 'text-[#25008c]' : 'text-[#c9c4d7]'}`}
            >
              Của tôi ({myLostCount})
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
                key={`${item.itemId}-${item.reportedAt}`}
                item={item}
                onPress={() => onSelectItem(item.itemId)}
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
