/**
 * User Info Card Component
 * Hiển thị thông tin cá nhân của user - Professional style
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, CreditCard, Mail, Phone, MapPin, FileText } from 'lucide-react-native';

interface UserInfoCardProps {
  fullName: string;
  memberId: string; // Changed from studentId
  email: string;
  phone: string;
  address?: string;
  bio?: string;
}

interface InfoRowProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <View className="flex-row items-center gap-4">
    <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center">
      <Icon size={22} color="#4f46e5" />
    </View>
    <View className="flex-1">
      <Text className="text-xs text-gray-500 font-medium">{label}</Text>
      <Text className="font-semibold text-gray-900 mt-1" numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  fullName,
  memberId,
  email,
  phone,
  address,
  bio,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(250)}
      className="mx-4 bg-white rounded-3xl p-6 shadow-sm"
    >
      <Text className="text-lg font-bold text-gray-900 mb-5">Thông tin cá nhân</Text>

      <View className="space-y-5">
        <InfoRow icon={User} label="Họ và tên" value={fullName} />

        <View className="h-px bg-gray-100" />

        <InfoRow icon={CreditCard} label="Mã thành viên" value={memberId} />

        <View className="h-px bg-gray-100" />

        <InfoRow icon={Mail} label="Email" value={email} />

        <View className="h-px bg-gray-100" />

        <InfoRow icon={Phone} label="Số điện thoại" value={phone || 'Chưa cập nhật'} />

        {address && (
          <>
            <View className="h-px bg-gray-100" />
            <InfoRow icon={MapPin} label="Địa chỉ" value={address} />
          </>
        )}

        {bio && (
          <>
            <View className="h-px bg-gray-100" />
            <InfoRow icon={FileText} label="Giới thiệu" value={bio} />
          </>
        )}
      </View>
    </Animated.View>
  );
};
