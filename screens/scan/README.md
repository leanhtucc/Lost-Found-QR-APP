# QR Code Scanner - React Native Vision Camera

Màn hình quét QR code sử dụng `react-native-vision-camera` với UI đẹp và hiệu ứng animations.

## 📁 Structure

```
screens/scan/
├── index.tsx                      # Main screen (127 lines)
├── hooks/
│   └── useQRScanner.ts           # Scanner logic hook (123 lines)
└── components/
    ├── index.ts                   # Components export
    ├── ScannerHeader.tsx          # Header với nút đóng (35 lines)
    ├── ScannerView.tsx            # Camera view (52 lines)
    ├── ScannerOverlay.tsx         # UI overlay với animations (99 lines)
    ├── ScannerInstructions.tsx    # Hướng dẫn và status (53 lines)
    ├── ScannerError.tsx           # Error states (89 lines)
    └── ScannerLoading.tsx         # Loading state (22 lines)
```

## ✨ Features

- ✅ Real-time QR code scanning
- ✅ Smooth animations với Reanimated 2
- ✅ Beautiful UI với gradient và blur effects
- ✅ Error handling và permission management
- ✅ Loading states
- ✅ Success feedback
- ✅ Back button handling
- ✅ Deep link support (lostfoundqr://item/{id})

## 🎨 UI Components

### ScannerHeader

- Close button với backdrop blur
- App title

### ScannerView

- Camera view sử dụng Vision Camera
- QR code detection real-time
- Pinch to zoom support

### ScannerOverlay

- Scanning frame với corner indicators
- Animated scanning line
- Glow effects khi scanning
- Dark overlay với transparent center

### ScannerInstructions

- Hướng dẫn sử dụng
- Status hiển thị (đang quét, thành công)
- Camera icon indicator

### ScannerError

- Permission denied handling
- Error messages
- Retry button
- Open settings button

## 📱 Setup Required

### 1. Android - `android/app/src/main/AndroidManifest.xml`

```xml
<!-- Camera Permission -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Inside <application> tag -->
<application>
  <!-- ... -->

  <!-- Add hardware features -->
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
</application>
```

### 2. iOS - `ios/YourApp/Info.plist`

```xml
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần quyền camera để quét mã QR của vật phẩm</string>
```

### 3. Install Dependencies (Already installed)

```bash
npm install react-native-vision-camera
npm install react-native-reanimated
```

## 🚀 Usage

```typescript
import { ScanScreen } from '@screens/scan';

// In navigation
<Stack.Screen name="Scan" component={ScanScreen} />
```

## 🎯 QR Code Formats Supported

1. **Item ID only**: `cmlc1kwa10002ubl859b08doz`
2. **Deep Link**: `lostfoundqr://item/cmlc1kwa10002ubl859b08doz`
3. **URL**: `https://app.example.com/item/cmlc1kwa10002ubl859b08doz`

## 🔧 Customization

### Change Scanner Frame Size

In `ScannerOverlay.tsx`:

```tsx
<View className="w-72 h-72 relative"> // Change w-72 h-72
```

### Change Scan Animation Speed

In `ScannerOverlay.tsx`:

```tsx
withTiming(1, {
  duration: 2000, // Change duration
  easing: Easing.linear,
});
```

### Change Colors

Update Tailwind classes in components:

- `bg-blue-500` → Change blue color
- `border-blue-500` → Change border color

## 📝 Notes

- Camera khởi động tự động khi vào màn hình
- Tự động navigate đến ItemDetails sau khi scan thành công
- Hỗ trợ back button Android
- Xử lý confirmation khi đang scan và ấn back
- Auto-retry khi có lỗi

## 🐛 Troubleshooting

### Camera không khởi động

1. Kiểm tra permissions đã được cấp chưa
2. Kiểm tra AndroidManifest.xml và Info.plist
3. Rebuild app: `npx expo prebuild && npx expo run:android`

### Không quét được QR code

1. Đảm bảo QR code rõ ràng và đủ ánh sáng
2. Kiểm tra format QR code có đúng không
3. Xem console log để debug

### Performance issues

1. Giảm fps trong codeScanner config
2. Giảm animation duration
3. Tắt blur effects nếu cần
