import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ResetPassSuccessViewProps {
  onLogin: () => void;
}

export const ResetPassSuccessView: React.FC<ResetPassSuccessViewProps> = ({ onLogin }) => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-20 h-20 rounded-full bg-fb-secondary/20 items-center justify-center mb-6">
        <Text className="text-4xl">✅</Text>
      </View>

      <Text className="text-2xl font-bold text-white text-center mb-4">
        Đặt lại mật khẩu thành công!
      </Text>

      <Text className="text-base text-fb-muted text-center leading-6 mb-8">
        Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
      </Text>

      <TouchableOpacity onPress={onLogin} className="bg-fb-primary py-4 px-8 rounded-full">
        <Text className="text-white text-base font-semibold">Đăng nhập ngay</Text>
      </TouchableOpacity>
    </View>
  );
};
