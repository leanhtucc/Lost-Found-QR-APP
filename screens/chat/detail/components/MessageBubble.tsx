/**
 * Message Bubble Component
 * Bubble hiển thị message với styling khác nhau cho sender/receiver
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Check, CheckCheck } from 'lucide-react-native';

interface MessageBubbleProps {
  content: string;
  timestamp: Date;
  isRead: boolean;
  isMine: boolean;
  showTime: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isRead,
  isMine,
  showTime,
  isLastInGroup,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

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
              ? `bg-blue-500 ${isLastInGroup ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
              : `bg-gray-200 ${isLastInGroup ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
          }`}
        >
          <Text className={`text-sm leading-relaxed ${isMine ? 'text-white' : 'text-gray-900'}`}>
            {content}
          </Text>
        </View>

        {/* Time & Read Status */}
        {showTime && isLastInGroup && (
          <View
            className={`flex-row items-center gap-1 mt-1 px-1 ${
              isMine ? 'justify-end' : 'justify-start'
            }`}
          >
            <Text className="text-[10px] text-gray-400">{formatTime(timestamp)}</Text>
            {isMine && (
              <View>
                {isRead ? (
                  <CheckCheck size={14} color="#3b82f6" />
                ) : (
                  <Check size={14} color="#9ca3af" />
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};
