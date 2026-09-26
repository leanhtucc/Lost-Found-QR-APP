import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Keyboard as KeyboardIcon, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIND_BACK } from '@constants/theme';
import { cn } from '@/lib/cn';

interface ManualInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isProcessing: boolean;
  error?: string | null;
}

const MAX_INPUT_LENGTH = 500;

export const ManualInputModal = ({
  visible,
  onClose,
  onSubmit,
  isProcessing,
  error,
}: ManualInputModalProps) => {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');

  // Xóa dữ liệu khi đóng modal
  useEffect(() => {
    if (!visible) {
      setInputValue('');
    }
  }, [visible]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !isProcessing) {
      onSubmit(trimmed);
      Keyboard.dismiss();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
            disabled={isProcessing}
          />

          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(90)}
            exiting={SlideOutDown}
            style={{
              backgroundColor: FIND_BACK.surface,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
            className="rounded-t-3xl border-t border-white/12 px-6 pt-4"
          >
            {/* Thanh kéo ngang */}
            <View className="items-center mb-6">
              <View className="w-12 h-1 rounded-full bg-white/20" />
            </View>

            {/* Tiêu đề */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center space-x-2 gap-2">
                <KeyboardIcon size={24} color={FIND_BACK.primary} />
                <Text className="text-white text-xl font-bold">Nhập mã QR</Text>
              </View>
              <TouchableOpacity onPress={onClose} disabled={isProcessing}>
                <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                  <X size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <Text className="text-white/60 text-sm mb-6">
              Nhập mã ID hoặc liên kết để tìm kiếm vật phẩm
            </Text>

            {/* Trường nhập dữ liệu (Glassmorphism) */}
            <View
              className={cn(
                'flex-row items-center bg-white/5 border rounded-2xl px-4 h-14 mb-2',
                error ? 'border-red-500/50' : 'border-white/10'
              )}
            >
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Nhập mã ID hoặc liên kết..."
                placeholderTextColor={FIND_BACK.labelText}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleSubmit}
                editable={!isProcessing}
                maxLength={MAX_INPUT_LENGTH}
                className="flex-1 text-white text-base"
                style={{ height: '100%' }}
              />
            </View>

            {/* Thông báo lỗi */}
            {error && <Text className="text-red-400 text-sm mb-4 px-1">{error}</Text>}

            {/* Nút hành động */}
            <View className="mt-6 gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={!inputValue.trim() || isProcessing}
              >
                <LinearGradient
                  colors={[FIND_BACK.primaryLight, FIND_BACK.primary, FIND_BACK.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className={cn(
                    'h-14 rounded-full flex-row items-center justify-center space-x-2 gap-2',
                    (!inputValue.trim() || isProcessing) && 'opacity-50'
                  )}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Search size={20} color="white" />
                      <Text className="text-white font-semibold text-base">Tìm kiếm</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                disabled={isProcessing}
                className="h-14 rounded-full items-center justify-center border border-white/20"
              >
                <Text className="text-white font-semibold text-base">Đóng</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
