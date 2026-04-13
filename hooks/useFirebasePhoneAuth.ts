/**
 * useFirebasePhoneAuth Hook
 *
 * Flow chuẩn:
 * 1. sendOtp(phoneNumber)      → Firebase gửi SMS OTP thật tới điện thoại
 * 2. verifyOtpAndAuthenticate(otp) → Xác thực OTP với Firebase SDK
 *                              → Lấy idToken từ Firebase
 *                              → Gọi backend /firebase-verify để tạo/lấy user + token
 * 3. resendOtp()               → Gửi lại OTP qua Firebase SDK (làm mới confirmation)
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { RootStackParamList } from '@navigation/index';
import { authApi } from '@services/auth';
import { firebasePhoneAuth, normalizePhoneNumber } from '@services/firebase/phoneAuth';
import { useToast } from '@contexts/ToastContext';
import { useAuthContext } from '@contexts/AuthContext';

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

const OTP_HOOK_LOG_TAG = '[Auth:OtpHook]';

// ─── Helpers ────────────────────────────────────────────────────────────────

const normalizePhoneDigits = (phoneNumber: string): string => phoneNumber.replace(/\D/g, '');

const maskPhoneForLog = (phoneNumber: string): string => {
  const digits = normalizePhoneDigits(phoneNumber);
  if (digits.length < 3) return phoneNumber;
  return `***${digits.slice(-3)}`;
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
};

const logOtpHook = (event: string, details?: Record<string, unknown>) => {
  console.log(`${OTP_HOOK_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

// ─── Interface ───────────────────────────────────────────────────────────────

export interface UseFirebasePhoneAuthReturn {
  /** Đang loading (gửi OTP hoặc verify) */
  isLoading: boolean;
  /** Thông báo lỗi hiện tại */
  error: string | null;
  /** Số điện thoại đã chuẩn hóa dùng cho xác minh */
  normalizedPhone: string | null;

  /**
   * Bước 1: Gửi OTP tới số điện thoại qua Firebase SMS.
   * Phải gọi trước verifyOtpAndAuthenticate.
   */
  sendOtp: (phoneNumber: string) => Promise<boolean>;

  /**
   * Bước 2: Xác thực mã OTP với Firebase SDK,
   * sau đó gọi backend /firebase-verify để lấy token ứng dụng.
   */
  verifyOtpAndAuthenticate: (otpCode: string) => Promise<boolean>;

  /**
   * Gửi lại mã OTP — làm mới confirmation object từ Firebase.
   */
  resendOtp: () => Promise<boolean>;

  /** Xóa lỗi hiện tại */
  clearError: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useFirebasePhoneAuth = (): UseFirebasePhoneAuthReturn => {
  const navigation = useNavigation<AuthNavigationProp>();
  const toast = useToast();
  const { setAuthenticated, setUser, updateLastActivity } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);

  // Lưu confirmation object giữa các lần render
  const confirmationRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);
  // Lưu số điện thoại gốc để dùng khi resend
  const phoneRef = useRef<string>('');

  const clearError = useCallback(() => setError(null), []);

  // ─── Bước 1: Gửi OTP ───────────────────────────────────────────────────────

  const sendOtp = useCallback(
    async (phoneNumber: string): Promise<boolean> => {
      const requestId = `otp-send-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startedAt = Date.now();

      logOtpHook('send_otp_start', {
        requestId,
        phoneMasked: maskPhoneForLog(phoneNumber),
      });

      setError(null);
      setIsLoading(true);

      try {
        // Lưu số điện thoại gốc
        phoneRef.current = phoneNumber;

        // Gọi Firebase SDK để gửi SMS OTP thật
        const result = await firebasePhoneAuth.sendOtp(phoneNumber);

        logOtpHook('send_otp_firebase_result', {
          requestId,
          success: result.success,
          message: result.message,
          durationMs: Date.now() - startedAt,
        });

        if (!result.success || !result.confirmation) {
          const errorMessage = result.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
          setError(errorMessage);
          toast.error('Lỗi gửi OTP', errorMessage);
          return false;
        }

        // Lưu confirmation object để dùng ở bước verify
        confirmationRef.current = result.confirmation;

        // Lưu số điện thoại đã chuẩn hóa để hiển thị UI
        setNormalizedPhone(normalizePhoneNumber(phoneNumber));

        logOtpHook('send_otp_success', {
          requestId,
          normalizedPhone: maskPhoneForLog(phoneNumber),
          confirmationSaved: true,
        });

        toast.success('Đã gửi OTP', 'Vui lòng kiểm tra tin nhắn SMS của bạn.');
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
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // ─── Bước 2: Xác thực OTP + Verify với backend ─────────────────────────────

  const verifyOtpAndAuthenticate = useCallback(
    async (otpCode: string): Promise<boolean> => {
      const requestId = `otp-verify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startedAt = Date.now();

      logOtpHook('verify_otp_start', {
        requestId,
        phoneMasked: maskPhoneForLog(phoneRef.current),
        otpLength: otpCode.length,
      });

      // Kiểm tra confirmation hợp lệ
      if (!confirmationRef.current) {
        logOtpHook('verify_otp_no_confirmation', { requestId });
        setError('Phiên xác thực không hợp lệ. Vui lòng gửi lại mã OTP.');
        return false;
      }

      if (!phoneRef.current) {
        logOtpHook('verify_otp_no_phone', { requestId });
        setError('Không tìm thấy số điện thoại. Vui lòng quay lại đăng ký.');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // ── Bước 2a: Xác thực OTP với Firebase SDK ───────────────────────────
        logOtpHook('verify_otp_firebase_start', { requestId });

        const verifyResult = await firebasePhoneAuth.verifyOtp(confirmationRef.current, otpCode);

        logOtpHook('verify_otp_firebase_result', {
          requestId,
          success: verifyResult.success,
          message: verifyResult.message,
          hasIdToken: Boolean(verifyResult.idToken),
          isNewUser: verifyResult.isNewUser,
          durationMs: Date.now() - startedAt,
        });

        if (!verifyResult.success || !verifyResult.idToken) {
          const errorMessage = verifyResult.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.';
          setError(errorMessage);
          toast.error('Xác thực thất bại', errorMessage);
          return false;
        }

        // ── Bước 2b: Gọi backend /firebase-verify để lấy token ứng dụng ─────
        logOtpHook('verify_otp_backend_start', {
          requestId,
          endpoint: '/firebase-verify',
        });

        const backendResult = await authApi.firebaseVerify({ idToken: verifyResult.idToken });

        logOtpHook('verify_otp_backend_result', {
          requestId,
          success: backendResult.success,
          message: backendResult.message,
          hasUser: Boolean(backendResult.data?.user),
          isNewUser: backendResult.data?.isNewUser,
          durationMs: Date.now() - startedAt,
        });

        if (!backendResult.success) {
          const errorMessage =
            backendResult.message || 'Không thể hoàn tất xác thực. Vui lòng thử lại.';
          setError(errorMessage);
          toast.error('Xác thực thất bại', errorMessage);
          return false;
        }

        // ── Bước 2c: Lưu user & cập nhật trạng thái auth ─────────────────────
        if (backendResult.data?.user) {
          setUser(backendResult.data.user);
        } else {
          // Fallback: fetch profile nếu backend không trả user
          logOtpHook('verify_otp_fetch_profile_fallback', { requestId });
          try {
            const profileResponse = await authApi.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data);
            }
          } catch (profileErr) {
            logOtpHook('verify_otp_profile_fallback_failed', {
              requestId,
              error: serializeError(profileErr),
            });
          }
        }

        setAuthenticated(true);
        await updateLastActivity();

        const isNewUser = backendResult.data?.isNewUser || verifyResult.isNewUser;
        const successMsg = isNewUser
          ? 'Tài khoản đã được tạo thành công!'
          : 'Đăng nhập thành công!';

        toast.success('Xác thực thành công', successMsg);

        logOtpHook('verify_otp_complete', {
          requestId,
          durationMs: Date.now() - startedAt,
          isNewUser,
          destination: 'TabNavigator',
        });

        // Điều hướng vào app sau một chút
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
        });
      }
    },
    [navigation, setAuthenticated, setUser, toast, updateLastActivity]
  );

  // ─── Gửi lại OTP ─────────────────────────────────────────────────────────

  const resendOtp = useCallback(async (): Promise<boolean> => {
    const requestId = `otp-resend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();

    logOtpHook('resend_otp_start', {
      requestId,
      phoneMasked: maskPhoneForLog(phoneRef.current),
    });

    if (!phoneRef.current) {
      logOtpHook('resend_otp_no_phone', { requestId });
      setError('Không tìm thấy số điện thoại. Vui lòng quay lại.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Gửi lại OTP qua Firebase — cập nhật confirmation mới
      const result = await firebasePhoneAuth.sendOtp(phoneRef.current);

      logOtpHook('resend_otp_firebase_result', {
        requestId,
        success: result.success,
        durationMs: Date.now() - startedAt,
      });

      if (!result.success || !result.confirmation) {
        const errorMessage = result.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error('Gửi lại thất bại', errorMessage);
        return false;
      }

      // Cập nhật confirmation mới
      confirmationRef.current = result.confirmation;

      toast.success('Đã gửi lại OTP', 'Vui lòng kiểm tra tin nhắn SMS của bạn.');
      logOtpHook('resend_otp_success', {
        requestId,
        durationMs: Date.now() - startedAt,
        confirmationRefreshed: true,
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
