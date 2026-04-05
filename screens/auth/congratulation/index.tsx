import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { congratulationImage } from '@assets';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ResponsiveContainer className="flex-1 w-full justify-between" variant="form">
        {/* Content Container */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Congratulation Image */}
          <View className="mb-8">
            <Image source={congratulationImage} className="w-72 h-56" resizeMode="contain" />
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 text-center mb-6">Chúc mừng!</Text>

          {/* Description */}
          <Text className="text-base text-gray-500 text-center leading-6 mb-4">
            Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể đăng nhập và bắt đầu sử
            dụng ứng dụng.
          </Text>

          {/* Thank you text */}
          <Text className="text-base text-gray-700 text-center font-medium">
            Cảm ơn bạn đã đăng ký với chúng tôi!
          </Text>
        </View>

        {/* Bottom Sign In Link */}
        <View className="pb-12 px-6 items-center">
          <TouchableOpacity onPress={handleSignIn}>
            <Text className="text-lg font-semibold text-blue-600">Đăng nhập tại đây</Text>
          </TouchableOpacity>
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

export default CongratulationScreen;
