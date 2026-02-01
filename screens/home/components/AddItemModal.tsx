/**
 * AddItemModal Component
 * Modal thêm món đồ mới
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Laptop, Wallet, Key, Smartphone, Briefcase, Package } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { ItemCategory } from '@/types/item';
import { LucideIcon } from 'lucide-react-native';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, category: ItemCategory) => void;
}

// Category options
const CATEGORIES: { value: ItemCategory; label: string; Icon: LucideIcon }[] = [
  { value: 'laptop', label: 'Laptop', Icon: Laptop },
  { value: 'wallet', label: 'Ví', Icon: Wallet },
  { value: 'keys', label: 'Chìa khóa', Icon: Key },
  { value: 'phone', label: 'Điện thoại', Icon: Smartphone },
  { value: 'bag', label: 'Túi xách', Icon: Briefcase },
  { value: 'other', label: 'Khác', Icon: Package },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim(), category);
      // Reset form
      setName('');
      setCategory('other');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setCategory('other');
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Backdrop */}
        <Animated.View entering={FadeIn.duration(200)} className="absolute inset-0 bg-black/50">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-900">Thêm món đồ mới</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="space-y-6">
            {/* Name Input */}
            <View>
              <Text className="text-sm font-medium text-gray-900 mb-2">Tên món đồ</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="VD: Laptop Dell Vostro"
                placeholderTextColor="#9ca3af"
                className="h-12 px-4 rounded-xl bg-gray-100 text-gray-900"
              />
            </View>

            {/* Category Selection */}
            <View>
              <Text className="text-sm font-medium text-gray-900 mb-3">Danh mục</Text>
              <View className="flex-row flex-wrap gap-3">
                {CATEGORIES.map(({ value, label, Icon }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setCategory(value)}
                    className={`w-[30%] p-4 rounded-2xl items-center border-2 ${
                      category === value
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    <Icon size={24} color={category === value ? '#3b82f6' : '#6b7280'} />
                    <Text
                      className={`text-xs font-medium mt-2 ${
                        category === value ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!name.trim()}
              className={`h-12 rounded-xl items-center justify-center ${
                name.trim() ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <Text className="text-base font-semibold text-white">Thêm món đồ</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom safe area */}
          <View className="h-6" />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddItemModal;
