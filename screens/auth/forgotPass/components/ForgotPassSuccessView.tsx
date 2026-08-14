import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ForgotPassSuccessViewProps {
  email: string;
  onLogin: () => void;
}

export const ForgotPassSuccessView: React.FC<ForgotPassSuccessViewProps> = ({ email, onLogin }) => {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl border border-fb-secondary/20 bg-fb-secondary/10">
        <MailCheck size={36} color={FIND_BACK.secondary} />
      </View>

      <Text className="mb-4 text-center text-2xl font-bold text-fb-content">
        Kiểm tra email của bạn
      </Text>

      <Text className="mb-8 text-center text-base leading-6 text-fb-muted">
        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{' '}
        <Text className="font-semibold text-fb-content">{email}</Text>
      </Text>

      <Text className="mb-8 text-center text-sm text-fb-label">
        Liên kết sẽ hết hạn sau 30 phút
      </Text>

      <TouchableOpacity
        onPress={onLogin}
        accessibilityRole="button"
        className="rounded-2xl bg-fb-primary px-8 py-4"
      >
        <Text className="text-base font-semibold text-fb-content">Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};
