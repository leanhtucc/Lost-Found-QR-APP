/**
 * Chat Screen
 * Màn hình chat 1-1 giữa owner và finder
 * Supports verified badge display
 */

import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChatHeader, ChatMessages, ChatInput } from './components';
import { ChatMessage } from './types';

type ChatRouteParams = {
  channelId: string;
  itemName: string;
  userName: string;
  userAvatar?: string;
  memberId?: string;
  isVerified?: boolean; // Verified status of the other user
};

// Mock data
const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    senderId: 'owner',
    content: 'Xin chào! Bạn đã nhặt được ví của tôi ạ?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
  {
    id: '2',
    senderId: 'finder',
    content: 'Vâng ạ, tôi nhặt được ở canteen tầng 1!',
    timestamp: new Date(Date.now() - 28 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
  {
    id: '3',
    senderId: 'owner',
    content: 'Cảm ơn bạn nhiều! Trong ví có CCCD và thẻ sinh viên của mình 😭',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
  {
    id: '4',
    senderId: 'finder',
    content: 'Đúng rồi ạ! Mình thấy có thẻ sinh viên PTIT. Bạn yên tâm nhé!',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
  {
    id: '5',
    senderId: 'owner',
    content: 'Mình có thể gặp bạn ở đâu để nhận lại ạ?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
];

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // Get params from route
  const params = (route.params as ChatRouteParams) || {};
  const itemName = params.itemName || 'Đồ vật';
  const userName = params.userName || 'Người dùng';
  const userAvatar = params.userAvatar;
  const isVerified = params.isVerified || false;
  const currentUserId = 'finder';

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          senderId: 'owner',
          content: 'Tuyệt vời! Mình có thể gặp bạn ở sảnh tòa A lúc 5h chiều được không? 🙏',
          timestamp: new Date(),
          isRead: true,
          type: 'text',
        },
      ]);
    }, 2000);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCall = () => {
    Alert.alert('Thông báo', 'Tính năng gọi điện đang được phát triển');
  };

  const handleVideo = () => {
    Alert.alert('Thông báo', 'Tính năng gọi video đang được phát triển');
  };

  const handleMore = () => {
    Alert.alert('Thông báo', 'Tính năng này đang được phát triển');
  };

  const handleAttach = () => {
    Alert.alert('Thông báo', 'Tính năng đính kèm ảnh đang được phát triển');
  };

  const handleEmoji = () => {
    Alert.alert('Thông báo', 'Tính năng emoji đang được phát triển');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <ChatHeader
          userName={userName}
          itemName={itemName}
          isOnline={true}
          isVerified={isVerified}
          avatarUrl={userAvatar}
          onBack={handleBack}
          onCallPress={handleCall}
          onVideoPress={handleVideo}
          onMorePress={handleMore}
        />

        {/* Messages */}
        <ChatMessages messages={messages} currentUserId={currentUserId} isTyping={isTyping} />

        {/* Input */}
        <ChatInput
          value={newMessage}
          onChangeText={setNewMessage}
          onSend={handleSend}
          onAttachPress={handleAttach}
          onEmojiPress={handleEmoji}
        />
      </View>
    </SafeAreaView>
  );
}
