/**
 * useFirebasePhoneAuth Hook
 * Quản lý toàn bộ luồng xác thực số điện thoại qua Firebase OTP
 * Sử dụng @react-native-firebase/auth native SDK
 *
 * Luồng: sendOtp → user nhập mã → verifyOtp (confirm) → lấy idToken → gọi backend /firebase-verify
 */

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { firebasePhoneAuth, normalizePhoneNumber } from '@services/firebase';
import { authApi } from '@services/auth';
import { useToast } from '@contexts/ToastContext';

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

interface UseFirebasePhoneAuthReturn {
  /** Đang loading (gửi OTP hoặc verify) */
  isLoading: boolean;
  /** Thông báo lỗi hiện tại */
  error: string | null;
  /** Số điện thoại đã chuẩn hóa (+84...) */
  normalizedPhone: string | null;

  /**
   * Bước 1: Gửi mã OTP đến số điện thoại
   * Gọi sau khi đăng ký thành công + chuyển sang màn CodeVerify
   */
  sendOtp: (phoneNumber: string) => Promise<boolean>;

  /**
   * Bước 2: Xác thực mã OTP + gửi idToken lên backend
   * Gọi khi user nhập đủ 6 số và bấm "Xác nhận"
   */
  verifyOtpAndAuthenticate: (otpCode: string) => Promise<boolean>;

  /**
   * Gửi lại mã OTP (dùng lại số điện thoại đã lưu)
   */
  resendOtp: () => Promise<boolean>;

  /** Xóa lỗi */
  clearError: () => void;
}

export const useFirebasePhoneAuth = (): UseFirebasePhoneAuthReturn => {
  const navigation = useNavigation<AuthNavigationProp>();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);

  // Lưu confirmation object từ Firebase SDK (dùng ref để tránh re-render)
  const confirmationRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);
  // Lưu số điện thoại gốc để resend
  const phoneRef = useRef<string>('');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Bước 1: Gửi OTP qua Firebase native SDK
   */
  const sendOtp = useCallback(
    async (phoneNumber: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Lưu số gốc để resend
        phoneRef.current = phoneNumber;
        const normalized = normalizePhoneNumber(phoneNumber);
        setNormalizedPhone(normalized);

        const result = await firebasePhoneAuth.sendOtp(phoneNumber);

        if (result.success && result.confirmation) {
          // Lưu confirmation object vào ref
          confirmationRef.current = result.confirmation;
          toast.success('Đã gửi mã OTP', result.message);
          return true;
        } else {
          setError(result.message);
          toast.error('Gửi OTP thất bại', result.message);
          return false;
        }
      } catch (err) {
        const errorMessage = 'Không thể gửi mã OTP. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error('Lỗi', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Bước 2: Xác thực OTP → Lấy idToken → Gọi backend /firebase-verify
   */
  const verifyOtpAndAuthenticate = useCallback(
    async (otpCode: string): Promise<boolean> => {
      if (!confirmationRef.current) {
        setError('Phiên xác thực không hợp lệ. Vui lòng gửi lại mã OTP.');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Bước 2a: Xác thực OTP với Firebase native SDK
        const otpResult = await firebasePhoneAuth.verifyOtp(confirmationRef.current, otpCode);

        if (!otpResult.success || !otpResult.idToken) {
          setError(otpResult.message);
          toast.error('Xác thực thất bại', otpResult.message);
          return false;
        }

        // Bước 2b: Gửi idToken lên backend để lấy JWT Server Token
        const backendResult = await authApi.firebaseVerify({
          idToken: otpResult.idToken,
        });

        if (backendResult.success && backendResult.data) {
          const { isNewUser, user } = backendResult.data;

          if (isNewUser) {
            toast.success(
              'Chào mừng!',
              `Tài khoản mới đã được tạo cho ${user.phoneNumber || user.displayName}`
            );
          } else {
            toast.success(
              'Xác thực thành công',
              `Chào mừng ${user.displayName || 'bạn'} quay trở lại!`
            );
          }

          // Chuyển sang màn Congratulation
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Congratulation' }],
            });
          }, 500);

          return true;
        } else {
          const errorMessage = backendResult.message || 'Xác thực với server thất bại.';
          setError(errorMessage);
          toast.error('Lỗi xác thực', errorMessage);
          return false;
        }
      } catch (err) {
        const errorMessage = 'Không thể hoàn tất xác thực. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error('Lỗi kết nối', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, toast]
  );

  /**
   * Gửi lại mã OTP
   */
  const resendOtp = useCallback(async (): Promise<boolean> => {
    if (!phoneRef.current) {
      setError('Không tìm thấy số điện thoại. Vui lòng quay lại.');
      return false;
    }

    return sendOtp(phoneRef.current);
  }, [sendOtp]);

  return {
    isLoading,
    error,
    normalizedPhone,
    sendOtp,
    verifyOtpAndAuthenticate,
    resendOtp,
    clearError,
  };
};

export default useFirebasePhoneAuth;
