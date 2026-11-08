/**
 * Chat List Header Component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ChatListHeaderProps {
  /** Omit on tab roots, where there is nothing to go back to. */
  onBack?: () => void;
  unreadCount: number;
}

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({ onBack, unreadCount }) => {
  return (
    <View className="border-b border-fb-border-subtle bg-fb-surface px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              className="h-11 w-11 items-center justify-center rounded-full border border-fb-border-glass bg-fb-surface-elevated"
            >
              <ArrowLeft size={20} color={FIND_BACK.bodyText} />
            </TouchableOpacity>
          ) : null}

          <View>
            <Text className="text-xl font-bold text-fb-content">Tin nhắn</Text>
            {unreadCount > 0 && (
              <Text className="mt-0.5 text-xs text-fb-primary-light">
                {unreadCount} cuộc trò chuyện chưa đọc
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
