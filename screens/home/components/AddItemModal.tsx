/**
 * AddItemModal Component
 * Modal thêm món đồ mới với UI đẹp và categories từ BE
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown, FadeInDown } from 'react-native-reanimated';
import { ItemCategory } from '@/types/item';
import { itemsApi } from '@/services/items';
import { CATEGORY_OPTIONS, CATEGORY_NAMES_VI, CATEGORY_EMOJI } from '@/constants/categories';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, category: ItemCategory) => void;
}

interface CategoryOption {
  value: ItemCategory;
  label: string;
  icon: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');
  const [categories, setCategories] = useState<CategoryOption[]>(CATEGORY_OPTIONS);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  console.log('🎯 [AddItemModal] Render - categories state:', categories);
  console.log('🎯 [AddItemModal] Categories length:', categories.length);

  // Load categories from API when modal opens
  useEffect(() => {
    console.log('👀 [AddItemModal] useEffect triggered - isOpen:', isOpen);
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      console.log('🔄 [AddItemModal] Loading categories from API...');
      setLoadingCategories(true);
      setCategoryError(null);

      const apiCategories = await itemsApi.getCategories();
      console.log('📦 [AddItemModal] API response:', apiCategories);
      console.log('📊 [AddItemModal] API categories length:', apiCategories?.length);

      // Transform API data (array of strings) to CategoryOption format
      if (apiCategories && apiCategories.length > 0) {
        // Check if API returns objects or strings
        const firstItem = apiCategories[0];

        if (typeof firstItem === 'string') {
          // API returns array of strings, need to transform
          console.log('🔄 [AddItemModal] Transforming string array to CategoryOption objects');
          const stringCategories = apiCategories as unknown as string[];
          const transformedCategories = stringCategories.map(categoryValue => ({
            value: categoryValue as ItemCategory,
            label: CATEGORY_NAMES_VI[categoryValue as ItemCategory] || categoryValue,
            icon: CATEGORY_EMOJI[categoryValue as ItemCategory] || '📦',
          }));
          console.log('✅ [AddItemModal] Transformed categories:', transformedCategories);
          setCategories(transformedCategories);
        } else {
          // API already returns correct format
          console.log('✅ [AddItemModal] Using API categories as-is');
          setCategories(apiCategories);
        }
      } else {
        // API returned empty array, use local categories
        console.log('⚠️ [AddItemModal] API returned empty, using local CATEGORY_OPTIONS');
        console.log('📋 [AddItemModal] Local categories:', CATEGORY_OPTIONS);
        setCategories(CATEGORY_OPTIONS);
      }

      console.log('✅ [AddItemModal] Categories loaded successfully');
    } catch (error) {
      console.error('❌ [AddItemModal] Failed to load categories:', error);
      setCategoryError('Không thể tải danh mục');
      // Fallback to local categories
      console.log('🔄 [AddItemModal] Fallback to local categories');
      setCategories(CATEGORY_OPTIONS);
    } finally {
      setLoadingCategories(false);
    }
  };

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
    setCategoryError(null);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Backdrop */}
        <Animated.View entering={FadeIn.duration(200)} className="absolute inset-0 bg-black/60">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl"
          style={{ maxHeight: '85%' }}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View className="p-6 pb-8">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">Thêm món đồ mới</Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Thêm vật phẩm để bảo vệ tài sản của bạn
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View className="space-y-6">
                {/* Name Input */}
                <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Tên món đồ <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="VD: Laptop Dell Vostro"
                    placeholderTextColor="#9ca3af"
                    className="h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-base"
                    style={{ fontSize: 15 }}
                  />
                </Animated.View>

                {/* Category Selection */}
                <Animated.View entering={FadeInDown.duration(300).delay(200)}>
                  <Text className="text-sm font-semibold text-gray-900 mb-3">
                    Danh mục <Text className="text-red-500">*</Text>
                  </Text>

                  {/* Category Error */}
                  {categoryError && (
                    <View className="flex-row items-center gap-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle size={16} color="#f59e0b" />
                      <Text className="flex-1 text-xs text-amber-700">{categoryError}</Text>
                      <TouchableOpacity onPress={loadCategories}>
                        <Text className="text-xs font-semibold text-amber-600">Thử lại</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Loading Categories */}
                  {loadingCategories ? (
                    <View className="py-8 items-center justify-center">
                      <ActivityIndicator size="large" color="#3b82f6" />
                      <Text className="text-sm text-gray-500 mt-2">Đang tải danh mục...</Text>
                    </View>
                  ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {categories.map(({ value, label, icon }, index) => {
                        const isSelected = category === value;
                        return (
                          <Animated.View
                            key={value}
                            entering={FadeInDown.duration(300).delay(250 + index * 30)}
                            style={{ width: '21.5%' }}
                          >
                            <TouchableOpacity
                              onPress={() => setCategory(value)}
                              activeOpacity={0.7}
                              className={`aspect-square rounded-2xl items-center justify-center border-2 ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <Text className="text-3xl mb-2">{icon}</Text>
                              <Text
                                className={`text-xs font-semibold text-center ${
                                  isSelected ? 'text-blue-600' : 'text-gray-600'
                                }`}
                                numberOfLines={1}
                              >
                                {label}
                              </Text>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                  )}
                </Animated.View>

                {/* Submit Button */}
                <Animated.View entering={FadeInDown.duration(300).delay(500)}>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!name.trim()}
                    activeOpacity={0.8}
                    className={`h-14 rounded-2xl items-center justify-center shadow-lg ${
                      name.trim() ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <Text className="text-base font-bold text-white">
                      {name.trim() ? '✨ Thêm món đồ' : 'Nhập tên món đồ'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom safe area */}
          <View className="h-6" />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddItemModal;
