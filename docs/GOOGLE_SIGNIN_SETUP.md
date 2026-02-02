# 🔐 Hướng Dẫn Setup Google Sign In

## ✅ Đã Setup Xong

### 1. File google-services.json

- ✅ Đã thêm vào `android/app/google-services.json`
- ✅ Đã cấu hình trong `app.json`

### 2. Dependencies

- ✅ Đã cài đặt: `expo-auth-session`, `expo-web-browser`, `expo-crypto`

### 3. Code Integration

- ✅ Đã tạo types cho Google Login trong `services/auth/types.ts`
- ✅ Đã tạo API method `googleLogin()` trong `services/auth/api.ts`
- ✅ Đã tạo hook `useGoogleAuth()` trong `hooks/useGoogleAuth.ts`
- ✅ Đã cập nhật `GoogleLoginButton` component để sử dụng hook

## ⚙️ Cần Làm Thêm

### 1. Lấy Google Web Client ID

**Cách 1: Từ Firebase Console**

1. Mở [Firebase Console](https://console.firebase.google.com)
2. Chọn project `fir-demo-55f05`
3. Vào **Project Settings** > **General**
4. Scroll xuống phần **Your apps**
5. Chọn Web app (nếu chưa có thì tạo mới)
6. Copy **Web Client ID** (dạng: `970897912928-xxx.apps.googleusercontent.com`)

**Cách 2: Từ Google Cloud Console**

1. Mở [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project `fir-demo-55f05`
3. Vào **APIs & Services** > **Credentials**
4. Tìm **OAuth 2.0 Client IDs** với type **Web application**
5. Copy **Client ID**

### 2. Cập nhật `.env.dev`

Mở file `.env.dev` và thay thế `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` bằng Client ID thực:

```env
GOOGLE_WEB_CLIENT_ID=970897912928-abc123xyz456.apps.googleusercontent.com
```

### 3. Tạo OAuth 2.0 Client (Nếu chưa có)

Nếu chưa có Web Client ID:

1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project `fir-demo-55f05`
3. Vào **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Chọn **Application type**: **Web application**
6. Nhập **Name**: `Lost and Found QR - Web`
7. Thêm **Authorized redirect URIs**:
   - `https://auth.expo.io/@your-username/LostAndFoundQR`
   - `lostfound://`
8. Click **CREATE**
9. Copy **Client ID** và paste vào `.env.dev`

### 4. Cấu hình iOS (Nếu cần)

Nếu muốn support iOS:

1. Tạo iOS OAuth Client ID trong Google Cloud Console
2. Cập nhật `.env.dev`:
   ```env
   GOOGLE_IOS_CLIENT_ID=970897912928-ios.apps.googleusercontent.com
   ```

### 5. Rebuild App

Sau khi cập nhật config:

```bash
# Clear cache
npx expo start -c

# Rebuild native code (nếu cần)
npx expo prebuild --clean
npx expo run:android
```

## 📝 Cách Sử Dụng

### Trong Login Screen

```tsx
import { GoogleLoginButton } from '@screens/auth/components/GoogleLoginButton';

const LoginScreen = () => {
  const { login } = useAuth(); // Your auth context

  const handleGoogleSuccess = async (user: User, isNewUser: boolean) => {
    // User đã được authenticate và tokens đã được lưu
    // Cập nhật auth state hoặc navigate
    await login(user);

    if (isNewUser) {
      console.log('Chào mừng user mới!');
    } else {
      console.log('Chào mừng quay lại!');
    }
  };

  const handleGoogleError = (error: string) => {
    console.error('Google login failed:', error);
    // Show error toast
  };

  return (
    <View>
      {/* Email/Password Login Form */}

      <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
    </View>
  );
};
```

### Trực Tiếp Sử Dụng Hook

```tsx
import { useGoogleAuth } from '@hooks';

const MyComponent = () => {
  const { signInWithGoogle, loading, error, user, isNewUser } = useGoogleAuth();

  useEffect(() => {
    if (user) {
      console.log('Login success:', user);
      // Navigate hoặc update state
    }
  }, [user]);

  return (
    <Button onPress={signInWithGoogle} disabled={loading}>
      {loading ? 'Đang đăng nhập...' : 'Đăng nhập Google'}
    </Button>
  );
};
```

## 🔄 Flow Hoạt Động

1. User nhấn nút "Đăng nhập bằng Google"
2. App mở Google OAuth popup
3. User chọn tài khoản Google
4. Google trả về `idToken`
5. App gửi `idToken` lên backend: `POST /api/auth/google`
6. Backend verify token và trả về:
   - `accessToken`, `refreshToken`
   - `user` data
   - `isNewUser` flag
7. Hook tự động lưu tokens và user vào storage
8. Callback `onSuccess` được gọi

## 🐛 Troubleshooting

### Lỗi: "Google authentication not ready"

- Kiểm tra đã cập nhật `GOOGLE_WEB_CLIENT_ID` trong `.env.dev`
- Restart dev server: `npx expo start -c`

### Lỗi: "Invalid OAuth client"

- Kiểm tra Client ID có đúng không
- Kiểm tra package name trong `app.json` khớp với Firebase

### Lỗi: "Redirect URI mismatch"

- Thêm redirect URI vào Google Cloud Console:
  - `https://auth.expo.io/@your-username/LostAndFoundQR`
  - `lostfound://`

### Popup không hiện

- Kiểm tra `google-services.json` đã đúng chưa
- Rebuild app: `npx expo run:android`

## 📚 Tài Liệu Tham Khảo

- [Expo Auth Session](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
