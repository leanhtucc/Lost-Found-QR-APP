import { logo } from '@/assets';
import React from 'react';
import { View, Text, Image } from 'react-native';

export const AuthHeader: React.FC = () => {
  return (
    <View className="items-center mb-8">
      <Image source={logo} className="w-20 h-20 mb-4" resizeMode="contain" />
      <Text className="text-3xl font-bold text-gray-900 mb-2">PTIT Lost & Found</Text>
      <Text className="text-sm text-gray-600">Hệ thống quản lý tài sản thông minh</Text>
    </View>
  );
};
