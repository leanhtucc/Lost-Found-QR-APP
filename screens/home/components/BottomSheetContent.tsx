import React, { useEffect, useMemo } from 'react';
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
  const feedCount = useMemo(() => {
    return nearbyCount > 0 ? nearbyCount : cards.length;
  }, [cards.length, nearbyCount]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const preview = cards.slice(0, 5).map(item => {
      return {
        source: 'lost-feed',
        itemId: item.itemId,
        name: item.name,
        isOwn: item.isOwn,
        distanceLabel: item.distanceLabel,
      };
    });

    console.log('[Home][BottomSheet] Lost data source:', {
      source: 'lost-feed',
      feedCardsCount: cards.length,
      nearbyCount,
      myLostCount,
      renderedCount: cards.length,
      preview,
    });
  }, [cards, cards.length, myLostCount, nearbyCount]);

  const emptyStateText = 'Chưa có đồ thất lạc nearby.';

  return (
    <View className="flex-1 rounded-t-[32px] bg-[#131318] px-6 pb-6 pt-2">
      <View>
        <TouchableOpacity
          activeOpacity={0.85}
          className="self-start rounded-full bg-[#c7bfff] px-5 py-2.5"
        >
          <Text className="text-sm font-semibold text-[#25008c]">Mất gần đây ({feedCount})</Text>
        </TouchableOpacity>

        {myLostCount > 0 ? (
          <Text className="mt-2 text-xs text-[#8d879e]">
            Bạn có {myLostCount} vật dụng đang mất. Quản lý chi tiết tại mục My Items.
          </Text>
        ) : null}
      </View>

      <View className="mt-4 h-[196px]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {cards.length > 0 ? (
            cards.map(item => (
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
