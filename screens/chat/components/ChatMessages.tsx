/**
 * Chat Messages Component
 * ScrollView hiển thị list messages với grouping by date
 */

import React, { useRef, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { ChatMessage } from '../types';
import { DateHeader } from './DateHeader';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUserId: string;
  isTyping?: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  isTyping,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
      return groups;
    },
    {} as Record<string, ChatMessage[]>
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <View key={dateKey} className="mb-4">
          {/* Date Header */}
          <DateHeader date={new Date(dateKey)} />

          {/* Messages */}
          {dateMessages.map((msg, index) => {
            const isMine = msg.senderId === currentUserId;
            const prevMsg = dateMessages[index - 1];
            const nextMsg = dateMessages[index + 1];

            // Show time if first message, different sender, or 5+ minutes gap
            const showTime =
              index === 0 ||
              prevMsg.senderId !== msg.senderId ||
              msg.timestamp.getTime() - prevMsg.timestamp.getTime() > 5 * 60 * 1000;

            // Last message in group (next message is from different sender or doesn't exist)
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                timestamp={msg.timestamp}
                isRead={msg.isRead}
                isMine={isMine}
                showTime={showTime}
                isLastInGroup={isLastInGroup}
              />
            );
          })}
        </View>
      ))}

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}
    </ScrollView>
  );
};
