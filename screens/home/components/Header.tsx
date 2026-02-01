/**
 * Header Component
 * Header của màn hình Home với thông tin user và notifications
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { logo } from '@assets';

interface HeaderProps {
  userName?: string;
  studentId?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Người dùng',
  studentId,
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
          {studentId && <Text className="text-sm text-gray-500">{studentId}</Text>}
        </View>
      </View>

      {/* Right side - Notifications and Profile */}
      <View className="flex-row items-center gap-2">
        {/* Notification Button */}
        <TouchableOpacity
          onPress={onNotificationPress}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center relative"
        >
          <Bell size={20} color="#6b7280" />
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
          className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
        >
          <User size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
