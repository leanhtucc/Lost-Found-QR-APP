/**
 * Header Component
 * Header của màn hình Home với thông tin user và notifications
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bell, Menu, User } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface HeaderProps {
  userName?: string;
  studentId?: string; // Kept for backward compatibility
  userAvatar?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Người dùng',
  userAvatar,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}) => {
  const firstName = userName.split(' ').pop() || userName;

  return (
    <View className="flex-row items-center justify-between px-6 pb-3 pt-5">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Mở tài khoản"
          className="h-9 w-9 items-center justify-center rounded-full bg-fb-surface/80"
        >
          <Menu size={18} color={FIND_BACK.primaryLight} />
        </TouchableOpacity>
        <View>
          <Text className="text-[32px] font-extrabold text-fb-primary/95">FindBack</Text>
          <Text className="-mt-1 text-[11px] text-fb-muted">Xin chào, {firstName}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel="Mở thông báo"
          className="h-10 w-10 items-center justify-center rounded-full bg-fb-surface/75"
        >
          <Bell size={18} color={FIND_BACK.mutedText} />
          {notificationCount > 0 && (
            <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
              <Text className="text-white text-xs font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Mở hồ sơ"
          className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-fb-primary/35 bg-fb-surface"
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <User size={18} color={FIND_BACK.primaryLight} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
