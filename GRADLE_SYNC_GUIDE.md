# ✅ Google Services Gradle Plugin - SETUP HOÀN TẤT

## 📦 Đã cập nhật các file:

### 1. Root-level build.gradle

**File:** `android/build.gradle`

```gradle
dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
    // ✅ Added: Google services Gradle plugin
    classpath('com.google.gms:google-services:4.4.4')
}
```

### 2. App-level build.gradle

**File:** `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
// ✅ Added: Google services Gradle plugin
apply plugin: "com.google.gms.google-services"
```

### 3. Firebase Dependencies

**File:** `android/app/build.gradle`

```gradle
dependencies {
    implementation("com.facebook.react:react-android")

    // ✅ Added: Firebase BoM
    implementation(platform("com.google.firebase:firebase-bom:34.8.0"))

    // ✅ Added: Firebase Auth (for Google Sign In)
    implementation("com.google.firebase:firebase-auth")
}
```

## 🔄 Bước tiếp theo: Sync Gradle

### Option 1: Từ Android Studio (Khuyến nghị)

1. Mở Android Studio
2. File > Open > Chọn folder `android/`
3. Android Studio sẽ tự động detect và hiện popup "Gradle files have changed"
4. Click **"Sync Now"**
5. Đợi sync hoàn tất (~1-2 phút)

### Option 2: Từ Command Line

```bash
cd android
./gradlew --refresh-dependencies
```

### Option 3: Rebuild app với Expo

```bash
# Clear cache và rebuild
npx expo prebuild --clean
npx expo run:android
```

## ✅ Kiểm tra Setup thành công

Sau khi sync, kiểm tra:

1. **Không có lỗi build**
2. **File google-services.json được nhận diện:**
   - Check trong Android Studio: `app/` folder
   - Phải thấy file `google-services.json` màu xanh (không đỏ)

3. **Firebase initialized:**
   - Khi build app, check logcat không có error về Firebase
   - Log sẽ hiện: `FirebaseApp initialization successful`

## 📝 Tổng quan các file đã setup:

```
android/
├── build.gradle                    ✅ Added Google services classpath
├── app/
│   ├── build.gradle                ✅ Added plugin + Firebase dependencies
│   └── google-services.json        ✅ Firebase config
```

## 🎯 Flow hoàn chỉnh:

1. ✅ `google-services.json` - Firebase config
2. ✅ Root `build.gradle` - Google services plugin classpath
3. ✅ App `build.gradle` - Apply plugin + Firebase dependencies
4. ⏳ **Sync Gradle** - Bạn cần làm bước này
5. ⏳ Test Google Sign In

## 🐛 Troubleshooting

### Lỗi: "Plugin with id 'com.google.gms.google-services' not found"

**Fix:** Check classpath trong root build.gradle đã thêm chưa

### Lỗi: "File google-services.json is missing"

**Fix:** Đảm bảo file ở đúng vị trí `android/app/google-services.json`

### Lỗi: "Firebase Auth not found"

**Fix:** Sync Gradle lại hoặc rebuild app

### Build chậm

**Bình thường:** Lần đầu sync/build với Firebase sẽ chậm hơn (~2-3 phút)

## 📚 What's Next?

Sau khi sync Gradle thành công:

1. ✅ Lấy Google Web Client ID từ Firebase Console
2. ✅ Cập nhật vào `.env.dev`
3. ✅ Build và test Google Sign In

## 🚀 Ready!

Tất cả config đã sẵn sàng. Chỉ cần **sync Gradle** và test thôi!
