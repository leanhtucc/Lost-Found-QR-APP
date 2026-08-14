/**
 * Conversation Card Component
 * Card hiển thị thông tin cuộc hội thoại
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BadgeCheck, Package, User } from 'lucide-react-native';
import { Conversation } from '@/types/chat';
import { FIND_BACK } from '@constants/theme';

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
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-3xl border p-4 ${
        conversation.unreadCount > 0
          ? 'border-fb-primary/30 bg-fb-primary/10'
          : 'border-fb-border-subtle bg-fb-surface'
      }`}
    >
      {/* Avatar */}
      <View className="relative">
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated">
          {conversation.userAvatar ? (
            <Image
              source={{ uri: conversation.userAvatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <User size={28} color={FIND_BACK.mutedText} />
          )}
        </View>
        {conversation.isOnline && (
          <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-fb-surface bg-fb-secondary" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-1 flex-row items-center gap-1.5">
            <Text className="flex-shrink text-base font-semibold text-fb-content" numberOfLines={1}>
              {conversation.userName}
            </Text>
            {conversation.isVerified ? <BadgeCheck size={15} color={FIND_BACK.info} /> : null}
          </View>
          <Text className="text-xs text-fb-label">{formatTime(conversation.lastMessageAt)}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="mb-1 flex-row items-center gap-1.5">
              <Package size={12} color={FIND_BACK.primaryLight} />
              <Text className="flex-1 text-xs text-fb-primary-light" numberOfLines={1}>
                {conversation.itemName}
              </Text>
            </View>
            <Text
              className={`text-sm ${
                conversation.unreadCount > 0 ? 'font-medium text-fb-content' : 'text-fb-muted'
              }`}
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
          </View>

          {conversation.unreadCount > 0 && (
            <View className="ml-2 h-6 min-w-[24px] items-center justify-center rounded-full bg-fb-primary px-1.5">
              <Text className="text-xs font-bold text-fb-content">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
};
