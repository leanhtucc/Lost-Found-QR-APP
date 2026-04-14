import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ForgotPassSuccessViewProps {
  email: string;
  onLogin: () => void;
}

export const ForgotPassSuccessView: React.FC<ForgotPassSuccessViewProps> = ({ email, onLogin }) => {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
        <Text className="text-4xl">✉️</Text>
      </View>

      <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
        Kiểm tra email của bạn
      </Text>

      <Text className="text-base text-gray-500 text-center leading-6 mb-8">
        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{' '}
        <Text className="font-semibold text-gray-700">{email}</Text>
      </Text>

      <Text className="text-sm text-gray-400 text-center mb-8">Link sẽ hết hạn sau 30 phút</Text>

      <TouchableOpacity onPress={onLogin} className="bg-blue-600 py-4 px-8 rounded-full">
        <Text className="text-white text-base font-semibold">Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};
