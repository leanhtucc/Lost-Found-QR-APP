# 🧪 Test Google Login API

## Quick Test với cURL

### Test POST /api/auth/google

```bash
curl -X POST https://backend-api-8rw9.onrender.com/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN_HERE"
  }'
```

**Expected Response (New User):**

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

## Test trong App

### Bước 1: Setup Environment

Đảm bảo `.env.dev` có:

```env
API_URL=https://backend-api-8rw9.onrender.com
GOOGLE_WEB_CLIENT_ID=970897912928-XXXXXXX.apps.googleusercontent.com
```

### Bước 2: Build App

```bash
# Clear cache
npx expo start -c

# Hoặc rebuild native
npx expo run:android
```

### Bước 3: Test Flow

1. **Mở app** → LoginScreen
2. **Tap** "Đăng nhập bằng Google"
3. **Chọn** Google account
4. **Verify** loading state xuất hiện
5. **Check** toast message hiện
6. **Verify** navigate to MainApp

### Bước 4: Verify Storage

Sau khi login thành công, check SecureStore:

```typescript
// Add to LoginScreen temporarily for debugging
import { authStorage } from '@storage/auth';

const checkStorage = async () => {
  const accessToken = await authStorage.getAccessToken();
  const refreshToken = await authStorage.getRefreshToken();
  const user = await authStorage.getUser();

  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);
  console.log('User:', user);
};

// Call after successful login
handleGoogleSuccess() {
  await checkStorage();
  // ... navigate
}
```

## Debug Checklist

### ✅ Pre-Login Checks

- [ ] `GOOGLE_WEB_CLIENT_ID` đã set trong `.env.dev`
- [ ] App đã rebuild sau khi update `.env`
- [ ] `google-services.json` ở đúng vị trí `android/app/`
- [ ] Gradle đã sync

### ✅ During Login

- [ ] Google popup mở được
- [ ] Có thể chọn Google account
- [ ] Loading spinner hiện
- [ ] Không có error trong console

### ✅ Post-Login

- [ ] Toast message hiện đúng
- [ ] Navigate to MainApp
- [ ] Tokens đã lưu trong SecureStore
- [ ] User data đã lưu trong SecureStore

## Common Issues & Solutions

### Issue 1: "Google authentication not ready"

**Cause:** `GOOGLE_WEB_CLIENT_ID` chưa set hoặc sai

**Solution:**

```bash
# Check .env.dev
cat .env.dev | grep GOOGLE_WEB_CLIENT_ID

# Restart dev server
npx expo start -c
```

### Issue 2: "Invalid OAuth client"

**Cause:** Client ID không đúng hoặc không match với package name

**Solution:**

1. Verify Client ID trong Google Cloud Console
2. Check package name trong `app.json` match với Firebase
3. Rebuild app

### Issue 3: Popup không mở

**Cause:** `google-services.json` thiếu hoặc Gradle chưa sync

**Solution:**

```bash
# Rebuild native code
npx expo prebuild --clean
npx expo run:android
```

### Issue 4: Backend trả error

**Cause:** Backend không verify được ID token

**Solution:**

1. Check ID token có đúng không
2. Verify backend có config Firebase đúng không
3. Check logs ở backend

## Manual API Test

Nếu muốn test API riêng, không qua app:

### 1. Get Google ID Token

Có thể dùng Google OAuth Playground:

1. Vào https://developers.google.com/oauthplayground
2. Select & authorize APIs
3. Exchange authorization code for tokens
4. Copy `id_token`

### 2. Test với Postman/Insomnia

```http
POST https://backend-api-8rw9.onrender.com/api/auth/google
Content-Type: application/json

{
  "idToken": "PASTE_ID_TOKEN_HERE"
}
```

### 3. Verify Response

Kiểm tra response có:

- ✅ `success: true`
- ✅ `accessToken` (JWT format)
- ✅ `refreshToken` (JWT format)
- ✅ `user` object với đầy đủ thông tin
- ✅ `isNewUser` (boolean)

## End-to-End Test Script

```typescript
// Test script - có thể chạy trong app
const testGoogleLogin = async () => {
  console.log('🧪 Starting Google Login Test...');

  try {
    // 1. Clear storage
    console.log('1️⃣ Clearing storage...');
    await authStorage.clearAll();

    // 2. Trigger Google login
    console.log('2️⃣ Triggering Google login...');
    // User manually tap button here

    // 3. Wait for response
    console.log('3️⃣ Waiting for API response...');
    // Check network tab

    // 4. Verify storage
    console.log('4️⃣ Verifying storage...');
    const hasToken = await authStorage.isAuthenticated();
    const user = await authStorage.getUser();

    if (hasToken && user) {
      console.log('✅ Test PASSED!');
      console.log('User:', user.email);
    } else {
      console.log('❌ Test FAILED!');
    }
  } catch (error) {
    console.error('❌ Test ERROR:', error);
  }
};
```

## Success Criteria

### Login Successful khi:

1. ✅ Google popup mở và user chọn account
2. ✅ App nhận được `id_token` từ Google
3. ✅ Backend API trả về `success: true`
4. ✅ `accessToken` và `refreshToken` được lưu vào SecureStore
5. ✅ `user` object được lưu vào SecureStore
6. ✅ Toast success message hiện
7. ✅ Navigate to MainApp (TabNavigator)
8. ✅ User có thể access protected screens

## Network Debugging

### Enable Network Logs

```typescript
// In services/auth/api.ts
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${AUTH_BASE_URL}${endpoint}`;

  console.log('📡 API Request:', {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body,
  });

  const response = await fetch(url, options);
  const data = await response.json();

  console.log('📡 API Response:', {
    status: response.status,
    data,
  });

  return data;
}
```

### Check Network Tab

Trong React Native Debugger hoặc Metro console:

1. Mở Network tab
2. Tap "Đăng nhập bằng Google"
3. Check request to `/api/auth/google`
4. Verify request body có `idToken`
5. Verify response có `accessToken`, `refreshToken`, `user`

## Final Checklist

Trước khi test lần cuối:

- [ ] ✅ Đã lấy Google Web Client ID
- [ ] ✅ Đã update `.env.dev`
- [ ] ✅ Đã rebuild app
- [ ] ✅ Đã sync Gradle
- [ ] ✅ Backend API đang chạy
- [ ] ✅ `google-services.json` ở đúng chỗ
- [ ] ✅ Package name match với Firebase config

Nếu tất cả đã OK → **Ready to test!** 🚀
