/**
 * Chat List Screen
 * Màn hình danh sách các cuộc hội thoại
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { getInbox } from '@/services/chat';
import { Conversation } from '@/types/chat';
import { ChatListHeader, ConversationCard, EmptyChat, LoadingChat } from './components';
import { FIND_BACK } from '@constants/theme';

type ChatListNavigationProp = StackNavigationProp<RootStackParamList>;

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListNavigationProp>();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getInbox();
      setConversations(data.channels);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to empty for now
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, []);

  const handleConversationPress = (conversation: Conversation) => {
    const parentNavigation = navigation.getParent<ChatListNavigationProp>();
    (parentNavigation ?? navigation).navigate('Chat', {
      channelId: conversation.id,
      itemName: conversation.itemName,
      userName: conversation.userName,
      userAvatar: conversation.userAvatar,
      isVerified: conversation.isVerified,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return <LoadingChat />;
  }

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top']}>
      {/* Header */}
      <ChatListHeader
        onBack={handleBack}
        unreadCount={conversations.filter(c => c.unreadCount > 0).length}
      />

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <EmptyChat />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[FIND_BACK.primary]}
              tintColor={FIND_BACK.primary}
            />
          }
        >
          <View className="px-4 py-3">
            {conversations.map((conversation, index) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                index={index}
                onPress={() => handleConversationPress(conversation)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ChatListScreen;
