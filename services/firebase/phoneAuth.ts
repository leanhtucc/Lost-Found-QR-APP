/**
 * Firebase Phone Authentication Service
 * Sử dụng @react-native-firebase/auth native SDK để gửi/xác thực OTP qua SMS
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// ==================== TYPES ====================

/** Kết quả gửi OTP */
export interface SendOtpResult {
  success: boolean;
  /** Confirmation object từ Firebase SDK — dùng để verify OTP */
  confirmation?: FirebaseAuthTypes.ConfirmationResult;
  message: string;
}

/** Kết quả xác thực OTP */
export interface VerifyOtpResult {
  success: boolean;
  /** Firebase ID Token để gửi lên backend */
  idToken?: string;
  /** Firebase UID */
  uid?: string;
  phoneNumber?: string;
  isNewUser?: boolean;
  message: string;
}

// ==================== ERROR MAPPING ====================

/** Chuyển mã lỗi Firebase sang tiếng Việt */
const getVietnameseError = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'auth/invalid-phone-number': 'Số điện thoại không hợp lệ.',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
    'auth/quota-exceeded': 'Đã vượt giới hạn gửi SMS. Vui lòng thử lại sau.',
    'auth/session-expired': 'Phiên xác thực đã hết hạn. Vui lòng gửi lại mã.',
    'auth/invalid-verification-code': 'Mã OTP không đúng. Vui lòng kiểm tra lại.',
    'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.',
    'auth/missing-phone-number': 'Vui lòng nhập số điện thoại.',
    'auth/missing-verification-code': 'Vui lòng nhập mã OTP.',
    'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra Internet.',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
    'auth/operation-not-allowed': 'Xác thực bằng số điện thoại chưa được kích hoạt.',
  };

  return errorMap[errorCode] || `Đã xảy ra lỗi xác thực. (${errorCode})`;
};

// ==================== HELPER ====================

/**
 * Chuẩn hóa số điện thoại Việt Nam sang định dạng quốc tế (+84)
 * Ví dụ: "0987654321" -> "+84987654321"
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Xóa khoảng trắng, dấu gạch ngang, dấu chấm, ngoặc
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');

  // Nếu bắt đầu bằng 0 → thay bằng +84
  if (cleaned.startsWith('0')) {
    cleaned = '+84' + cleaned.substring(1);
  }

  // Nếu bắt đầu bằng 84 (không có +) → thêm +
  if (cleaned.startsWith('84') && !cleaned.startsWith('+84')) {
    cleaned = '+' + cleaned;
  }

  // Nếu chưa có mã quốc gia → mặc định VN
  if (!cleaned.startsWith('+')) {
    cleaned = '+84' + cleaned;
  }

  return cleaned;
};

// ==================== MAIN SERVICE ====================

export const firebasePhoneAuth = {
  /**
   * Bước 1: Gửi mã OTP tới số điện thoại
   * Sử dụng Firebase Auth native SDK — tự xử lý reCAPTCHA trên Android
   *
   * @param phoneNumber - Số điện thoại (VD: "0987654321" hoặc "+84987654321")
   * @returns SendOtpResult với confirmation object cần lưu lại
   */
  async sendOtp(phoneNumber: string): Promise<SendOtpResult> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    try {
      // signInWithPhoneNumber sẽ tự động gửi SMS OTP
      // Trên Android tự động xử lý reCAPTCHA verification
      const confirmation = await auth().signInWithPhoneNumber(normalizedPhone);

      console.log('[FirebasePhoneAuth] OTP sent successfully to:', normalizedPhone);
      return {
        success: true,
        confirmation,
        message: `Mã OTP đã được gửi đến ${normalizedPhone}`,
      };
    } catch (error: any) {
      const errorCode = error.code || 'unknown';
      console.error('[FirebasePhoneAuth] sendOtp error:', errorCode, error.message);
      return {
        success: false,
        message: getVietnameseError(errorCode),
      };
    }
  },

  /**
   * Bước 2: Xác thực mã OTP
   * Trả về Firebase ID Token để gửi lên backend qua /api/auth/firebase-verify
   *
   * @param confirmation - Confirmation object nhận được từ bước sendOtp
   * @param otpCode - Mã OTP 6 chữ số user nhập
   * @returns VerifyOtpResult chứa idToken
   */
  async verifyOtp(
    confirmation: FirebaseAuthTypes.ConfirmationResult,
    otpCode: string
  ): Promise<VerifyOtpResult> {
    try {
      // Xác thực OTP — sẽ sign in user vào Firebase
      const userCredential = await confirmation.confirm(otpCode);

      if (!userCredential || !userCredential.user) {
        return {
          success: false,
          message: 'Không thể xác thực. Vui lòng thử lại.',
        };
      }

      // Lấy Firebase ID Token để gửi lên backend
      const idToken = await userCredential.user.getIdToken();
      const isNewUser = userCredential.additionalUserInfo?.isNewUser || false;

      console.log('[FirebasePhoneAuth] OTP verified successfully, isNewUser:', isNewUser);
      return {
        success: true,
        idToken,
        uid: userCredential.user.uid,
        phoneNumber: userCredential.user.phoneNumber || undefined,
        isNewUser,
        message: 'Xác thực OTP thành công!',
      };
    } catch (error: any) {
      const errorCode = error.code || 'unknown';
      console.error('[FirebasePhoneAuth] verifyOtp error:', errorCode, error.message);
      return {
        success: false,
        message: getVietnameseError(errorCode),
      };
    }
  },
};

export default firebasePhoneAuth;
