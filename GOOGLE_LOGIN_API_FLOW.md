# 🔵 Google Login API Flow - Hướng Dẫn Chi Tiết

## 📋 Flow Tổng Quan

```
User nhấn "Đăng nhập bằng Google"
    ↓
[GoogleLoginButton Component]
    ↓
[useGoogleAuth Hook] - Mở Google OAuth popup
    ↓
User chọn tài khoản Google
    ↓
Google trả về idToken
    ↓
[authApi.googleLogin()] - POST /api/auth/google
    ↓
Backend verify idToken với Google
    ↓
Backend trả về: accessToken, refreshToken, user, isNewUser
    ↓
[authStorage] - Lưu tokens vào SecureStore
    ↓
[LoginScreen] - Hiện toast & navigate
    ↓
MainApp (TabNavigator)
```

## 🔧 Code Implementation

### 1. API Service (`services/auth/api.ts`)

```typescript
/**
 * Login with Google
 * Sends Google ID Token to backend
 */
async googleLogin(data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponseData>> {
  const response = await apiRequest<GoogleLoginResponseData>('/google', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Store tokens and user on success
  if (response.success && response.data) {
    await authStorage.saveTokens(response.data.accessToken, response.data.refreshToken);
    await authStorage.saveUser(response.data.user);
  }

  return response;
}
```

**Request:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (Success - New User):**

```json
{
  "success": true,
  "message": "Account created successfully via Google",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clx1234567890",
      "uid": "user_abc123xyz",
      "email": "user@gmail.com",
      "displayName": "John Doe",
      "photoURL": "https://lh3.googleusercontent.com/...",
      "totalReturned": 0,
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    "isNewUser": true
  }
}
```

**Response (Success - Existing User):**

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

### 2. Google Auth Hook (`hooks/useGoogleAuth.ts`)

```typescript
export const useGoogleAuth = (): UseGoogleAuthResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  // Configure Google OAuth request
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: ENV.GOOGLE_WEB_CLIENT_ID,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID,
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.params.id_token);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken: string) => {
    try {
      setLoading(true);

      // Send ID Token to backend
      const result = await authApi.googleLogin({ idToken });

      if (result.success && result.data) {
        setUser(result.data.user);
        setIsNewUser(result.data.isNewUser);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle: promptAsync, loading, error, user, isNewUser };
};
```

### 3. Google Login Button (`screens/auth/components/GoogleLoginButton.tsx`)

```tsx
export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const { signInWithGoogle, loading, error, user, isNewUser } = useGoogleAuth();

  // Handle successful login
  React.useEffect(() => {
    if (user && isNewUser !== null) {
      onSuccess?.(user, isNewUser);
    }
  }, [user, isNewUser]);

  // Handle error
  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error]);

  return (
    <>
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="px-2 text-sm text-gray-500">hoặc</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      <TouchableOpacity onPress={signInWithGoogle} disabled={loading}>
        {loading ? <ActivityIndicator /> : <GoogleIcon />}
        <Text>{loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}</Text>
      </TouchableOpacity>
    </>
  );
};
```

### 4. Login Screen (`screens/auth/login/index.tsx`)

```tsx
export const LoginScreen: React.FC = () => {
  const { navigateToMainApp } = useAuth();
  const toast = useToast();

  const handleGoogleSuccess = async (user: User, isNewUser: boolean) => {
    // Tokens đã được lưu vào storage bởi authApi.googleLogin()

    // Show success message
    if (isNewUser) {
      toast.success(
        'Đăng ký thành công!',
        `Chào mừng ${user.displayName} đến với Lost & Found QR!`
      );
    } else {
      toast.success('Đăng nhập thành công!', `Chào mừng bạn quay lại, ${user.displayName}!`);
    }

    // Navigate to main app
    setTimeout(() => {
      navigateToMainApp();
    }, 500);
  };

  const handleGoogleError = (error: string) => {
    toast.error('Đăng nhập Google thất bại', error);
  };

  return (
    <SafeAreaView>
      <LoginForm onSubmit={handleLogin} />

      <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

      <RegisterLink />
    </SafeAreaView>
  );
};
```

## 🔑 Environment Configuration

### `.env.dev`

```env
API_URL=https://backend-api-8rw9.onrender.com
GOOGLE_WEB_CLIENT_ID=970897912928-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
```

### `constants/environment.ts`

```typescript
export const ENV = {
  API_URL: expoExtra.apiUrl || process.env.API_URL,
  GOOGLE_WEB_CLIENT_ID: expoExtra.googleWebClientId || process.env.GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: expoExtra.googleIosClientId || process.env.GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID: expoExtra.googleAndroidClientId || process.env.GOOGLE_ANDROID_CLIENT_ID,
};
```

## 📱 Backend API Endpoint

### POST `/api/auth/google`

**Endpoint:** `https://backend-api-8rw9.onrender.com/api/auth/google`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0MjU..."
}
```

**Success Response (New User):**

```json
{
  "success": true,
  "message": "Account created successfully via Google",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clx1234567890",
      "uid": "user_abc123xyz",
      "email": "user@gmail.com",
      "displayName": "John Doe",
      "photoURL": "https://lh3.googleusercontent.com/a/xxx",
      "totalReturned": 0,
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    "isNewUser": true
  }
}
```

**Success Response (Existing User):**

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
      "photoURL": "https://lh3.googleusercontent.com/a/xxx",
      "totalReturned": 5,
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    "isNewUser": false
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Invalid Google ID token",
  "timestamp": "2026-01-10T10:00:00.000Z"
}
```

## 🔄 Data Flow

### 1. User Initiates Google Login

```typescript
// User taps button
<GoogleLoginButton onSuccess={...} onError={...} />
```

### 2. Open Google OAuth Popup

```typescript
// useGoogleAuth hook
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: ENV.GOOGLE_WEB_CLIENT_ID,
});

await promptAsync(); // Opens Google account picker
```

### 3. User Selects Google Account

- Google shows account picker
- User selects account
- Google authenticates user

### 4. Google Returns ID Token

```typescript
// response.params contains:
{
  type: "success",
  params: {
    id_token: "eyJhbGciOiJSUzI1NiIs...",
    // ... other params
  }
}
```

### 5. Send ID Token to Backend

```typescript
const result = await authApi.googleLogin({
  idToken: response.params.id_token,
});
```

**HTTP Request:**

```http
POST https://backend-api-8rw9.onrender.com/api/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### 6. Backend Processes Request

Backend will:

1. Verify ID token with Google
2. Extract user info (email, name, photo)
3. Check if user exists in database
4. If new user: Create account
5. If existing: Update last login
6. Generate JWT tokens (access + refresh)
7. Return response with tokens and user data

### 7. Save Tokens to Storage

```typescript
// Automatically done in authApi.googleLogin()
await authStorage.saveTokens(accessToken, refreshToken);
await authStorage.saveUser(user);
```

**Storage structure:**

```typescript
SecureStore:
  - auth_access_token: "eyJhbGciOiJIUzI1NiIs..."
  - auth_refresh_token: "eyJhbGciOiJIUzI1NiIs..."
  - auth_user: "{\"id\":\"...\",\"email\":\"...\",\"displayName\":\"...\"}"
```

### 8. Show Success & Navigate

```typescript
// In LoginScreen
handleGoogleSuccess(user, isNewUser) {
  if (isNewUser) {
    toast.success('Đăng ký thành công!', `Chào mừng ${user.displayName}!`);
  } else {
    toast.success('Đăng nhập thành công!', `Chào mừng bạn quay lại!`);
  }

  navigateToMainApp(); // → TabNavigator
}
```

## 🧪 Testing

### Test Cases

#### 1. Test với User mới

```
1. Tap "Đăng nhập bằng Google"
2. Chọn Google account chưa đăng ký
3. Expected:
   - Backend tạo account mới
   - isNewUser = true
   - Toast: "Đăng ký thành công!"
   - Navigate to MainApp
```

#### 2. Test với User đã tồn tại

```
1. Tap "Đăng nhập bằng Google"
2. Chọn Google account đã đăng ký
3. Expected:
   - Backend login user
   - isNewUser = false
   - Toast: "Đăng nhập thành công!"
   - Navigate to MainApp
```

#### 3. Test Cancel

```
1. Tap "Đăng nhập bằng Google"
2. Tap "Cancel" trong Google popup
3. Expected:
   - Không có error toast
   - Ở lại LoginScreen
```

#### 4. Test Error

```
1. Invalid Google Web Client ID
2. Expected:
   - Error toast: "Đăng nhập Google thất bại"
   - Ở lại LoginScreen
```

### Debug Logging

```typescript
// In useGoogleAuth hook
console.log('Google OAuth Response:', response);
console.log('ID Token:', response.params.id_token);
console.log('API Response:', result);
console.log('User:', user);
console.log('Is New User:', isNewUser);
```

## ⚠️ Important Notes

1. **Auto-verified:** Google users tự động được verify email
2. **No password:** Google users không cần password
3. **Token storage:** Tokens tự động lưu vào SecureStore
4. **Welcome email:** Backend tự động gửi email cho user mới
5. **Account linking:** Nếu email đã tồn tại, Google account sẽ được link

## 🚀 Next Steps

1. ✅ Lấy Google Web Client ID từ Firebase Console
2. ✅ Cập nhật vào `.env.dev`
3. ✅ Rebuild app: `npx expo run:android`
4. ✅ Test Google Sign In flow
5. ✅ Verify tokens được lưu trong storage
6. ✅ Verify navigation to MainApp

## 📚 Related Files

- [services/auth/api.ts](../services/auth/api.ts) - API methods
- [services/auth/types.ts](../services/auth/types.ts) - Type definitions
- [hooks/useGoogleAuth.ts](../hooks/useGoogleAuth.ts) - Google auth hook
- [screens/auth/components/GoogleLoginButton.tsx](../screens/auth/components/GoogleLoginButton.tsx) - Button component
- [screens/auth/login/index.tsx](../screens/auth/login/index.tsx) - Login screen
- [constants/environment.ts](../constants/environment.ts) - Environment config
