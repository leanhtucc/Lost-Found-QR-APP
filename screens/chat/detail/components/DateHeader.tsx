/**
 * Date Header Component
 * Hiển thị ngày giữa các nhóm messages
 */

import React from 'react';
import { View, Text } from 'react-native';

interface DateHeaderProps {
  date: Date;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ date }) => {
  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
    });
  };

  return (
    <View className="flex-row justify-center py-2">
      <View className="rounded-full border border-fb-border-subtle bg-fb-surface px-3 py-1">
        <Text className="text-xs font-medium text-fb-muted">{formatDateHeader(date)}</Text>
      </View>
    </View>
  );
};
