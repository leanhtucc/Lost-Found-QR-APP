import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { useAuth } from '@hooks/useAuth';
import { RegisterForm } from './components/RegisterForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { isLoading, register } = useAuth();

  /**
   * Xử lý đăng ký:
   * 1. Gọi API backend /register
   * 2. Nếu thành công → chuyển sang màn CodeVerify kèm số điện thoại
   *    (Firebase OTP sẽ được gửi tại màn CodeVerify)
   */
  const handleRegister = async (
    displayName: string,
    email: string,
    password: string,
    phoneNumber: string,
    photoURL?: string
  ) => {
    const success = await register(displayName, email, password, phoneNumber, photoURL);
    if (success) {
      // Chuyển sang màn OTP, truyền số điện thoại để gửi SMS
      navigation.navigate('CodeVerify', { phoneNumber });
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E13" />

      {/* Header */}
      <View className="flex-row items-center px-4 h-14 mt-2">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center active:opacity-70"
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white mr-10 tracking-wider">
          FindBack
        </Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <ResponsiveContainer className="flex-1 px-6 mt-4 justify-center" variant="form">
          {/* Step Indicator */}
          <View className="mb-6">
            <Text className="text-[10px] font-bold text-[#7C6AF6] tracking-widest mb-2">
              BƯỚC 1/2
            </Text>
            <View className="flex-row h-1 bg-[#1A1A24] rounded-full overflow-hidden">
              <View className="flex-1 bg-[#7C6AF6] rounded-full" />
              <View className="flex-1" />
            </View>
          </View>

          {/* Titles */}
          <View className="mb-8">
            <Text className="text-[28px] font-bold text-white mb-2">Thông tin cá nhân</Text>
            <Text className="text-[15px] text-[#A1A1AA] leading-6">
              Hãy bắt đầu bằng cách tạo hồ sơ an toàn của bạn.
            </Text>
          </View>

          {/* Register Form */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          {/* Terms text */}
          <Text className="text-center text-[11px] text-[#A1A1AA] mt-4 mb-2 px-4 leading-4">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng
            tôi.
          </Text>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
