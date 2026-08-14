/**
 * Chat Header Component
 * Header với avatar, tên user, verified badge, và action buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Phone, Video, MoreVertical, BadgeCheck } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ChatHeaderProps {
  userName: string;
  itemName: string;
  isOnline: boolean;
  isVerified?: boolean; // Verified status for badge
  avatarUrl?: string;
  onBack: () => void;
  onCallPress?: () => void;
  onVideoPress?: () => void;
  onMorePress?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  itemName,
  isOnline,
  isVerified = false,
  avatarUrl,
  onBack,
  onCallPress,
  onVideoPress,
  onMorePress,
}) => {
  return (
    <View className="border-b border-fb-border-subtle bg-fb-surface">
      {/* Header Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center gap-3">
          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            className="h-11 w-11 items-center justify-center rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated"
          >
            <ArrowLeft size={20} color={FIND_BACK.bodyText} />
          </TouchableOpacity>

          {/* User Info */}
          <View className="flex-1 flex-row items-center gap-3">
            <View className="relative">
              <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-fb-primary/30 bg-fb-primary/15">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-sm font-bold text-fb-primary-light">
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              {isOnline && (
                <View className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-fb-surface bg-fb-secondary" />
              )}
            </View>

            <View className="flex-1">
              {/* Name with Verified Badge */}
              <View className="flex-row items-center gap-1">
                <Text className="font-semibold text-fb-content" numberOfLines={1}>
                  {userName}
                </Text>
                {isVerified && (
                  <BadgeCheck size={16} color={FIND_BACK.info} fill={FIND_BACK.info} />
                )}
              </View>
              <View className="flex-row items-center gap-1">
                {isOnline && <View className="h-1.5 w-1.5 rounded-full bg-fb-secondary" />}
                <Text className="text-xs text-fb-muted" numberOfLines={1}>
                  {itemName}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-1">
            {onCallPress && (
              <TouchableOpacity
                onPress={onCallPress}
                accessibilityLabel="Gọi điện"
                className="h-10 w-10 items-center justify-center rounded-xl bg-fb-surface-elevated"
              >
                <Phone size={18} color={FIND_BACK.mutedText} />
              </TouchableOpacity>
            )}
            {onVideoPress && (
              <TouchableOpacity
                onPress={onVideoPress}
                accessibilityLabel="Gọi video"
                className="h-10 w-10 items-center justify-center rounded-xl bg-fb-surface-elevated"
              >
                <Video size={18} color={FIND_BACK.mutedText} />
              </TouchableOpacity>
            )}
            {onMorePress && (
              <TouchableOpacity
                onPress={onMorePress}
                accessibilityLabel="Tùy chọn cuộc trò chuyện"
                className="h-10 w-10 items-center justify-center rounded-xl bg-fb-surface-elevated"
              >
                <MoreVertical size={18} color={FIND_BACK.mutedText} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Item Badge */}
      <View className="border-t border-fb-primary/15 bg-fb-primary/10 py-2.5">
        <View className="flex-row items-center justify-center gap-2">
          <View className="h-2 w-2 rounded-full bg-fb-primary-light" />
          <Text className="text-xs font-medium text-fb-primary-light">
            Đang hỗ trợ hoàn trả: {itemName}
          </Text>
        </View>
      </View>
    </View>
  );
};
