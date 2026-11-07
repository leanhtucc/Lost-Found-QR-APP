import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Check } from 'lucide-react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '@navigation/index';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { Button } from '@components/atoms/Button';
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

      <ResponsiveContainer className="w-full flex-1 justify-between" variant="form">
        <View className="flex-1 items-center justify-center px-8">
          <LinearGradient
            colors={['rgba(46, 204, 139, 0.22)', 'rgba(46, 204, 139, 0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
          />

          <Animated.View
            entering={ZoomIn.duration(500).springify().damping(12)}
            className="mb-8 h-28 w-28 items-center justify-center rounded-full bg-fb-secondary/15"
            style={{ borderWidth: 1, borderColor: 'rgba(46, 204, 139, 0.35)' }}
          >
            <Check size={52} color={FIND_BACK.secondary} strokeWidth={3} />
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(150).duration(450)}
            className="mb-3 text-center text-[30px] font-bold leading-[38px] text-fb-content"
          >
            Tài khoản đã sẵn sàng
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(250).duration(450)}>
            <Text className="text-center text-base leading-6 text-fb-muted">
              Bạn đã tạo tài khoản thành công. Đăng nhập, thêm món đồ đầu tiên và dán mã QR để bắt
              đầu được bảo vệ.
            </Text>
          </Animated.View>
        </View>

        <View className="px-6 pb-12">
          <Button variant="primary" onPress={handleSignIn} accessibilityLabel="Tiếp tục đăng nhập">
            Tiếp tục đăng nhập
          </Button>
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

export default CongratulationScreen;
