/**
 * Chat composer: attach, pill input, circular send. All targets >= 44pt.
 */

import React from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ImagePlus, SendHorizontal, Smile } from 'lucide-react-native';
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
  const canSend = value.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="border-t border-fb-border-glass bg-fb-canvas px-3 pb-3 pt-2">
        <View className="flex-row items-end gap-2">
          {onAttachPress ? (
            <Pressable
              onPress={onAttachPress}
              accessibilityRole="button"
              accessibilityLabel="Đính kèm ảnh"
              className="h-12 w-12 items-center justify-center rounded-full bg-fb-surface-elevated active:opacity-70"
            >
              <ImagePlus size={20} color={FIND_BACK.mutedText} />
            </Pressable>
          ) : null}

          <View className="min-h-[48px] flex-1 flex-row items-center rounded-3xl border border-fb-border-glass bg-fb-surface px-4">
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder="Nhập tin nhắn..."
              accessibilityLabel="Nhập tin nhắn"
              placeholderTextColor={FIND_BACK.labelText}
              selectionColor={FIND_BACK.primaryLight}
              className="max-h-28 min-h-[48px] flex-1 py-3 text-base text-fb-content"
              multiline
              maxLength={1000}
            />
            {onEmojiPress ? (
              <Pressable
                onPress={onEmojiPress}
                accessibilityRole="button"
                accessibilityLabel="Chọn emoji"
                hitSlop={8}
                className="ml-2 h-11 w-8 items-center justify-center"
              >
                <Smile size={20} color={FIND_BACK.mutedText} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => canSend && onSend()}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Gửi tin nhắn"
            accessibilityState={{ disabled: !canSend }}
            className={`h-12 w-12 items-center justify-center rounded-full ${
              canSend ? 'bg-fb-primary active:bg-fb-primary-dark' : 'bg-fb-surface-elevated'
            }`}
          >
            <SendHorizontal size={20} color={canSend ? '#FFFFFF' : FIND_BACK.labelText} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
