import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Item } from '@/types/item';
import { Clock, MapPin } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface HomeItemCardProps {
  item: Item;
  onPress: () => void;
}

export const HomeItemCard: React.FC<HomeItemCardProps> = ({ item, onPress }) => {
  // Determine if it is lost or found based on status (assuming 'safe' or empty is found, 'lost' is lost)
  const isLost = item.status === 'lost';
  // Mock distance and time
  const distance = 'Cách đây 250m';
  const time = isLost ? 'Mất 2 giờ trước' : 'Nhặt được 2 giờ trước';
  const reward = isLost ? '500K' : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center bg-fb-surface-muted border border-fb-surface-elevated rounded-2xl p-3 mb-3 shrink-0"
    >
      <View className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden mr-3">
        {item.imagePublicUrl ? (
          <Image
            source={{ uri: item.imagePublicUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center border border-gray-700 rounded-xl bg-fb-surface-elevated">
            <Text className="text-gray-500 text-xs">No img</Text>
          </View>
        )}
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mb-1">
          <MapPin size={12} color={FIND_BACK.mutedText} />
          <Text className="text-gray-400 text-xs ml-1">{distance}</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={12} color={FIND_BACK.mutedText} />
          <Text className="text-gray-400 text-xs ml-1">{time}</Text>
        </View>
      </View>

      {reward && (
        <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30 ml-2 shadow-sm">
          <Text className="text-green-500 text-[9px] font-bold text-center leading-3">REWARD:</Text>
          <Text className="text-green-500 text-xs font-bold text-center">{reward}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
