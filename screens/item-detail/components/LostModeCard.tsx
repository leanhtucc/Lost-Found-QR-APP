/**
 * Lost Mode Card Component
 * Card quản lý chế độ thất lạc và tin nhắn cho người nhặt được
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { Item } from '@/types/item';
import { FIND_BACK } from '@constants/theme';

interface LostModeCardProps {
  item: Item;
  onToggleLost: () => void;
  onUpdateMessage: (message: string) => Promise<void>;
  onOpenChat?: () => void;
}

export const LostModeCard: React.FC<LostModeCardProps> = ({
  item,
  onToggleLost,
  onUpdateMessage,
  onOpenChat,
}) => {
  const [lostMessage, setLostMessage] = useState(item.lostMessage || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const isLost = item.status === 'LOST' || item.status === 'PENDING_PAYMENT';

  const handleToggle = () => {
    Alert.alert(
      isLost ? 'Đánh dấu an toàn' : 'Đánh dấu thất lạc',
      isLost
        ? 'Bạn đã tìm lại được món đồ?'
        : 'Món đồ của bạn bị thất lạc? Kích hoạt chế độ này để nhận thông báo khi có người tìm thấy.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: onToggleLost },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!lostMessage.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lời nhắn');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateMessage(lostMessage);
      Alert.alert('Thành công', 'Đã cập nhật lời nhắn');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật lời nhắn');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(200)}
      className="rounded-3xl border border-fb-border-subtle bg-fb-surface p-5"
    >
      {/* Header with Switch */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-base font-bold text-fb-content">Chế độ thất lạc</Text>
          <Text className="mt-1 text-sm text-fb-muted">
            Bật để cộng đồng có thể hỗ trợ tìm lại.
          </Text>
        </View>

        {/* Custom Switch */}
        <TouchableOpacity
          onPress={handleToggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: isLost }}
          className={`h-8 w-14 rounded-full p-1 ${isLost ? 'bg-fb-danger' : 'bg-fb-surface-elevated'}`}
        >
          <View
            className={`h-6 w-6 rounded-full bg-fb-content ${isLost ? 'self-end' : 'self-start'}`}
          />
        </TouchableOpacity>
      </View>

      {/* Lost Message Section */}
      {isLost && (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="space-y-4 border-t border-fb-border-subtle pt-4"
        >
          <View>
            <Text className="mb-2 text-sm font-semibold text-fb-content">
              Lời nhắn cho người nhặt được
            </Text>
            <TextInput
              value={lostMessage}
              onChangeText={setLostMessage}
              placeholder="Ví dụ: Tôi rơi ở canteen tầng 1, xin hãy giúp đỡ!"
              placeholderTextColor={FIND_BACK.labelText}
              multiline
              numberOfLines={4}
              className="min-h-[112px] rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated p-4 text-base text-fb-content"
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isUpdating}
              className={`flex-1 items-center justify-center rounded-2xl bg-fb-primary py-3 ${
                isUpdating ? 'opacity-50' : ''
              }`}
            >
              {isUpdating ? (
                <ActivityIndicator color={FIND_BACK.bodyText} />
              ) : (
                <Text className="font-semibold text-fb-content">Cập nhật trạng thái</Text>
              )}
            </TouchableOpacity>

            {onOpenChat && (
              <TouchableOpacity
                onPress={onOpenChat}
                accessibilityLabel="Mở cuộc trò chuyện"
                className="items-center justify-center rounded-2xl border border-fb-primary/25 bg-fb-primary/10 px-4 py-3"
              >
                <MessageCircle size={20} color={FIND_BACK.primaryLight} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
