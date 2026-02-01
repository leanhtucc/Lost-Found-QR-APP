# 📱 Hướng Dẫn Lấy File google-services.json

## ⚠️ Quan Trọng

File `google-services.json` là **BẮT BUỘC** để Google Sign-In hoạt động trên Android.

---

## 🔧 Cách Lấy File

### Bước 1: Truy cập Firebase Console

1. Mở [Firebase Console](https://console.firebase.google.com)
2. Chọn project của bạn (hoặc tạo project mới)

### Bước 2: Thêm hoặc Cấu hình Android App

#### Nếu chưa có Android app:

1. Click **Add app** (hoặc icon Android)
2. Nhập thông tin:
   - **Android package name**: `com.lostfound.app`
   - **App nickname** (optional): `LostAndFoundQR`
   - **SHA-1** (optional - có thể thêm sau)
3. Click **Register app**

#### Nếu đã có Android app:

1. Vào **⚙️ Project Settings**
2. Scroll xuống phần **Your apps**
3. Tìm Android app với package name: `com.lostfound.app`
4. Nếu package name khác, cần tạo app mới hoặc đổi package trong project

### Bước 3: Download google-services.json

1. Trong phần cấu hình Android app, click **Download google-services.json**
2. Hoặc click vào icon ⚙️ bên cạnh Android app > **Download google-services.json**

### Bước 4: Copy File vào Project

Copy file `google-services.json` vào thư mục:

```
android/app/google-services.json
```

Đường dẫn đầy đủ:

```
C:\Users\Microsoft\Documents\LostAndFoundQR\android\app\google-services.json
```

### Bước 5: Cập nhật app.json

Sau khi đã có file, uncomment dòng này trong `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.lostfound.app",
      "googleServicesFile": "./android/app/google-services.json"
    }
  }
}
```

### Bước 6: Rebuild Project

```bash
npm run prebuild
# hoặc
npx expo prebuild --clean
```

---

## 📋 Checklist

- [ ] Tạo/chọn Firebase project
- [ ] Thêm Android app với package: `com.lostfound.app`
- [ ] Download `google-services.json`
- [ ] Copy file vào `android/app/google-services.json`
- [ ] Uncomment `googleServicesFile` trong `app.json`
- [ ] Chạy `npm run prebuild`

---

## 🔍 Kiểm Tra Package Name

Đảm bảo package name khớp nhau:

**app.json:**

```json
"android": {
  "package": "com.lostfound.app"
}
```

**Firebase Console:**

- Android app package name: `com.lostfound.app`

**google-services.json:**

```json
{
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.lostfound.app"
        }
      }
    }
  ]
}
```

---

## ⚠️ Lưu Ý

1. **File này chứa thông tin nhạy cảm** - Đừng commit lên Git công khai
2. Đã thêm vào `.gitignore`: `android/app/google-services.json`
3. Mỗi môi trường (dev/prod) có thể cần file khác nhau
4. Nếu đổi package name, cần tạo lại Android app trên Firebase

---

## 🚀 Sau Khi Hoàn Thành

Google Sign-In sẽ hoạt động với flow:

1. User click nút "Đăng nhập bằng Google"
2. App mở Google Sign-In dialog
3. User chọn tài khoản và cho phép quyền
4. App nhận ID Token
5. Gửi ID Token đến backend để xác thực
6. Backend trả về user info và access token
7. User đăng nhập thành công
