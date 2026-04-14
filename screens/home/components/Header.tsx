/**
 * Header Component
 * Header của màn hình Home với thông tin user và notifications
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { logo } from '@assets';
import { FIND_BACK } from '@constants/theme';

interface HeaderProps {
  userName?: string;
  studentId?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Người dùng',
  studentId,
  userAvatar,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}) => {
  // Get first name from full name
  const firstName = userName.split(' ').pop() || userName;

  return (
    <View className="flex-row items-center justify-between px-4 py-5 bg-white border-b border-gray-100">
      {/* Left side - Logo and user info */}
      <View className="flex-row items-center gap-3">
        <Image source={logo} className="w-10 h-10" resizeMode="contain" />
        <View>
          <Text className="font-bold text-gray-900">Xin chào, {firstName}!</Text>
        </View>
      </View>

      {/* Right side - Notifications and Profile */}
      <View className="flex-row items-center gap-2">
        {/* Notification Button */}
        <TouchableOpacity
          onPress={onNotificationPress}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center relative"
        >
          <Bell size={20} color={FIND_BACK.mutedText} />
          {notificationCount > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          onPress={onProfilePress}
          className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden"
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <User size={20} color={FIND_BACK.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
