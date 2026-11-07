/**
 * Message bubble. Mine = solid primary (white text), theirs = raised surface.
 * Grouped messages keep tight corners; only the last in a group gets the tail.
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Check, CheckCheck, ShieldCheck } from 'lucide-react-native';
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

const formatTime = (date: Date) =>
  date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isRead,
  isMine,
  isSystem,
  showTime,
  isLastInGroup,
}) => {
  if (isSystem) {
    return (
      <Animated.View entering={FadeInUp.duration(250)} className="my-3 items-center px-6">
        <View className="flex-row items-center gap-2 rounded-2xl border border-fb-primary/30 bg-fb-primary/10 px-4 py-2">
          <ShieldCheck size={14} color={FIND_BACK.primaryLight} />
          <Text className="flex-shrink text-center text-xs font-medium text-fb-primary-light">
            {content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const tail = isLastInGroup ? (isMine ? 'rounded-br-md' : 'rounded-bl-md') : '';

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      className={`mb-1 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <View className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
        <View
          className={`rounded-3xl px-4 py-3 ${tail} ${
            isMine ? 'bg-fb-primary' : 'border border-fb-border-glass bg-fb-surface-elevated'
          }`}
        >
          <Text className={`text-base leading-6 ${isMine ? 'text-white' : 'text-fb-content'}`}>
            {content}
          </Text>
        </View>

        {showTime && isLastInGroup && (
          <View className="mt-1 flex-row items-center gap-1 px-1">
            <Text className="text-xs text-fb-muted">{formatTime(timestamp)}</Text>
            {isMine ? (
              isRead ? (
                <CheckCheck size={14} color={FIND_BACK.primaryLight} />
              ) : (
                <Check size={14} color={FIND_BACK.mutedText} />
              )
            ) : null}
          </View>
        )}
      </View>
    </Animated.View>
  );
};
