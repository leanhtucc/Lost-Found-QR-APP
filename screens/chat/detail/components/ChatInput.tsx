/**
 * Chat Input Component
 * Input bar với attachment và send buttons
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Image, Send, Smile } from 'lucide-react-native';

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
      <View className="bg-white border-t border-gray-100 px-4 py-3">
        <View className="flex-row items-center gap-2">
          {/* Attach Button */}
          {onAttachPress && (
            <TouchableOpacity
              onPress={onAttachPress}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
            >
              <Image size={20} color="#6b7280" />
            </TouchableOpacity>
          )}

          {/* Input */}
          <View className="flex-1 relative">
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#9ca3af"
              className="h-11 rounded-full bg-gray-100 px-4 pr-10 text-gray-900"
              multiline
              maxLength={1000}
            />
            {onEmojiPress && (
              <TouchableOpacity onPress={onEmojiPress} className="absolute right-3 top-1/2 -mt-2.5">
                <Smile size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!value.trim()}
            className={`w-11 h-11 rounded-full items-center justify-center shadow-lg ${
              value.trim() ? 'bg-blue-500 shadow-blue-500/25' : 'bg-gray-300 shadow-transparent'
            }`}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
