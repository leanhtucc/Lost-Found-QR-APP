import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Item } from '@/types/item';
import { RadarLostItem } from '@/types/radar';
import { MapPin } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface HomeItemCardProps {
  item: Item | RadarLostItem;
  onPress: () => void;
}

const isOwnedItem = (item: Item | RadarLostItem): item is Item => {
  return 'ownerId' in item;
};

const formatDistance = (item: Item | RadarLostItem): string => {
  if ('distanceMeters' in item && typeof item.distanceMeters === 'number') {
    if (item.distanceMeters < 1000) {
      return `${Math.round(item.distanceMeters)}M`;
    }

    return `${(item.distanceMeters / 1000).toFixed(1)}KM`;
  }

  return 'GẦN BẠN';
};

export const HomeItemCard: React.FC<HomeItemCardProps> = ({ item, onPress }) => {
  const isLost = isOwnedItem(item) ? item.status === 'lost' : true;
  const distance = formatDistance(item);
  const reward = isLost
    ? 'distanceMeters' in item && item.distanceMeters && item.distanceMeters > 700
      ? '1M'
      : '500K'
    : undefined;

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

        {reward ? (
          <View className="absolute right-2 top-2 rounded-lg bg-[#dd724f]/95 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-white">{reward}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-2 w-full">
        <Text className="text-base font-semibold text-[#e4e1e9]" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="mt-1 flex-row items-center">
          <MapPin size={11} color={FIND_BACK.mutedText} />
          <Text className="ml-1 text-[11px] font-medium tracking-wide text-[#64748b]">
            {distance}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
