/**
 * useFirebasePhoneAuth Hook
 * Legacy hook name kept for compatibility.
 * Current implementation uses backend SMS OTP endpoints:
 * register (already sends OTP) -> verify-otp -> resend-otp.
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { authApi } from '@services/auth';
import { useToast } from '@contexts/ToastContext';
import { useAuthContext } from '@contexts/AuthContext';

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

const MOCK_TEST_PHONE_LOCAL = '0398624656';
const MOCK_TEST_OTP = '123456';
const OTP_HOOK_LOG_TAG = '[Auth:OtpHook]';

const normalizePhoneDigits = (phoneNumber: string): string => phoneNumber.replace(/\D/g, '');

const maskPhoneForLog = (phoneNumber: string): string => {
  const digits = normalizePhoneDigits(phoneNumber);
  if (digits.length < 3) return phoneNumber;
  return `***${digits.slice(-3)}`;
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
};

const logOtpHook = (event: string, details?: Record<string, unknown>) => {
  console.log(`${OTP_HOOK_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

const isMockTestPhone = (phoneNumber: string): boolean => {
  const digits = normalizePhoneDigits(phoneNumber);
  return digits === MOCK_TEST_PHONE_LOCAL || digits === `84${MOCK_TEST_PHONE_LOCAL.slice(1)}`;
};

interface UseFirebasePhoneAuthReturn {
  /** Đang loading (gửi OTP hoặc verify) */
  isLoading: boolean;
  /** Thông báo lỗi hiện tại */
  error: string | null;
  /** Số điện thoại dùng cho xác minh OTP */
  normalizedPhone: string | null;

  /**
   * Bước 1: Thiết lập số điện thoại cho phiên OTP hiện tại.
   * OTP đã được backend gửi ngay sau bước register.
   */
  sendOtp: (phoneNumber: string) => Promise<boolean>;

  /**
   * Bước 2: Xác thực mã OTP với backend
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
  const { setAuthenticated, setUser, updateLastActivity } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);

  // Lưu số điện thoại cho luồng resend/verify
  const phoneRef = useRef<string>('');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Bước 1: Chỉ thiết lập số điện thoại cho bước verify.
   * OTP đã được gửi từ backend ngay tại bước đăng ký.
   */
  const sendOtp = useCallback(
    async (phoneNumber: string): Promise<boolean> => {
      const startedAt = Date.now();
      const requestId = `otp-send-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      logOtpHook('send_otp_start', {
        requestId,
        phoneMasked: maskPhoneForLog(phoneNumber),
      });

      setError(null);

      try {
        phoneRef.current = phoneNumber;
        setNormalizedPhone(phoneNumber);

        logOtpHook('send_otp_context_ready', {
          requestId,
          storedPhoneMasked: maskPhoneForLog(phoneRef.current),
          normalizedPhone: phoneNumber,
        });

        if (isMockTestPhone(phoneNumber)) {
          logOtpHook('send_otp_mock_mode', {
            requestId,
            phoneMasked: maskPhoneForLog(phoneNumber),
            mockCode: MOCK_TEST_OTP,
          });
          toast.success('Chế độ test OTP', `Mã test: ${MOCK_TEST_OTP}`);
        }

        logOtpHook('send_otp_success', {
          requestId,
          durationMs: Date.now() - startedAt,
          isMockPhone: isMockTestPhone(phoneNumber),
        });

        return true;
      } catch (err) {
        logOtpHook('send_otp_exception', {
          requestId,
          durationMs: Date.now() - startedAt,
          exception: serializeError(err),
        });

        const errorMessage = 'Không thể khởi tạo xác thực OTP. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error('Lỗi', errorMessage);
        return false;
      }
    },
    [toast]
  );

  /**
   * Bước 2: Xác thực OTP với backend /verify-otp
   */
  const verifyOtpAndAuthenticate = useCallback(
    async (otpCode: string): Promise<boolean> => {
      const startedAt = Date.now();
      const requestId = `otp-verify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      logOtpHook('verify_otp_start', {
        requestId,
        phoneMasked: maskPhoneForLog(phoneRef.current),
        otpLength: otpCode.length,
      });

      if (!phoneRef.current) {
        logOtpHook('verify_otp_invalid_session', {
          requestId,
          reason: 'missing_phone_in_ref',
        });
        setError('Phiên xác thực không hợp lệ. Vui lòng quay lại đăng ký.');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (isMockTestPhone(phoneRef.current)) {
          logOtpHook('verify_otp_mock_mode', {
            requestId,
            phoneMasked: maskPhoneForLog(phoneRef.current),
            providedCodeLength: otpCode.length,
          });

          if (otpCode !== MOCK_TEST_OTP) {
            const errorMessage = `Mã OTP test không đúng. Dùng mã ${MOCK_TEST_OTP}.`;
            logOtpHook('verify_otp_mock_fail', {
              requestId,
              expectedCode: MOCK_TEST_OTP,
              providedCode: otpCode,
            });
            setError(errorMessage);
            toast.error('Xác thực thất bại', errorMessage);
            return false;
          }

          logOtpHook('verify_otp_mock_success', {
            requestId,
            durationMs: Date.now() - startedAt,
            nextStep: 'navigate_tab_navigator',
          });

          setAuthenticated(true);
          await updateLastActivity();

          toast.success('Xác thực thành công', 'Đăng nhập test thành công.');

          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TabNavigator' }],
            });
          }, 500);

          return true;
        }

        logOtpHook('verify_otp_api_request', {
          requestId,
          endpoint: '/verify-otp',
          phoneMasked: maskPhoneForLog(phoneRef.current),
        });

        const result = await authApi.verifyOtp({
          phoneNumber: phoneRef.current,
          code: otpCode,
        });

        logOtpHook('verify_otp_api_response', {
          requestId,
          durationMs: Date.now() - startedAt,
          success: result.success,
          message: result.message,
          error: result.error,
          hasData: Boolean(result.data),
        });

        if (!result.success) {
          const errorMessage = result.message || 'Mã OTP không hợp lệ.';
          setError(errorMessage);
          toast.error('Xác thực thất bại', errorMessage);
          return false;
        }

        if (result.data?.user) {
          setUser(result.data.user);
        } else {
          const profileResponse = await authApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          }
        }

        setAuthenticated(true);
        await updateLastActivity();

        toast.success('Xác thực thành công', 'Chào mừng bạn đến với ứng dụng!');

        logOtpHook('verify_otp_success_navigate', {
          requestId,
          durationMs: Date.now() - startedAt,
          destination: 'TabNavigator',
        });

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'TabNavigator' }],
          });
        }, 500);

        return true;
      } catch (err) {
        logOtpHook('verify_otp_exception', {
          requestId,
          durationMs: Date.now() - startedAt,
          exception: serializeError(err),
        });

        const errorMessage = 'Không thể hoàn tất xác thực. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error('Lỗi kết nối', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
        logOtpHook('verify_otp_finish', {
          requestId,
          totalDurationMs: Date.now() - startedAt,
          isLoadingSetTo: false,
        });
      }
    },
    [navigation, setAuthenticated, setUser, toast, updateLastActivity]
  );

  /**
   * Gửi lại mã OTP
   */
  const resendOtp = useCallback(async (): Promise<boolean> => {
    const startedAt = Date.now();
    const requestId = `otp-resend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    logOtpHook('resend_otp_start', {
      requestId,
      phoneMasked: maskPhoneForLog(phoneRef.current),
    });

    if (!phoneRef.current) {
      logOtpHook('resend_otp_invalid_session', {
        requestId,
        reason: 'missing_phone_in_ref',
      });
      setError('Không tìm thấy số điện thoại. Vui lòng quay lại.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isMockTestPhone(phoneRef.current)) {
        logOtpHook('resend_otp_mock_mode', {
          requestId,
          phoneMasked: maskPhoneForLog(phoneRef.current),
          mockCode: MOCK_TEST_OTP,
        });
        toast.success('Đã gửi lại OTP', `Mã test: ${MOCK_TEST_OTP}`);
        return true;
      }

      logOtpHook('resend_otp_api_request', {
        requestId,
        endpoint: '/resend-otp',
        phoneMasked: maskPhoneForLog(phoneRef.current),
      });

      const response = await authApi.resendOtp({ phoneNumber: phoneRef.current });

      logOtpHook('resend_otp_api_response', {
        requestId,
        durationMs: Date.now() - startedAt,
        success: response.success,
        message: response.message,
        error: response.error,
      });

      if (!response.success) {
        const errorMessage = response.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error('Gửi lại thất bại', errorMessage);
        return false;
      }

      toast.success('Đã gửi lại OTP', 'Vui lòng kiểm tra tin nhắn SMS của bạn.');
      logOtpHook('resend_otp_success', {
        requestId,
        durationMs: Date.now() - startedAt,
      });
      return true;
    } catch (err) {
      logOtpHook('resend_otp_exception', {
        requestId,
        durationMs: Date.now() - startedAt,
        exception: serializeError(err),
      });

      const errorMessage = 'Không thể gửi lại OTP. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error('Lỗi kết nối', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
      logOtpHook('resend_otp_finish', {
        requestId,
        totalDurationMs: Date.now() - startedAt,
        isLoadingSetTo: false,
      });
    }
  }, [toast]);

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
