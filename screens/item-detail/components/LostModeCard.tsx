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
      className="bg-white rounded-2xl p-4 shadow-sm"
    >
      {/* Header with Switch */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">Chế độ thất lạc</Text>
          <Text className="text-sm text-gray-500 mt-1">Kích hoạt khi món đồ bị mất</Text>
        </View>

        {/* Custom Switch */}
        <TouchableOpacity
          onPress={handleToggle}
          className={`w-14 h-8 rounded-full p-1 ${isLost ? 'bg-red-500' : 'bg-gray-300'}`}
        >
          <View className={`w-6 h-6 rounded-full bg-white ${isLost ? 'self-end' : 'self-start'}`} />
        </TouchableOpacity>
      </View>

      {/* Lost Message Section */}
      {isLost && (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="pt-4 border-t border-gray-100 space-y-4"
        >
          <View>
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Lời nhắn cho người nhặt được
            </Text>
            <TextInput
              value={lostMessage}
              onChangeText={setLostMessage}
              placeholder="Ví dụ: Tôi rơi ở canteen tầng 1, xin hãy giúp đỡ!"
              placeholderTextColor={FIND_BACK.labelText}
              multiline
              numberOfLines={4}
              className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[100px] text-base"
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isUpdating}
              className={`flex-1 bg-gradient-to-r from-blue-500 to-blue-600 py-3 rounded-xl items-center justify-center ${
                isUpdating ? 'opacity-50' : ''
              }`}
            >
              {isUpdating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Cập nhật trạng thái</Text>
              )}
            </TouchableOpacity>

            {onOpenChat && (
              <TouchableOpacity
                onPress={onOpenChat}
                className="bg-blue-50 px-4 py-3 rounded-xl items-center justify-center active:bg-blue-100"
              >
                <MessageCircle size={20} color={FIND_BACK.primary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
