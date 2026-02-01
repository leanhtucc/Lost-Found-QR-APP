# 🔐 Hướng Dẫn Thiết Lập Google Sign-In

## ✅ Đã Thiết Lập Xong

### 1. Thư viện đã cài đặt

- ✅ `expo-auth-session` - Xử lý OAuth flow
- ✅ `expo-web-browser` - Mở trình duyệt cho authentication
- ✅ `expo-crypto` - Mã hóa dữ liệu

### 2. File cấu hình

- ✅ `.env` - Chứa Google Client IDs
- ✅ `app.config.js` - Export environment variables
- ✅ `app.json` - Cấu hình googleServicesFile
- ✅ `android/app/google-services.json` - File cấu hình Firebase

### 3. Code đã tích hợp

- ✅ `hooks/useGoogleAuth.ts` - Hook xử lý Google Sign-In
- ✅ `screens/auth/components/GoogleLoginButton.tsx` - Nút đăng nhập
- ✅ `services/auth/api.ts` - API call đến backend
- ✅ `constants/environment.ts` - Đọc environment variables

---

## 📝 Các Bước Sử Dụng

### Bước 1: Lấy Google Web Client ID

#### Cách 1: Từ Firebase Console (Khuyên dùng)

1. Mở [Firebase Console](https://console.firebase.google.com)
2. Chọn project của bạn
3. Click vào **⚙️ Project Settings** (góc trên bên trái)
4. Chọn tab **General**
5. Scroll xuống phần **Your apps**
6. Tìm hoặc thêm **Web app**:
   - Nếu chưa có: Click **Add app** > Chọn **Web** (</>) > Đặt tên > Register app
   - Nếu đã có: Click vào Web app để xem thông tin
7. Copy **Web Client ID** (dạng: `XXXXXXXXX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`)

#### Cách 2: Từ Google Cloud Console

1. Mở [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project của bạn
3. Vào **APIs & Services** > **Credentials**
4. Tìm **OAuth 2.0 Client IDs** với type **Web application**
5. Click vào Client ID để xem chi tiết
6. Copy **Client ID**

### Bước 2: Cập nhật file .env

Mở file `.env` trong thư mục gốc của project và thay thế phần `GOOGLE_WEB_CLIENT_ID`:

```env
# Thay thế XXXXXXXX... bằng Client ID thực của bạn
GOOGLE_WEB_CLIENT_ID=573454777935-u0sp5nj8ks2u7r6nocgk4pjd87qc4l5e.apps.googleusercontent.com
```

**Lưu ý**: File `.env` hiện tại đã có sẵn Client ID mẫu. Bạn cần thay bằng Client ID thực của Firebase project của bạn.

### Bước 3: Cập nhật google-services.json (Nếu cần)

Nếu bạn chưa có file `android/app/google-services.json` hoặc muốn cập nhật:

1. Mở [Firebase Console](https://console.firebase.google.com)
2. Chọn project của bạn
3. Vào **⚙️ Project Settings** > **General**
4. Scroll xuống phần **Your apps**
5. Tìm **Android app** với package name: `com.lostfound.app`
   - Nếu chưa có: Click **Add app** > Chọn **Android**
   - Package name: `com.lostfound.app` (phải khớp với app.json)
6. Download file `google-services.json`
7. Copy file vào `android/app/google-services.json`

### Bước 4: Rebuild Project

Sau khi cập nhật cấu hình, bạn cần rebuild project:

```bash
# Clear cache
npx expo start --clear

# Hoặc rebuild Android
npx expo run:android
```

### Bước 5: Test Google Sign-In

1. Mở app
2. Vào màn hình **Login** hoặc **Register**
3. Click nút **"Đăng nhập bằng Google"**
4. Chọn tài khoản Google
5. Cho phép quyền truy cập
6. App sẽ tự động đăng nhập

---

## 🔍 Kiểm Tra Cấu Hình

### Kiểm tra Environment Variables

Mở file `constants/environment.ts` và thêm dòng log:

```typescript
console.log('Google Web Client ID:', ENV.GOOGLE_WEB_CLIENT_ID);
```

Nếu thấy giá trị là `970897912928-XXXXXXXX...` thì cần cập nhật file `.env`.

### Kiểm tra Package Name

Đảm bảo package name khớp nhau:

- `app.json` > `android.package`: `com.lostfound.app`
- `android/app/build.gradle` > `applicationId`: `com.lostfound.app`
- Firebase Console > Android app > Package name: `com.lostfound.app`

---

## ⚠️ Troubleshooting

### Lỗi: "Developer Error" hoặc "Invalid Client ID"

**Nguyên nhân**: Google Web Client ID chưa được cập nhật hoặc sai.

**Giải pháp**:

1. Kiểm tra file `.env` có đúng Client ID không
2. Restart Metro bundler: `npx expo start --clear`
3. Rebuild app: `npx expo run:android`

### Lỗi: "Sign in failed" hoặc "Network Error"

**Nguyên nhân**: Backend chưa xử lý Google ID Token.

**Giải pháp**:

1. Kiểm tra backend API endpoint: `POST /api/auth/google-login`
2. Xem file `services/auth/api.ts` để kiểm tra endpoint
3. Test API bằng Postman với ID Token mẫu

### Lỗi: "SHA-1 fingerprint not configured"

**Nguyên nhân**: Chưa thêm SHA-1 fingerprint vào Firebase.

**Giải pháp**:

1. Lấy SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
2. Copy SHA-1 từ variant `debugAndroidTest`
3. Vào Firebase Console > Project Settings > Your apps > Android app
4. Add fingerprint
5. Download lại `google-services.json`

---

## 📚 Tài Liệu Tham Khảo

- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [Firebase Authentication](https://firebase.google.com/docs/auth/android/google-signin)

---

## 🎯 Checklist Hoàn Tất

- [x] Cài đặt thư viện: `expo-auth-session`, `expo-web-browser`, `expo-crypto`
- [ ] Lấy Google Web Client ID từ Firebase Console
- [ ] Cập nhật `.env` với Client ID thực
- [ ] Kiểm tra `android/app/google-services.json` có đúng project
- [ ] Rebuild project với `npx expo run:android`
- [ ] Test đăng nhập Google

---

**🚀 Sau khi hoàn thành tất cả các bước trên, chức năng Google Sign-In sẽ hoạt động!**
