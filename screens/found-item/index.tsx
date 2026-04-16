/**
 * Found Item Screen
 * Màn hình hiển thị thông tin đồ vật đã tìm thấy (Finder Flow)
 * Hiển thị thông tin chủ sở hữu với trust metrics
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  MessageCircle,
  Info,
  Star,
  Package,
  BadgeCheck,
  Award,
} from 'lucide-react-native';
import type { ScanItemLostResponse, ScanItemSafeResponse } from '@/types/item';
import { CATEGORY_CONFIG } from '@/types/item';
import { getUserLevel, getLevelInfo } from '@/services/auth/types';

type ScanItemResponse = ScanItemLostResponse | ScanItemSafeResponse;

export default function FoundItemScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { scanData } = route.params as { scanData: ScanItemResponse };

  const item = scanData.item_info;
  const ownerInfo = item.owner_info;
  const isLost = item.status === 'lost';
  const categoryConfig = CATEGORY_CONFIG[item.category];

  // Calculate owner level
  const trustScore = ownerInfo.trust_score || 0;
  const userLevel = getUserLevel(trustScore);
  const levelInfo = getLevelInfo(userLevel);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContactOwner = () => {
    if (!isLost) {
      Alert.alert('Thông báo', 'Đồ vật này đang ở trạng thái an toàn');
      return;
    }

    // TODO: Navigate to chat with memberId
    const { memberId } = ownerInfo;
    Alert.alert('Mở chat', `Đang mở chat với chủ sở hữu (memberId: ${memberId})`);
    // navigation.navigate('Chat', { memberId, itemId: item.id, itemName: item.name });
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-indigo-50 to-white" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-3 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">Thông tin đồ vật</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {isLost ? 'Đồ vật đang bị mất' : 'Đồ vật đang an toàn'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className={`mb-5 p-4 rounded-2xl ${
            isLost ? 'bg-red-100 border border-red-200' : 'bg-green-100 border border-green-200'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isLost ? 'bg-red-200' : 'bg-green-200'
              }`}
            >
              <Info size={20} color={isLost ? '#dc2626' : '#16a34a'} />
            </View>
            <View className="flex-1">
              <Text className={`font-bold ${isLost ? 'text-red-900' : 'text-green-900'}`}>
                {isLost ? 'Đồ vật đang bị mất!' : 'Đồ vật đang an toàn'}
              </Text>
              <Text className={`text-sm mt-1 ${isLost ? 'text-red-700' : 'text-green-700'}`}>
                {isLost
                  ? 'Vui lòng liên hệ với chủ sở hữu để trả lại'
                  : 'Đồ vật này hiện đang được chủ sở hữu giữ an toàn'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Item Info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          className="mb-5 bg-white rounded-3xl p-6 shadow-md"
        >
          <Text className="text-lg font-bold text-gray-900 mb-4">Thông tin đồ vật</Text>

          <View className="flex-row items-center gap-4 mb-4">
            <View
              className={`w-16 h-16 rounded-2xl ${categoryConfig.bgColor} items-center justify-center`}
            >
              <Text className="text-3xl">{categoryConfig.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{item.name}</Text>
              <Text className={`text-sm mt-1 ${categoryConfig.textColor} font-medium`}>
                {categoryConfig.label}
              </Text>
            </View>
          </View>

          {isLost && 'lost_message' in item && item.lost_message && (
            <View className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
              <Text className="text-xs font-semibold text-red-900 mb-2">
                Lời nhắn từ chủ sở hữu:
              </Text>
              <Text className="text-sm text-red-800">{item.lost_message}</Text>
            </View>
          )}
        </Animated.View>

        {/* Owner Info Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          className="mb-5 bg-white rounded-3xl p-6 shadow-md border border-indigo-100"
        >
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center">
              <Info size={18} color="#4f46e5" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Chủ sở hữu</Text>
          </View>

          {/* Owner Profile */}
          <View className="flex-row items-center gap-4 mb-5">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-2 border-indigo-200">
              {ownerInfo.avatar ? (
                <Image
                  source={{ uri: ownerInfo.avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-2xl">👤</Text>
              )}
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
                  {ownerInfo.display_name}
                </Text>
                {ownerInfo.is_verified && <BadgeCheck size={20} color="#3b82f6" fill="#3b82f6" />}
              </View>
              <View className="flex-row items-center gap-2">
                <Award size={14} color="#4f46e5" />
                <Text className="text-sm text-indigo-600 font-semibold">
                  Thành viên {levelInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Trust Metrics */}
          <View className="flex-row gap-3 bg-gray-50 rounded-2xl p-4">
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1 mb-1">
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-xs font-medium text-amber-700">Uy tín</Text>
              </View>
              <Text className="text-xl font-bold text-amber-900">{trustScore}</Text>
            </View>

            <View className="w-px bg-gray-200" />

            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1 mb-1">
                <Package size={16} color="#10b981" />
                <Text className="text-xs font-medium text-emerald-700">Đã trả</Text>
              </View>
              <Text className="text-xl font-bold text-emerald-900">
                {ownerInfo.total_returned || 0}
              </Text>
            </View>
          </View>

          {/* Trust Level Info */}
          <View className="mt-4 p-3 bg-indigo-50 rounded-xl">
            <Text className="text-xs text-indigo-700 text-center">
              Người dùng này có độ uy tín{' '}
              <Text className="font-bold">
                {trustScore >= 80 ? 'rất cao' : trustScore >= 60 ? 'cao' : 'trung bình'}
              </Text>
              x
            </Text>
          </View>
        </Animated.View>

        {/* Contact Button */}
        {isLost && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-5">
            <TouchableOpacity
              onPress={handleContactOwner}
              className="bg-indigo-600 rounded-2xl p-5 shadow-lg active:bg-indigo-700"
            >
              <View className="flex-row items-center justify-center gap-3">
                <MessageCircle size={24} color="#ffffff" />
                <Text className="text-white text-lg font-bold">Nhắn tin cho chủ sở hữu</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Info Note */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)} className="mb-5">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <Text className="text-xs text-blue-800 text-center">
              {isLost
                ? 'Khi bạn nhắn tin, chủ sở hữu sẽ nhận được thông báo ngay lập tức'
                : 'Đồ vật này đang an toàn với chủ sở hữu'}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
