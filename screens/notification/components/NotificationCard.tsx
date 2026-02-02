/**
 * NotificationCard Component
 * Card hiển thị một thông báo
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QrCode, MessageCircle, PackageCheck, CheckCircle } from 'lucide-react-native';
import { Notification } from '@/types/notification';
import {
  formatNotificationTime,
  getNotificationIconBg,
  getNotificationIconColor,
  getNotificationTitle,
  getNotificationMessage,
} from '../utils';

interface NotificationCardProps {
  notification: Notification;
  index: number;
  onPress: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  index,
  onPress,
}) => {
  const getIcon = () => {
    const color = getNotificationIconColor(notification.type);
    const size = 20;

    switch (notification.type) {
      case 'qr_scanned':
        return <QrCode size={size} color={color} />;
      case 'item_found':
        return <PackageCheck size={size} color={color} />;
      case 'new_message':
        return <MessageCircle size={size} color={color} />;
      case 'item_returned':
        return <CheckCircle size={size} color={color} />;
      default:
        return <QrCode size={size} color={color} />;
    }
  };

  const title = getNotificationTitle(notification);
  const message = getNotificationMessage(notification);

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border ${
          !notification.isRead
            ? 'border-l-4 border-l-blue-500 border-blue-50 bg-blue-50/30'
            : 'border-gray-100'
        }`}
      >
        <View className="flex-row gap-3">
          {/* Icon */}
          <View
            className={`w-10 h-10 rounded-xl items-center justify-center ${getNotificationIconBg(
              notification.type
            )}`}
          >
            {getIcon()}
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text
              className={`font-semibold text-sm mb-1 ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-600'
              }`}
              numberOfLines={2}
            >
              {title}
            </Text>

            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {message}
            </Text>

            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-400">
                {formatNotificationTime(notification.createdAt)}
              </Text>
              {notification.item && (
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-blue-600 font-medium" numberOfLines={1}>
                    {notification.item.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Unread indicator */}
        {!notification.isRead && (
          <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
