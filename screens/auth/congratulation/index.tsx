import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { congratulationImage } from '@assets';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { FIND_BACK } from '@constants/theme';

type CongratulationNavigationProp = StackNavigationProp<RootStackParamList>;

export const CongratulationScreen: React.FC = () => {
  const navigation = useNavigation<CongratulationNavigationProp>();

  const handleSignIn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral">
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />

      <ResponsiveContainer className="flex-1 w-full justify-between" variant="form">
        {/* Content Container */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Congratulation Image */}
          <View className="mb-8 rounded-3xl border border-fb-border-subtle bg-fb-surface p-4">
            <Image source={congratulationImage} className="w-72 h-56" resizeMode="contain" />
          </View>

          {/* Title */}
          <Text className="mb-4 text-center text-3xl font-bold text-fb-content">Chúc mừng!</Text>

          {/* Description */}
          <Text className="mb-4 text-center text-base leading-6 text-fb-muted">
            Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể đăng nhập và bắt đầu sử
            dụng ứng dụng.
          </Text>

          {/* Thank you text */}
          <Text className="text-center text-base font-medium text-fb-content">
            Cảm ơn bạn đã đăng ký với chúng tôi!
          </Text>
        </View>

        {/* Bottom Sign In Link */}
        <View className="pb-12 px-6 items-center">
          <TouchableOpacity
            onPress={handleSignIn}
            accessibilityRole="button"
            className="w-full items-center rounded-2xl bg-fb-primary py-4"
          >
            <Text className="text-base font-semibold text-fb-content">Tiếp tục đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

export default CongratulationScreen;
