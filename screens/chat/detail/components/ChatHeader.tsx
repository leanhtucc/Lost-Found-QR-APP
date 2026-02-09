/**
 * Chat Header Component
 * Header với avatar, tên user, verified badge, và action buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Phone, Video, MoreVertical, BadgeCheck } from 'lucide-react-native';

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
    <View className="bg-white border-b border-gray-100">
      {/* Header Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center gap-3">
          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
          >
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>

          {/* User Info */}
          <View className="flex-1 flex-row items-center gap-3">
            <View className="relative">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-200">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-blue-600 font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              {isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              )}
            </View>

            <View className="flex-1">
              {/* Name with Verified Badge */}
              <View className="flex-row items-center gap-1">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>
                  {userName}
                </Text>
                {isVerified && <BadgeCheck size={16} color="#3b82f6" fill="#3b82f6" />}
              </View>
              <View className="flex-row items-center gap-1">
                {isOnline && <View className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                <Text className="text-xs text-gray-500" numberOfLines={1}>
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
                className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100"
              >
                <Phone size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
            {onVideoPress && (
              <TouchableOpacity
                onPress={onVideoPress}
                className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100"
              >
                <Video size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
            {onMorePress && (
              <TouchableOpacity
                onPress={onMorePress}
                className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100"
              >
                <MoreVertical size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Item Badge */}
      <View className="bg-blue-50 border-t border-blue-100 py-2">
        <View className="flex-row items-center justify-center gap-2">
          <View className="w-2 h-2 rounded-full bg-blue-500" />
          <Text className="text-xs text-blue-600 font-medium">Đang hỗ trợ trả lại: {itemName}</Text>
        </View>
      </View>
    </View>
  );
};
