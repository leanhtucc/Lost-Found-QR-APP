/**
 * Chat Input Component
 * Input bar với attachment và send buttons
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Image, Send, Smile } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachPress?: () => void;
  onEmojiPress?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onAttachPress,
  onEmojiPress,
}) => {
  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="border-t border-fb-border-subtle bg-fb-surface px-4 py-3">
        <View className="flex-row items-center gap-2">
          {/* Attach Button */}
          {onAttachPress && (
            <TouchableOpacity
              onPress={onAttachPress}
              accessibilityLabel="Đính kèm ảnh"
              className="h-11 w-11 items-center justify-center rounded-2xl bg-fb-surface-elevated"
            >
              <Image size={20} color={FIND_BACK.mutedText} />
            </TouchableOpacity>
          )}

          {/* Input */}
          <View className="flex-1 relative">
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={FIND_BACK.mutedText}
              className="max-h-28 min-h-[44px] rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated px-4 pr-10 text-fb-content"
              multiline
              maxLength={1000}
            />
            {onEmojiPress && (
              <TouchableOpacity onPress={onEmojiPress} className="absolute right-3 top-1/2 -mt-2.5">
                <Smile size={20} color={FIND_BACK.mutedText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!value.trim()}
            accessibilityRole="button"
            accessibilityLabel="Gửi tin nhắn"
            className={`h-11 w-11 items-center justify-center rounded-2xl ${
              value.trim() ? 'bg-fb-primary' : 'bg-fb-surface-elevated'
            }`}
          >
            <Send size={19} color={value.trim() ? FIND_BACK.bodyText : FIND_BACK.labelText} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
