/**
 * Conversation Card Component
 * Card hiển thị thông tin cuộc hội thoại
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User } from 'lucide-react-native';
import { Conversation } from '@/types/chat';

interface ConversationCardProps {
  conversation: Conversation;
  index: number;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  index,
  onPress,
}) => {
  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days} ngày`;

    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <AnimatedTouchable
      entering={FadeInDown.duration(300).delay(index * 50)}
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-3 ${conversation.unreadCount > 0 ? 'bg-blue-50' : 'bg-white'}`}
    >
      {/* Avatar */}
      <View className="relative">
        <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
          {conversation.userAvatar ? (
            <Image
              source={{ uri: conversation.userAvatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <User size={28} color="#9ca3af" />
          )}
        </View>
        {conversation.isOnline && (
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {conversation.userName}
          </Text>
          <Text className="text-xs text-gray-500">{formatTime(conversation.lastMessageAt)}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs text-blue-600 mb-1" numberOfLines={1}>
              📦 {conversation.itemName}
            </Text>
            <Text
              className={`text-sm ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
          </View>

          {conversation.unreadCount > 0 && (
            <View className="ml-2 w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
};
