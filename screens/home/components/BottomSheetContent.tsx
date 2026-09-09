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
  const feedCards = useMemo(() => cards, [cards]);

  const feedCount = useMemo(() => {
    return feedCards.length;
  }, [feedCards.length]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const preview = feedCards.slice(0, 5).map(item => {
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
      renderedCount: feedCards.length,
      preview,
    });
  }, [cards.length, myLostCount, feedCards, nearbyCount]);

  const emptyStateText = 'Chưa có đồ thất lạc nào gần bạn trong bán kính 10 km.';

  return (
    <View className="flex-1 rounded-t-[32px] bg-[#131318] px-6 pb-6 pt-2">
      <View>
        <TouchableOpacity
          activeOpacity={0.85}
          className="self-start rounded-full bg-[#c7bfff] px-5 py-2.5"
        >
          <Text className="text-sm font-semibold text-[#25008c]">Đồ thất lạc ({feedCount})</Text>
        </TouchableOpacity>

        {myLostCount > 0 ? (
          <Text className="mt-2 text-xs text-[#8d879e]">
            Bạn có {myLostCount} vật dụng đang mất. Quản lý chi tiết tại mục My Items.
          </Text>
        ) : null}
      </View>

      <View className="mt-4 h-[220px]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {feedCards.length > 0 ? (
            feedCards.map(item => (
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
