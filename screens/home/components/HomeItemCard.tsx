import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { HomeLostFeedCard, MapDiscoveryCard } from '@/types/radar';
import { MapPin, Package } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { StatusBadge } from '@/components/atoms/StatusBadge';

interface HomeItemCardProps {
  item: HomeLostFeedCard | MapDiscoveryCard;
  onPress: () => void;
}

const FALLBACK_ADDRESS = 'Không xác định rõ địa chỉ';

const buildLocationLine = (item: HomeLostFeedCard | MapDiscoveryCard): string => {
  return item.address?.trim() ? item.address.trim() : FALLBACK_ADDRESS;
};

const buildDistanceBadge = (item: HomeLostFeedCard | MapDiscoveryCard): string | null => {
  if (item.distanceLabel?.trim()) {
    return item.distanceLabel.trim();
  }

  if (typeof item.distanceMeters === 'number' && Number.isFinite(item.distanceMeters)) {
    if (item.distanceMeters < 1000) {
      return `${Math.round(item.distanceMeters)}m`;
    }

    const kilometers = item.distanceMeters / 1000;
    return `${kilometers >= 10 ? Math.round(kilometers) : kilometers.toFixed(1)}km`;
  }

  return null;
};

export const HomeItemCard: React.FC<HomeItemCardProps> = ({ item, onPress }) => {
  const locationLine = buildLocationLine(item);
  const distanceBadge = buildDistanceBadge(item);
  const isFound =
    item.reportType === 'FOUND' ||
    ('source' in item && item.source === 'FOUND_REPORT') ||
    ('itemId' in item && typeof item.itemId === 'string' && item.itemId.startsWith('found:'));

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Xem thông tin ${item.name}`}
      className="mr-4 w-[190px] rounded-2xl border border-white/10 bg-fb-surface p-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View className="h-28 w-full overflow-hidden rounded-xl bg-fb-surface-elevated">
        {item.imagePublicUrl ? (
          <Image
            source={{ uri: item.imagePublicUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-fb-surface-elevated">
            <Package size={28} color={FIND_BACK.subtleText} strokeWidth={1.5} />
            <Text className="mt-1 text-[10px] text-fb-subtle">Không có ảnh</Text>
          </View>
        )}

        {distanceBadge ? (
          <View className="absolute right-2 top-2 rounded-md bg-fb-warning/90 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-white">{distanceBadge}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-2.5 w-full">
        <View className="flex-row items-center justify-between">
          <StatusBadge status={isFound ? 'FOUND' : 'LOST'} size="sm" />
          {item.isOwn && (
            <Text className="text-[10px] font-medium text-fb-primary-light">Của bạn</Text>
          )}
        </View>

        <Text className="mt-1.5 text-sm font-bold text-fb-content" numberOfLines={1}>
          {item.name}
        </Text>

        {!item.isOwn && (
          <Text className="mt-0.5 text-[11px] text-fb-muted" numberOfLines={1}>
            {item.ownerDisplayName}
          </Text>
        )}

        <View className="mt-1.5 flex-row items-center">
          <MapPin size={11} color={FIND_BACK.mutedText} />
          <Text className="ml-1 flex-1 text-[11px] text-fb-subtle" numberOfLines={1}>
            {locationLine}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
