import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DiscoveryFilterType, HomeLostFeedCard, MapDiscoveryCard } from '@/types/radar';
import { HomeItemCard } from './HomeItemCard';
import { EmptyState } from '@/components/atoms/EmptyState';
import { LoadingState } from '@/components/atoms/LoadingState';
import { FIND_BACK } from '@/constants/theme';
import { MapPinOff, Radar } from 'lucide-react-native';

interface BottomSheetContentProps {
  cards: (HomeLostFeedCard | MapDiscoveryCard)[];
  typeFilter?: DiscoveryFilterType;
  myLostCount: number;
  nearbyCount: number;
  isRealtimeConnected?: boolean;
  isRadarLoading?: boolean;
  hasLocationPermission?: boolean;
  onRequestLocation?: () => void;
  lastUpdatedAt?: string | number | null;
  onRefresh?: () => void;
  onSelectItem: (itemId: string) => void;
}

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  cards,
  typeFilter = 'ALL',
  myLostCount,
  nearbyCount,
  isRealtimeConnected = false,
  isRadarLoading = false,
  hasLocationPermission = true,
  onRequestLocation,
  lastUpdatedAt,
  onRefresh,
  onSelectItem,
}) => {
  const feedCards = useMemo(() => cards, [cards]);
  const feedCount = useMemo(() => feedCards.length, [feedCards.length]);

  const badgeTitle = useMemo(() => {
    if (typeFilter === 'LOST') return `Đồ thất lạc (${feedCount})`;
    if (typeFilter === 'FOUND') return `Đồ nhặt được (${feedCount})`;
    return `Khám phá (${feedCount})`;
  }, [feedCount, typeFilter]);

  return (
    <View className="flex-1 rounded-t-[32px] bg-fb-surface px-6 pb-6 pt-2">
      {/* Top Header row with badge & radar status */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-fb-primary/20 px-3.5 py-1.5 border border-fb-primary/30">
            <Text className="text-xs font-bold text-fb-primary-light">{badgeTitle}</Text>
          </View>
          {nearbyCount > 0 && nearbyCount !== feedCount && (
            <Text className="text-xs text-fb-subtle">({nearbyCount} trong khu vực)</Text>
          )}
        </View>

        {/* Radar live status indicator */}
        <View className="flex-row items-center gap-1.5 rounded-full bg-fb-surface-elevated/80 px-2.5 py-1 border border-white/5">
          <View
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: isRadarLoading
                ? FIND_BACK.warning
                : isRealtimeConnected
                  ? FIND_BACK.success
                  : FIND_BACK.bodyMuted,
            }}
          />
          <Text className="text-[11px] font-medium text-fb-muted">
            {isRadarLoading ? 'Đang quét...' : isRealtimeConnected ? 'Trực tiếp' : 'Radar tạm ngắt'}
          </Text>
        </View>
      </View>

      {/* Subtitle / notice if user has lost items */}
      {myLostCount > 0 ? (
        <Text className="mt-2 text-xs text-fb-subtle">
          Bạn có {myLostCount} vật dụng đang báo mất. Quản lý chi tiết tại mục Đồ của tôi.
        </Text>
      ) : null}

      {/* Feed list / Loading / Empty / Permission */}
      <View className="mt-4 flex-1">
        {!hasLocationPermission && feedCards.length === 0 ? (
          <View className="items-center justify-center py-4">
            <EmptyState
              icon={<MapPinOff size={32} color={FIND_BACK.warning} />}
              title="Chưa bật định vị GPS"
              description="Radar cần quyền truy cập vị trí để tìm kiếm đồ thất lạc trong phạm vi 10 km."
              actionTitle={onRequestLocation ? 'Bật định vị' : undefined}
              onAction={onRequestLocation}
            />
          </View>
        ) : isRadarLoading && feedCards.length === 0 ? (
          <View className="items-center justify-center py-8">
            <LoadingState message="Đang quét đồ thất lạc trong bán kính 10 km..." />
          </View>
        ) : feedCards.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24, paddingVertical: 4 }}
          >
            {feedCards.map(item => {
              const itemKey =
                'discoveryKey' in item && item.discoveryKey
                  ? item.discoveryKey
                  : 'itemId' in item && item.itemId
                    ? item.itemId
                    : (item as any).rawId;

              return (
                <HomeItemCard
                  key={`${itemKey}-${item.reportedAt}`}
                  item={item}
                  onPress={() => onSelectItem(itemKey)}
                />
              );
            })}
          </ScrollView>
        ) : (
          <View className="items-center justify-center py-4">
            <EmptyState
              icon={<Radar size={32} color={FIND_BACK.mutedText} />}
              title={
                typeFilter === 'FOUND'
                  ? 'Không có đồ nhặt được gần bạn'
                  : typeFilter === 'LOST'
                    ? 'Không có đồ thất lạc gần bạn'
                    : 'Không có vật phẩm gần bạn'
              }
              description={
                typeFilter === 'FOUND'
                  ? 'Khu vực 10 km xung quanh bạn hiện chưa có báo cáo đồ nhặt được nào.'
                  : typeFilter === 'LOST'
                    ? 'Khu vực 10 km xung quanh bạn hiện chưa có báo cáo đồ thất lạc nào.'
                    : 'Khu vực 10 km xung quanh bạn hiện chưa có tin báo nào.'
              }
              actionTitle={onRefresh ? 'Quét lại' : undefined}
              onAction={onRefresh}
            />
          </View>
        )}
      </View>
    </View>
  );
};
