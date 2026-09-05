/**
 * Chat Screen
 * Màn hình chat 1-1 giữa owner và finder
 * Tích hợp ReturnProgressCard, MeetupModal và điều hướng đến Live Map, Bàn giao, Giải ngân, Đánh giá.
 */

import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation';
import { ChatHeader, ChatMessages, ChatInput } from './components';
import { ChatMessage } from './types';
import { useAuthContext } from '@/contexts/AuthContext';
import { useReturnStore } from '@/services/returns/store';
import { useReturnSession } from '@/hooks/useReturnSession';
import { ReturnProgressCard, MeetupModal } from '@/screens/return-flow/components';
import { Lock, FileText } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

type ChatRouteParams = {
  channelId: string;
  itemName: string;
  userName: string;
  userAvatar?: string;
  memberId?: string;
  isVerified?: boolean;
};

type ChatNavProp = StackNavigationProp<RootStackParamList>;

// Initial messages
const INITIAL_MESSAGES: ChatMessage[] = [
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
  const navigation = useNavigation<ChatNavProp>();
  const { user } = useAuthContext();

  // Get params from route
  const params = (route.params as ChatRouteParams) || {};
  const channelId = params.channelId || 'default_channel';
  const itemName = params.itemName || 'Ví da cầm tay';
  const userName = params.userName || 'Marcus';
  const userAvatar = params.userAvatar;
  const isVerified = params.isVerified || false;

  // Return Flow Session
  const { session, currentRole } = useReturnSession({
    channelId,
  });

  const proposeMeetup = useReturnStore(state => state.proposeMeetup);
  const acceptMeetup = useReturnStore(state => state.acceptMeetup);
  const rejectMeetup = useReturnStore(state => state.rejectMeetup);
  const startTracking = useReturnStore(state => state.startTracking);
  const isSubmitting = useReturnStore(state => state.isSubmitting);

  const currentUserId = user?.id || user?.memberId || 'finder_user';

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMeetupModalVisible, setIsMeetupModalVisible] = useState(false);

  const isCompleted = session?.status === 'COMPLETED';

  // Append system message
  const addSystemMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        senderId: 'system',
        content: text,
        timestamp: new Date(),
        isRead: true,
        type: 'text',
      },
    ]);
  };

  const handleSend = () => {
    if (!newMessage.trim() || isCompleted) return;

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

    // Simulate partner response if talking
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const partnerRole = currentRole === 'OWNER' ? 'finder' : 'owner';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          senderId: partnerRole,
          content: 'Cảm ơn bạn! Mình sẽ đến đúng giờ đã hẹn nhé 👍',
          timestamp: new Date(),
          isRead: true,
          type: 'text',
        },
      ]);
    }, 1800);
  };

  const handleProposeMeetupSubmit = async (data: {
    address: string;
    name?: string;
    latitude: number;
    longitude: number;
    scheduledTime: string;
    notes?: string;
  }) => {
    setIsMeetupModalVisible(false);
    const success = await proposeMeetup(data);
    if (success) {
      addSystemMessage(
        `Đã gửi đề xuất gặp tại: ${data.name || data.address} (${data.scheduledTime})`
      );
    }
  };

  const handleAcceptMeetup = async () => {
    const success = await acceptMeetup();
    if (success) {
      addSystemMessage('Điểm hẹn đã được chấp nhận. Bạn có thể bắt đầu di chuyển.');
    }
  };

  const handleRejectMeetup = async () => {
    const success = await rejectMeetup();
    if (success) {
      addSystemMessage('Đề xuất điểm hẹn đã bị hủy hoặc yêu cầu đổi địa điểm khác.');
    }
  };

  const handleOpenLiveMap = async () => {
    if (session) {
      if (session.status === 'MEETUP_ACCEPTED') {
        const started = await startTracking();
        if (!started) return;
      }
      navigation.navigate('LiveTracking', { returnSessionId: session.id });
    }
  };

  const handleOpenHandover = () => {
    if (session) {
      navigation.navigate('HandoverConfirm', { returnSessionId: session.id });
    }
  };

  const handleOpenRewardStatus = () => {
    if (session) {
      navigation.navigate('RewardStatus', { returnSessionId: session.id });
    }
  };

  const handleOpenRateFinder = () => {
    if (session) {
      navigation.navigate('RateFinder', { returnSessionId: session.id });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCall = () => {
    Alert.alert('Liên hệ', 'Vui lòng sử dụng số điện thoại đối tác trong màn hình Live Map');
  };

  const handleMore = () => {
    Alert.alert('Tùy chọn', 'Kênh hỗ trợ an toàn FindBack: 1900-1234');
  };

  const handleAttach = () => {
    Alert.alert('Thông báo', 'Tính năng đính kèm ảnh đang được phát triển');
  };

  const handleEmoji = () => {
    Alert.alert('Thông báo', 'Tính năng emoji đang được phát triển');
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top']}>
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
          onMorePress={handleMore}
        />

        {/* Messages ScrollView */}
        <ChatMessages messages={messages} currentUserId={currentUserId} isTyping={isTyping} />

        {/* Return Progress Card (Pinned above input) */}
        <ReturnProgressCard
          session={session}
          currentRole={currentRole}
          currentUserId={currentUserId}
          onOpenMeetupModal={() => setIsMeetupModalVisible(true)}
          onAcceptMeetup={handleAcceptMeetup}
          onRejectMeetup={handleRejectMeetup}
          onOpenLiveMap={handleOpenLiveMap}
          onOpenHandover={handleOpenHandover}
          onOpenRewardStatus={handleOpenRewardStatus}
          onOpenRateFinder={handleOpenRateFinder}
          isLoading={isSubmitting}
        />

        {/* Chat Input or Read-Only State */}
        {isCompleted ? (
          <View className="border-t border-fb-border-subtle bg-fb-surface px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 mr-2">
              <Lock size={16} color={FIND_BACK.mutedText} />
              <Text className="text-xs text-fb-muted flex-1">
                Phiên hoàn trả đã hoàn tất. Kênh chat chuyển sang chế độ chỉ đọc.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleOpenRewardStatus}
              className="flex-row items-center gap-1 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated px-3 py-1.5"
            >
              <FileText size={14} color={FIND_BACK.primaryLight} />
              <Text className="text-xs font-semibold text-fb-primary-light">Xem biên lai</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ChatInput
            value={newMessage}
            onChangeText={setNewMessage}
            onSend={handleSend}
            onAttachPress={handleAttach}
            onEmojiPress={handleEmoji}
          />
        )}
      </View>

      {/* Meetup Modal */}
      <MeetupModal
        visible={isMeetupModalVisible}
        onClose={() => setIsMeetupModalVisible(false)}
        onSubmit={handleProposeMeetupSubmit}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
}
