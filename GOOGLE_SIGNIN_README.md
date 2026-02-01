# ✅ Setup Google Sign In - HOÀN TẤT

## 📦 Các File Đã Tạo/Cập Nhật

### 1. Config Files

- ✅ `android/app/google-services.json` - Firebase config cho Android
- ✅ `app.json` - Thêm googleServicesFile config
- ✅ `.env.dev` - Thêm Google OAuth Client IDs

### 2. Source Code

- ✅ `constants/environment.ts` - Thêm GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID
- ✅ `services/auth/types.ts` - Thêm GoogleLoginRequest, GoogleLoginResponseData
- ✅ `services/auth/api.ts` - Thêm googleLogin() method
- ✅ `hooks/useGoogleAuth.ts` - Hook xử lý Google authentication flow
- ✅ `hooks/index.ts` - Export useGoogleAuth
- ✅ `screens/auth/components/GoogleLoginButton.tsx` - Component button với tích hợp useGoogleAuth
- ✅ `screens/auth/login/index.tsx` - Tích hợp GoogleLoginButton vào LoginScreen

### 3. Dependencies

- ✅ `expo-auth-session` - Google OAuth flow
- ✅ `expo-web-browser` - Web browser cho OAuth
- ✅ `expo-crypto` - Cryptographic functions

### 4. Documentation

- ✅ `docs/GOOGLE_SIGNIN_SETUP.md` - Hướng dẫn chi tiết setup và sử dụng

## ⚡ Quick Start

### Bước 1: Lấy Google Web Client ID

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project: **fir-demo-55f05**
3. **Project Settings** > **General** > **Your apps**
4. Thêm Web app (nếu chưa có)
5. Copy **Web Client ID**

### Bước 2: Cập Nhật .env.dev

Mở file `.env.dev` và thay thế:

```env
GOOGLE_WEB_CLIENT_ID=970897912928-YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
```

### Bước 3: Rebuild App

```bash
# Clear cache
npx expo start -c

# Hoặc rebuild native code
npx expo run:android
```

## 🎯 Flow Hoạt Động

```
User nhấn "Đăng nhập bằng Google"
    ↓
App mở Google OAuth popup (expo-auth-session)
    ↓
User chọn tài khoản Google
    ↓
Google trả về idToken
    ↓
App gửi POST /api/auth/google { idToken }
    ↓
Backend verify và trả về:
  - accessToken
  - refreshToken
  - user (id, email, displayName, photoURL, totalReturned)
  - isNewUser (true/false)
    ↓
Hook tự động lưu tokens vào SecureStore
    ↓
Callback onSuccess được gọi
    ↓
Navigate to MainApp
```

## 📱 Backend API Endpoint

```typescript
POST https://backend-api-8rw9.onrender.com/api/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful via Google",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clx1234567890",
      "uid": "user_abc123xyz",
      "email": "user@gmail.com",
      "displayName": "John Doe",
      "photoURL": "https://lh3.googleusercontent.com/...",
      "totalReturned": 5,
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    "isNewUser": false
  }
}
```

## 💻 Cách Sử Dụng Trong Code

### Option 1: Sử dụng GoogleLoginButton Component

```tsx
import { GoogleLoginButton } from '@screens/auth/components/GoogleLoginButton';

const LoginScreen = () => {
  const handleGoogleSuccess = (user, isNewUser) => {
    if (isNewUser) {
      console.log('New user:', user.displayName);
    }
    // Navigate to main app
  };

  const handleGoogleError = error => {
    console.error('Google login failed:', error);
  };

  return (
    <View>
      <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
    </View>
  );
};
```

### Option 2: Sử dụng Hook trực tiếp

```tsx
import { useGoogleAuth } from '@hooks';

const MyComponent = () => {
  const { signInWithGoogle, loading, error, user, isNewUser } = useGoogleAuth();

  useEffect(() => {
    if (user) {
      console.log('Login success:', user);
    }
  }, [user]);

  return (
    <Button onPress={signInWithGoogle} disabled={loading}>
      {loading ? 'Đang đăng nhập...' : 'Google Sign In'}
    </Button>
  );
};
```

## 🔧 Cấu Hình Google Cloud Console (Nếu cần tạo mới)

### 1. Enable Google Sign-In API

1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project **fir-demo-55f05**
3. **APIs & Services** > **Library**
4. Tìm "Google Sign-In" hoặc "Google+ API"
5. Click **Enable**

### 2. Tạo OAuth 2.0 Client ID

1. **APIs & Services** > **Credentials**
2. **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Lost and Found QR - Web`
5. Authorized redirect URIs:
   - `https://auth.expo.io/@your-expo-username/LostAndFoundQR`
   - `lostfound://`
6. Click **CREATE**
7. Copy Client ID

### 3. Cấu hình Android (Đã có trong google-services.json)

- Package name: `com.lostfound.app` (production)
- Package name: `com.vieai.dev` (development)

## 📝 Checklist Setup

- [x] Thêm google-services.json vào android/app/
- [x] Cấu hình app.json với googleServicesFile
- [x] Cài đặt dependencies (expo-auth-session, expo-web-browser, expo-crypto)
- [x] Tạo types cho Google Login
- [x] Tạo API method googleLogin()
- [x] Tạo hook useGoogleAuth()
- [x] Cập nhật GoogleLoginButton component
- [x] Tích hợp vào LoginScreen
- [ ] **LẤY GOOGLE WEB CLIENT ID từ Firebase Console**
- [ ] **CẬP NHẬT .env.dev với Client ID thực**
- [ ] Rebuild app với npx expo run:android
- [ ] Test Google Sign In flow

## 🐛 Common Issues

### Issue 1: "Google authentication not ready"

**Fix:** Kiểm tra GOOGLE_WEB_CLIENT_ID trong .env.dev và restart dev server

### Issue 2: "Invalid OAuth client"

**Fix:** Đảm bảo Client ID đúng và package name match với Firebase config

### Issue 3: Popup không hiện

**Fix:** Rebuild app với `npx expo run:android`

### Issue 4: "Redirect URI mismatch"

**Fix:** Thêm redirect URIs vào Google Cloud Console

## 📚 Tài Liệu Tham Khảo

- [Backend API Docs](../API_DOCS.md) - Chi tiết về Google login endpoint
- [Expo Auth Session](https://docs.expo.dev/guides/authentication/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Auth](https://firebase.google.com/docs/auth)

## 🎉 Hoàn Tất!

Setup Google Sign In đã hoàn tất. Chỉ cần:

1. Lấy Google Web Client ID từ Firebase Console
2. Cập nhật vào `.env.dev`
3. Rebuild app
4. Test!
