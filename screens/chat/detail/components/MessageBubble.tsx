/**
 * Message Bubble Component
 * Bubble hiển thị message với styling khác nhau cho sender/receiver
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Check, CheckCheck } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface MessageBubbleProps {
  content: string;
  timestamp: Date;
  isRead: boolean;
  isMine: boolean;
  isSystem?: boolean;
  showTime: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isRead,
  isMine,
  isSystem,
  showTime,
  isLastInGroup,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <Animated.View
        entering={FadeInUp.duration(300).springify()}
        className="items-center my-2 px-4"
      >
        <View className="rounded-full border border-fb-primary/30 bg-fb-primary/10 px-4 py-1.5 shadow-sm">
          <Text className="text-center text-xs font-medium text-fb-primary-light">{content}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify()}
      className={`flex-row ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
    >
      <View className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <View
          className={`px-4 py-2.5 ${
            isMine
              ? `bg-fb-primary ${isLastInGroup ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
              : `border border-fb-border-subtle bg-fb-surface-elevated ${isLastInGroup ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
          }`}
        >
          <Text className="text-sm leading-relaxed text-fb-content">{content}</Text>
        </View>

        {/* Time & Read Status */}
        {showTime && isLastInGroup && (
          <View
            className={`flex-row items-center gap-1 mt-1 px-1 ${
              isMine ? 'justify-end' : 'justify-start'
            }`}
          >
            <Text className="text-[10px] text-fb-label">{formatTime(timestamp)}</Text>
            {isMine && (
              <View>
                {isRead ? (
                  <CheckCheck size={14} color={FIND_BACK.info} />
                ) : (
                  <Check size={14} color={FIND_BACK.mutedText} />
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};
