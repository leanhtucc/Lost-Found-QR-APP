# 🔧 Fix: expo-module-gradle-plugin Error

## ❌ Lỗi gặp phải:

```
Plugin [id: 'expo-module-gradle-plugin'] was not found
```

## 🔍 Nguyên nhân:

Khi cài thêm Expo native modules mới như:

- `expo-auth-session`
- `expo-web-browser`
- `expo-crypto`
- Bất kỳ package `expo-*` nào cần native code

Android cần được rebuild và cấu hình lại native modules.

## ✅ Giải pháp:

### Option 1: Expo Prebuild (Khuyến nghị)

```bash
# Clear và rebuild native code
npx expo prebuild --clean

# Sau đó build app
npx expo run:android
```

**Lệnh này sẽ:**

1. Xóa folder `android/` và `ios/` cũ
2. Tạo lại native code với config mới
3. Tự động thêm tất cả Expo modules cần thiết
4. Cấu hình Gradle đúng

### Option 2: Manual Fix (Nâng cao)

Nếu không muốn xóa native code, thêm vào `android/settings.gradle`:

```gradle
// Thêm vào đầu file
apply from: new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootDir).text.trim(), "../scripts/autolinking.gradle")
useExpoModules()
```

Sau đó:

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

## 📝 Khi nào cần chạy lại?

Chạy `npx expo prebuild --clean` khi:

- ✅ Cài thêm package Expo native mới
- ✅ Update Expo SDK version
- ✅ Thay đổi `app.json` config (như plugins, scheme, permissions)
- ✅ Gặp lỗi Gradle liên quan đến Expo modules
- ✅ Build Android bị lỗi sau khi `npm install`

## ⚠️ Lưu ý quan trọng:

### Trước khi chạy prebuild:

1. **Commit code hiện tại:**
   ```bash
   git add .
   git commit -m "Before prebuild"
   ```
2. **Backup custom changes trong android/**
   - Nếu có custom native code
   - Nếu đã sửa `AndroidManifest.xml`, `build.gradle` thủ công

### Sau khi prebuild:

1. **Check lại custom config:**
   - `android/app/google-services.json` - Có thể bị xóa
   - `android/app/build.gradle` - Google services plugin
   - `android/build.gradle` - Google services classpath

2. **Re-apply custom changes nếu cần**

## 🔄 Workflow chuẩn:

```bash
# 1. Cài package mới
npm install expo-auth-session expo-web-browser expo-crypto

# 2. Prebuild (tự động config native)
npx expo prebuild --clean

# 3. Re-add google-services.json nếu bị xóa
# Copy lại file từ backup hoặc Firebase

# 4. Build app
npx expo run:android
```

## 🐛 Troubleshooting:

### Lỗi: "google-services.json missing" sau prebuild

```bash
# Copy lại file từ root hoặc backup
cp firebase/google-services.json android/app/google-services.json
```

### Lỗi: "Google services plugin not applied"

Check lại [android/app/build.gradle](../android/app/build.gradle):

```gradle
apply plugin: "com.google.gms.google-services"
```

Và [android/build.gradle](../android/build.gradle):

```gradle
classpath('com.google.gms:google-services:4.4.4')
```

### Build vẫn lỗi sau prebuild

```bash
# Clear Gradle cache
cd android
./gradlew clean
./gradlew --stop
cd ..

# Clear Metro cache
npx expo start -c

# Build lại
npx expo run:android
```

## 📚 Related:

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [GRADLE_SYNC_GUIDE.md](../GRADLE_SYNC_GUIDE.md)

## ✅ Checklist sau prebuild:

- [ ] Build thành công
- [ ] `google-services.json` vẫn còn trong `android/app/`
- [ ] Google services plugin vẫn được apply
- [ ] App chạy được trên emulator/device
- [ ] Google Sign In vẫn hoạt động
