import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { HomeLostFeedCard } from '@/types/radar';
import { MapPin } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface HomeItemCardProps {
  item: HomeLostFeedCard;
  onPress: () => void;
}

const FALLBACK_ADDRESS = 'Không xác định rõ địa chỉ';

const buildLocationLine = (item: HomeLostFeedCard): string => {
  return item.address?.trim() ? item.address.trim() : FALLBACK_ADDRESS;
};

const buildDistanceBadge = (item: HomeLostFeedCard): string | null => {
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

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mr-4 w-[180px] rounded-2xl border border-[#4745541a] bg-[#1b1b20] p-[13px]"
    >
      <View className="h-24 w-full overflow-hidden rounded-xl bg-[#20212a]">
        {item.imagePublicUrl ? (
          <Image
            source={{ uri: item.imagePublicUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center rounded-xl border border-gray-700 bg-fb-surface-elevated">
            <Text className="text-xs text-gray-500">No img</Text>
          </View>
        )}

        {distanceBadge ? (
          <View className="absolute right-2 top-2 rounded-lg bg-[#dd724f]/95 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-white">{distanceBadge}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-2 w-full">
        <Text className="text-base font-semibold text-[#e4e1e9]" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="mt-0.5 text-[11px] text-[#9f9aae]" numberOfLines={1}>
          {item.isOwn ? 'Đồ của bạn' : item.ownerDisplayName}
        </Text>
        <View className="mt-1 flex-row items-center">
          <MapPin size={11} color={FIND_BACK.mutedText} />
          <Text className="ml-1 flex-1 text-[11px] font-medium text-[#64748b]" numberOfLines={2}>
            {locationLine}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
