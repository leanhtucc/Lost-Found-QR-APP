import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AlertTriangle } from 'lucide-react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { authApi, getApiErrorCode } from '@/services/auth';
import type { RootStackParamList } from '@/navigation';
import { FIND_BACK } from '@/constants/theme';
import { SettingsScreenHeader } from './components';

export default function DeleteAccountScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setAuthenticated, setUser } = useAuthContext();
  const [step, setStep] = useState<'warning' | 'otp'>('warning');
  const [otpCode, setOtpCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const requestOtp = async () => {
    setLoading(true);
    setError(null);
    const response = await authApi.requestAccountDeletionOtp();
    setLoading(false);
    if (!response.success || !response.data) {
      const message =
        getApiErrorCode(response) === 'RATE_LIMITED'
          ? 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.'
          : response.message || 'Không thể gửi mã xác nhận.';
      Alert.alert('Không thể gửi OTP', message);
      return;
    }
    setOtpCode('');
    setSecondsLeft(response.data.expiresInSeconds);
    setStep('otp');
  };

  const confirmDeletion = async () => {
    if (!/^\d{6}$/.test(otpCode)) {
      setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }
    setLoading(true);
    setError(null);
    const response = await authApi.deleteAccount(otpCode);
    setLoading(false);
    if (!response.success || !response.data) {
      const code = getApiErrorCode(response);
      setError(
        code === 'REAUTHENTICATION_REQUIRED'
          ? 'Mã xác nhận không đúng hoặc đã hết hạn.'
          : response.message || 'Không thể xóa tài khoản.'
      );
      return;
    }

    setAuthenticated(false);
    setUser(null);
    const recoverDate = new Date(response.data.recoverableUntil).toLocaleDateString('vi-VN');
    Alert.alert(
      'Đã lên lịch xóa tài khoản',
      `Tài khoản đã ngừng hoạt động. Thời hạn khôi phục: ${recoverDate}.`,
      [
        {
          text: 'Đóng',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral">
      <SettingsScreenHeader title="Xóa tài khoản" onBack={() => navigation.goBack()} />
      <View className="flex-1 px-6 pt-10">
        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-fb-danger/10">
            <AlertTriangle size={36} color={FIND_BACK.danger} />
          </View>
          <Text className="mt-6 text-center text-2xl font-bold text-fb-content">
            {step === 'warning' ? 'Bạn muốn xóa tài khoản?' : 'Xác nhận bằng OTP'}
          </Text>
        </View>

        {step === 'warning' ? (
          <>
            <View className="mt-7 rounded-3xl bg-fb-surface p-5">
              <Text className="mb-3 text-sm leading-6 text-fb-muted">
                • Tài khoản sẽ ngừng hoạt động ngay sau khi xác nhận.
              </Text>
              <Text className="mb-3 text-sm leading-6 text-fb-muted">
                • Push token và các mã QR cũ sẽ bị vô hiệu hóa.
              </Text>
              <Text className="mb-3 text-sm leading-6 text-fb-muted">
                • Dữ liệu cá nhân được lên lịch xóa hoặc ẩn danh sau 30 ngày.
              </Text>
              <Text className="text-sm leading-6 text-fb-muted">
                • Một số dữ liệu giao dịch có thể được giữ ở dạng ẩn danh.
              </Text>
            </View>
            <TouchableOpacity
              disabled={loading}
              onPress={() => void requestOtp()}
              className="mt-8 h-14 items-center justify-center rounded-full bg-fb-danger"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">Gửi mã xác nhận</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} className="mt-3 py-4">
              <Text className="text-center text-base font-semibold text-fb-content">Hủy</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="mt-5 text-center text-sm leading-6 text-fb-muted">
              Nhập mã 6 chữ số vừa được gửi cho bạn. Mã còn hiệu lực trong {formattedTime}.
            </Text>
            <TextInput
              value={otpCode}
              onChangeText={value => {
                setOtpCode(value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              placeholder="000000"
              placeholderTextColor={FIND_BACK.labelText}
              className={`mt-8 h-16 rounded-2xl border bg-fb-surface text-2xl font-bold tracking-[8px] text-fb-content ${
                error ? 'border-fb-danger' : 'border-fb-border-subtle'
              }`}
            />
            {error ? (
              <Text className="mt-2 text-center text-sm text-fb-danger">{error}</Text>
            ) : null}
            <TouchableOpacity
              disabled={loading || otpCode.length !== 6}
              onPress={() => void confirmDeletion()}
              className={`mt-7 h-14 items-center justify-center rounded-full ${
                otpCode.length === 6 ? 'bg-fb-danger' : 'bg-fb-danger/40'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">Xác nhận xóa tài khoản</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading || secondsLeft > 0}
              onPress={() => void requestOtp()}
              className="mt-4 py-3"
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  secondsLeft > 0 ? 'text-fb-label' : 'text-fb-primary'
                }`}
              >
                Gửi lại mã
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
