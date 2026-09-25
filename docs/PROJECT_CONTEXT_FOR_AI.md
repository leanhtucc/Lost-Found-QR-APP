# 📱 HỒ SƠ DỰ ÁN TOÀN DIỆN: LOST & FOUND QR APP

> **Mục đích tài liệu**: Dùng làm Master Prompt & Context nạp vào ChatGPT/Claude để AI hiểu thấu đáo kiến trúc, nghiệp vụ, tech stack, UI/UX hiện tại của dự án. Từ đó, AI có thể lên kế hoạch sửa giao diện (UI Refactor), tối ưu hóa trải nghiệm (UX Polish), hoàn thiện các tính năng còn thiếu và hỗ trợ viết mục dự án nổi bật cho CV/Portfolio.

---

## 🧭 PROMPT MẪU ĐỂ DÁN VÀO CHATGPT

```text
Bạn là một Senior Mobile Architect & Lead UI/UX Designer.
Dưới đây là toàn bộ tài liệu đặc tả kiến trúc, công nghệ, luồng nghiệp vụ và thiết kế của dự án mobile "Lost & Found QR" được xây dựng bằng React Native + Expo.
Hãy đọc kỹ tài liệu này làm nguồn thông tin gốc (Single Source of Truth) để:
1. Đánh giá hiện trạng UI/UX và lên kế hoạch chi tiết từng bước tái thiết kế (Refactor & Redesign) giao diện theo chuẩn hiện đại, thẩm mỹ cao (Fintech/SaaS style).
2. Lập lộ trình (Roadmap) hoàn thiện các module nghiệp vụ còn dang dở.
3. Giúp tôi tối ưu hóa mã nguồn, xử lý edge cases và hoàn thành dự án để đưa vào CV xin việc vị trí React Native / Mobile Developer ở mức độ nổi bật nhất.
```

---

## 1. 📌 TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** Lost & Found QR (Ứng dụng Định Danh Tài Sản & Tìm Kiếm Đồ Thất Lạc Bằng Mã QR Động)
- **Loại ứng dụng:** Mobile Application (Cross-platform: iOS & Android)
- **Nền tảng:** React Native 0.81 + Expo SDK 54 (Bare/Dev-Client workflow)
- **Package Name / Bundle ID:** `com.lostfound.app`
- **Backend API:** RESTful API (`API_URL`) kết hợp WebSocket Server (`Socket.io`) và Stream Chat CDN.
- **Giá trị cốt lõi giải quyết:**
  1. Người dùng dán mã QR động độc bản lên các đồ vật quan trọng (ví, chìa khóa, laptop, balo, thẻ xe...).
  2. Khi bị mất đồ, kích hoạt **Lost Mode** trên app.
  3. Người nhặt chỉ cần dùng camera quét QR (không cần cài app cũng mở được trang thông tin, hoặc dùng app quét để mở luồng Finder Flow).
  4. Người nhặt và chủ sở hữu kết nối qua **Chat thời gian thực bảo mật** (không lộ số điện thoại cá nhân).
  5. Hỗ trợ **Live Tracking bản đồ** khi hẹn gặp giao trả đồ và bảo vệ bằng **Mã PIN xác thực 4 số**.
  6. Tích hợp **Radar quét đồ mất xung quanh** qua GPS và cơ chế **Huy hiệu uy tín (Trust Score)**.

---

## 2. 🛠️ BỘ CÔNG NGHỆ (TECH STACK & ARCHITECTURE)

| Phân tầng                   | Công nghệ / Thư viện                           | Vai trò chi tiết                                                                                                                                                                                                            |
| :-------------------------- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core Framework**          | **React Native 0.81 + Expo SDK 54**            | Nền tảng phát triển ứng dụng di động đa nền tảng hiện đại nhất.                                                                                                                                                             |
| **Ngôn ngữ**                | **TypeScript (Strict Mode)**                   | 100% typed props, data models, API contracts và hooks.                                                                                                                                                                      |
| **Giao diện & Styling**     | **NativeWind v2 (Tailwind CSS for RN)**        | Styling utility-first, responsive, dễ mở rộng, kết hợp CSS Variables cho Dark/Light mode.                                                                                                                                   |
| **Fonts & Icons**           | **Be Vietnam Pro + Lucide React Native**       | Bộ font tiếng Việt chuẩn typographic và bộ icon vector đồng bộ.                                                                                                                                                             |
| **Hiệu ứng & Animation**    | **React Native Reanimated 4 + Framer Motion**  | Animation 60fps mượt mà, layout transitions, fade splash, skeleton.                                                                                                                                                         |
| **Điều hướng (Navigation)** | **React Navigation v7**                        | Stack Navigator lồng Bottom Tabs Navigator + Deep Linking (`lostfound://item/:id`).                                                                                                                                         |
| **Quản lý trạng thái**      | **React Context API + Zustand Store**          | `AuthContext`, `ItemsContext`, `ToastContext` và Zustand cho `returnsStore`.                                                                                                                                                |
| **Xác thực (Auth)**         | **Firebase Auth + Google Sign-In + Phone OTP** | Hỗ trợ 3 phương thức: Email/Mật khẩu, Google OAuth 2.0 (`@react-native-google-signin/google-signin`), SMS OTP Firebase.                                                                                                     |
| **Camera & QR Scanner**     | **React Native Vision Camera v4**              | Quét mã QR siêu tốc bằng camera native, hiệu năng cao.                                                                                                                                                                      |
| **Tạo mã QR**               | **react-native-qrcode-svg**                    | Render SVG QR Code động trên thiết bị, xuất ảnh để in hoặc chia sẻ.                                                                                                                                                         |
| **Bản đồ & Định vị**        | **react-native-maps + expo-location**          | Hiển thị bản đồ Google Maps, theo dõi vị trí live GPS của 2 bên khi giao nhận đồ.                                                                                                                                           |
| **Chat thời gian thực**     | **Stream Chat SDK**                            | Tin nhắn 1-1 bảo mật, đính kèm ảnh, trạng thái đã đọc, typing indicators.                                                                                                                                                   |
| **Socket Realtime**         | **Socket.io Client**                           | Kênh kết nối riêng cho tính năng Radar quét đồ mất và cập nhật trạng thái Return Session.                                                                                                                                   |
| **Giám sát & Báo lỗi kép**  | **Sentry React Native + Telegram Bot Logger**  | - Sentry: Theo dõi Crash, Performance, Session Replay.<br>- Telegram Bot: Bắn alert tức thì vào nhóm Telegram kèm Stacktrace, platform, OS version.<br>- ErrorBoundary: Chặn sập app, hiển thị màn hình fallback "Thử lại". |
| **Lưu trữ cục bộ**          | **AsyncStorage + Expo SecureStore**            | Lưu trữ JWT Tokens bảo mật, offline cache dữ liệu và cấu hình app.                                                                                                                                                          |

---

## 3. 📁 CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```text
LostAndFoundQR/
├── App.tsx                      # Entrypoint: Cấu hình Sentry, khởi tạo Telegram Logger, bọc AppRoot
├── app-root.tsx                 # Bootstrap: Splash Screen mượt, nạp font BeVietnamPro, bọc ErrorBoundary & Contexts
├── app.config.js                # Cấu hình dynamic Expo (Env vars, Plugins camera/maps/firebase)
├── index.ts                     # Register Root Component
├── babel.config.js              # Cấu hình NativeWind, module-resolver path aliases
├── tailwind.config.js           # Theme colors, tokens (Indigo, Slate, Emerald, Amber, Rose)
├── tsconfig.json                # TypeScript strict + Path aliases (@/*, @components/*, @screens/*...)
│
├── assets/                      # Hình ảnh, logo, splash screens
│
├── components/                  # Atomic Design Pattern
│   ├── atoms/                   # Nút bấm, Badge, InputField, Text, OverlayLoading, Spinners
│   ├── molecules/               # Card đồ vật, SearchBar, ListItem, StatCards
│   ├── ui/                      # Base UI elements
│   ├── home/                    # Component riêng cho Dashboard
│   ├── ErrorBoundary.tsx        # 🛡️ Bọc ứng dụng, bắt lỗi rendering và gửi alert về Telegram
│   └── index.ts                 # Barrel exports
│
├── screens/                     # Màn hình chia theo feature domain
│   ├── auth/                    # Login, Register, ForgotPassword, Google Login, Phone OTP
│   ├── home/                    # Dashboard: Tổng quan đồ thất lạc/an toàn, Quick actions, Thống kê
│   ├── scan/                    # Màn hình quét QR qua Vision Camera
│   ├── myItems/                 # Danh sách quản lý đồ dùng cá nhân, bộ lọc danh mục
│   ├── item-detail/             # Chi tiết đồ vật, tải/chia sẻ mã QR, bật/tắt Lost Mode
│   ├── found-item/              # Finder Flow: Hiển thị khi quét trúng đồ của người khác
│   ├── chat/                    # Danh sách cuộc trò chuyện và màn hình chat 1-1
│   ├── profile/                 # Hồ sơ cá nhân, chỉ số Trust Score, cài đặt bảo mật
│   ├── radar/                   # Quét tìm đồ thất lạc trong bán kính quanh vị trí hiện tại
│   ├── return-flow/             # Luồng hẹn gặp trả đồ + Live GPS Tracking trên Google Maps
│   └── notification/            # Trung tâm thông báo đẩy & hoạt động
│
├── navigation/                  # Điều hướng React Navigation
│   ├── index.tsx                # RootStackNavigator (Auth stack & Main app stack)
│   └── tab-navigator.tsx        # BottomTabNavigator (Home, Scan, Radar, Chat, Profile)
│
├── contexts/                    # State Management toàn cục
│   ├── AuthContext.tsx          # Quản lý User, JWT Access/Refresh Token, Login, Logout
│   ├── ItemsContext.tsx         # Quản lý danh sách đồ vật, CRUD, refresh, active item
│   └── ToastContext.tsx         # Hệ thống thông báo Toast nổi trên toàn app
│
├── services/                    # Tầng giao tiếp API (Service-based Layer)
│   ├── auth/                    # Đăng nhập, đăng ký, Google OAuth, Refresh token
│   ├── items/                   # API CRUD items, scan QR, chuyển đổi Lost/Safe
│   ├── chat/                    # Kênh Stream Chat, inbox channels
│   ├── notifications/           # Push notifications token, activity logs
│   ├── moderation/              # Báo cáo vi phạm, mute, ban người dùng xấu
│   ├── map/                     # Dịch vụ vị trí & geocoding
│   ├── radar/                   # API & Socket kết nối Radar tìm đồ quanh đây
│   ├── returns/                 # Quản lý phiên giao trả đồ, live coordinates, socket
│   ├── upload/                  # Tải ảnh đồ vật lên server
│   ├── telegram/                # 🤖 Telegram Logger Service (Alert lỗi và khởi động về group)
│   └── shared/url.ts            # Quản lý base URLs
│
├── hooks/                       # Custom React Hooks nghiệp vụ
│   ├── useAuth.ts               # Hook truy xuất AuthContext
│   ├── useGoogleAuth.ts         # Hook xử lý đăng nhập Google Native
│   ├── useLiveTracking.ts       # Hook theo dõi tọa độ GPS real-time
│   └── useReturnSession.ts      # Hook điều khiển phiên giao trả đồ
│
├── types/                       # Khai báo kiểu dữ liệu TypeScript
│   ├── auth.ts                  # User, AuthState, Session
│   ├── item.ts                  # Item, ItemCategory, ItemStatus, ScanResult
│   ├── chat.ts                  # ChatChannel, Message
│   ├── return-flow.ts           # ReturnSession, LocationCoords
│   └── notification.ts          # NotificationFeed, ActivityType
│
├── constants/                   # Hằng số toàn cục
│   ├── environment.ts           # Trình đọc biến môi trường (.env & app.config)
│   ├── theme.ts & colors.ts     # Bảng màu chủ đạo (Indigo #4F46E5)
│   └── categories.ts            # 8 danh mục đồ dùng (Electronics, Wallet, Keys...)
│
├── storage/                     # Quản lý AsyncStorage & SecureStore
│   ├── auth.ts                  # Lưu trữ tokens & profile
│   └── app.ts                   # Preferences, cờ onboarding
│
└── lib/                         # Tiện ích bổ trợ
    ├── cn.ts                    # Utility kết hợp Tailwind classes (clsx + twMerge)
    └── sessionEvents.ts         # Event Emitter xử lý khi phiên hết hạn (401)
```

---

## 4. 🔄 CÁC LUỒNG NGHIỆP VỤ CỐT LÕI (CORE BUSINESS FLOWS)

### Flow 1: Xác thực người dùng đa kênh (Multi-channel Authentication)

- Người dùng đăng nhập bằng Email/Password, Google OAuth (`@react-native-google-signin`) hoặc số điện thoại (SMS OTP).
- Backend trả về cặp `accessToken` và `refreshToken`. Token được lưu trữ trong `storage/auth.ts`.
- **Cơ chế Event-driven 401**: Khi bất kỳ request API nào trả về HTTP 401, hệ thống không làm sập app mà trigger `sessionEvents.emit('session_expired')` ➜ Màn hình `SessionExpiredModal` hiện lên nhắc nhở người dùng đăng nhập lại hoặc tự động refresh token mượt mà.

### Flow 2: Đăng ký đồ dùng & Sinh mã QR động

- Người dùng điền: Tên đồ vật, Chọn 1 trong 8 danh mục (`electronics`, `wallet`, `bag`, `keys`, `phone`, `jewelry`, `documents`, `other`), mô tả, ảnh chụp và tùy chọn Mã PIN bảo mật 4 số.
- API tạo bản ghi với `itemId` dạng nanoID(16) và sinh URL mã QR.
- App sử dụng `react-native-qrcode-svg` để render mã QR chất lượng cao, cho phép người dùng **Lưu ảnh về máy** hoặc **In trực tiếp** để dán lên đồ vật.

### Flow 3: Kích hoạt chế độ Báo Mất (Lost Mode)

- Khi phát hiện thất lạc đồ: Vào màn hình chi tiết món đồ ➜ Gạt switch **"Kích hoạt Lost Mode"**.
- Người dùng nhập lời nhắn gửi đến người nhặt (Lost Message - ví dụ: _"Mình để quên ví trên xe bus số 08, xin hậu tạ khi nhận lại"_).
- Trạng thái item chuyển sang `lost`. Lúc này nếu có người quét mã, thông tin Lost Mode sẽ lập tức kích hoạt.

### Flow 4: Người nhặt quét mã QR (Finder Flow)

- Mở tab **Quét QR** (sử dụng Vision Camera).
- Khi phát hiện mã QR định dạng Lost & Found (`GET /api/scan/:itemId`):
  - **Trường hợp 1 (Đồ của chính mình):** Chuyển ngay đến màn hình quản lý `ItemDetail`.
  - **Trường hợp 2 (Đồ đang báo mất `status === 'lost'`):** Mở màn hình `FoundItem Screen` hiển thị lời nhắn của chủ nhân, điểm uy tín (Trust Score) của chủ nhân và nút kêu gọi: **"Nhắn tin cho chủ sở hữu"**.
  - **Trường hợp 3 (Đồ chưa báo mất `status === 'safe'`):** Hiển thị màn hình thông báo đồ vật đã được định danh an toàn.

### Flow 5: Trò chuyện bảo mật không lộ danh tính

- Khi người nhặt bấm "Nhắn tin cho chủ sở hữu", hệ thống tự động tạo kênh chat Stream Chat 1-1 gán theo `itemId`.
- Hai bên nhắn tin trao đổi trực tiếp trên ứng dụng mà **không cần để lộ số điện thoại hay địa chỉ nhà riêng**.
- Tích hợp **Moderation Service**: Người dùng có thể Flag tin nhắn độc hại, Mute hoặc Ban người dùng quấy rối.

### Flow 6: Hẹn gặp & Giao trả đồ với Live Tracking trên Google Maps

- Hai bên đồng ý giao trả ➜ Bắt đầu phiên `Return Session`.
- Ứng dụng mở màn hình `LiveTracking` sử dụng `react-native-maps` và `expo-location`.
- Hai bên có thể nhìn thấy vị trí GPS của nhau di chuyển theo thời gian thực để dễ dàng tìm thấy điểm hẹn.
- Khi gặp mặt: Người nhặt yêu cầu chủ đồ đọc đúng **Mã PIN bảo mật 4 số** (hoặc quét mã xác nhận bàn giao).
- Xác nhận hoàn tất: Item chuyển về `safe`, ghi nhận lịch sử và **cộng điểm Trust Score** cho người nhặt!

### Flow 7: Radar quét đồ thất lạc quanh đây

- Người dùng bật màn hình Radar: Ứng dụng lấy vị trí GPS hiện tại và kết nối Socket.io đến cụm máy chủ Radar.
- Hệ thống quét các món đồ đang ở trạng thái `lost` trong bán kính lân cận (1km - 5km) và hiển thị trực quan dạng sóng Radar kèm khoảng cách ước tính.

### Flow 8: Hệ thống Giám sát lỗi kép (Sentry + Telegram Bot)

- **Sentry**: Thu thập crashlytics, breadcrumbs, session replay.
- **Telegram Bot Logger**: Khi xảy ra Unhandled JS Crash hoặc React Render Error, file `services/telegram/telegramLogger.ts` bắt lại và gửi ngay lập tức một thông báo HTML về nhóm Telegram của Dev team:
  - Tên lỗi & Message
  - Thiết bị (Android/iOS, Phiên bản)
  - Môi trường (Development/Production)
  - Stack trace cắt gọn dễ đọc
  - Cơ chế chống Spam (Deduplication 30s)
- **ErrorBoundary UI**: Thay vì văng ứng dụng ra màn hình chính điện thoại, app hiển thị màn hình thông báo sự cố lịch sự kèm nút "Thử lại".

---

## 5. 🎨 ĐẶC TẢ GIAO DIỆN (UI/UX CURRENT STATE & DESIGN TOKENS)

### Bảng màu định danh (Design Tokens):

- **Màu chủ đạo (Primary):** `Indigo-600` (`#4F46E5`), `Indigo-500` (`#6366F1`), `Indigo-700` (`#4338CA`)
- **Nền ứng dụng (Dark Backgrounds):** `#0F1017` (Deep Dark Canvas), `#1A1C29` (Card Surface), `#2A2D40` (Border Stroke)
- **Màu trạng thái:**
  - `Emerald-500` (`#10B981`): Safe / Đã tìm thấy / Thành công
  - `Amber-500` (`#F59E0B`): Cảnh báo / Đang chờ bàn giao
  - `Rose-500` (`#EF4444`): Lost Mode / Báo mất / Nguy hiểm
  - `Blue-500` (`#3B82F6`): Verified Badge / Liên kết

### Typography:

- Font Family: `Be Vietnam Pro` (chuẩn font chữ tiếng Việt, bo góc hiện đại).
- Các trọng số sử dụng: `BeVietnamPro_400Regular`, `500Medium`, `600SemiBold`, `700Bold`.

### Thành phần giao diện (Atomic Components):

- Custom Splash Screen với logo chuyển động fade mượt mà.
- Top Bar với avatar người dùng, điểm Trust Score và chuông thông báo có chấm đỏ unread.
- Dashboard Card: Thống kê số đồ đã đăng ký, số đồ đang báo mất, tỷ lệ tìm thấy.
- Bottom Sheet kéo vuốt chọn danh mục và thao tác nhanh.

---

## 6. ⚠️ NHỮNG ĐIỂM CẦN CẢI THIỆN VỀ GIAO DIỆN & TRẢI NGHIỆM (UI/UX AUDIT)

Dưới đây là các vấn đề cần ChatGPT tư vấn giải pháp và lên kế hoạch refactor:

1. **Tính nhất quán của Theme (Dark/Light mode):** Một số màn hình vẫn còn đan xen giữa nền trắng và nền tối, cần chuẩn hóa 100% về Theme đồng nhất (khuyên dùng Dark Mode công nghệ hiện đại làm mặc định).
2. **Trải nghiệm Quét Camera (Vision Camera):** Cần bổ sung khung ngắm quét laser quét lên xuống (Scanning HUD animation), nút bật đèn Flash pin, nút chọn ảnh QR từ thư viện và âm thanh Haptic Feedback khi quét trúng mã.
3. **Màn hình Chi tiết Đồ vật (Item Detail):** Cần làm lại theo dạng Thẻ định danh số (Digital Identity Card), hiển thị mã QR to rõ ràng, các nút bấm "Tải mã QR" và "Báo mất" cần nổi bật và trực quan hơn.
4. **Màn hình Radar:** Cần hiệu ứng radar xoay tròn (radar sweep pulse animation) đẹp mắt, các chấm đồ vật rơi vào phạm vi quét có hiệu ứng nhấp nháy phát sáng (pulsing dots).
5. **Micro-interactions:** Bổ sung Skeleton Loading khi đợi API, Empty State có minh họa vector sinh động, Toast thông báo mượt mà.
6. **Màn hình Trả đồ (Return Session):** Cần tối ưu bản đồ Google Maps hiển thị marker của 2 người, khoảng cách di chuyển và modal xác nhận mã PIN 4 số lớn dễ bấm.

---

## 7. 🚀 LỘ TRÌNH HOÀN THIỆN DỰ ÁN (COMPLETION ROADMAP)

### Giai đoạn 1: Chuẩn hóa & Nâng cấp toàn diện UI/UX (UI Polish & Modernization)

- [ ] Thiết kế lại hệ thống Component cơ bản (Buttons, Inputs, Cards, Badges) theo phong cách Pro/SaaS.
- [ ] Bổ sung hiệu ứng chuyển động Reanimated cho các tương tác chạm, kéo, mở modal.
- [ ] Chuẩn hóa Empty State (khi chưa có đồ nào, chưa có tin nhắn nào, chưa có thông báo).
- [ ] Thêm Skeleton Shimmer Loading thay cho ActivityIndicator đơn điệu.

### Giai đoạn 2: Hoàn thiện tính năng chuyên sâu (Deep Features Completion)

- [ ] Tích hợp Upload ảnh thực tế lên Cloudinary/S3 khi tạo món đồ mới.
- [ ] Hoàn thiện trọn vẹn luồng Live Tracking trên Google Maps với chỉ đường (Directions API).
- [ ] Hoàn thiện Modal nhập mã PIN 4 số xác thực bàn giao đồ.
- [ ] Tối ưu hóa Radar Socket bắt sự kiện thời gian thực.

### Giai đoạn 3: Tối ưu hiệu năng & Offline-first

- [ ] Caching danh sách đồ dùng bằng AsyncStorage để mở app là thấy ngay dữ liệu (Instant Loading).
- [ ] Tối ưu danh sách dài bằng `@shopify/flash-list` thay cho FlatList thông thường.
- [ ] Tích hợp thông báo mất kết nối mạng (Network Offline Banner).

### Giai đoạn 4: Đóng gói sản phẩm & Đưa vào CV

- [ ] Build file APK / TestFlight preview qua Expo EAS Build.
- [ ] Tạo video demo 60 giây và bộ ảnh chụp màn hình đẹp (Mockup frames).
- [ ] Viết tài liệu README chuẩn chỉnh trên GitHub với đầy đủ badges, gif demo, architecture diagram.

---

## 8. 💼 HƯỚNG DẪN VIẾT DỰ ÁN NÀY VÀO CV (CV BULLET POINTS SHOWCASE)

Khi đưa dự án này vào CV ứng tuyển vị trí **React Native Developer / Mobile Engineer**, hãy trình bày theo công thức **STAR / XYZ (Accomplished [X] as measured by [Y], by doing [Z])**:

### Tên dự án: **Lost & Found QR — Mobile Asset Identification & Recovery Platform**

- **Vị trí:** Lead Mobile Developer / Core Contributor
- **Thời gian:** [Tháng/Năm - Hiện tại]
- **Tech Stack:** React Native, Expo SDK 54, TypeScript, NativeWind/Tailwind, Firebase Auth, Google Maps, Vision Camera, Stream Chat, Socket.io, Sentry, Telegram Bot API.

#### Các gạch đầu dòng nổi bật trong CV:

- **Kiến trúc & Hiệu năng:** Xây dựng ứng dụng di động hoàn chỉnh đa nền tảng (iOS & Android) bằng React Native và TypeScript, áp dụng kiến trúc Atomic Design và Service-based layer giúp module hóa 100% logic API.
- **Tính năng Phần cứng & QR:** Ứng dụng `react-native-vision-camera` để quét mã QR thời gian thực với tốc độ nhận diện dưới 300ms; tự động sinh mã QR vector (`react-native-qrcode-svg`) phục vụ in ấn định danh tài sản.
- **Xác thực & Bảo mật:** Tích hợp đa dạng cơ chế xác thực gồm Firebase Phone OTP, Google Sign-In và Email/Password; xử lý refresh JWT token tự động và bắt lỗi 401 thông qua Event Emitter pattern.
- **Tính năng Thời gian thực & Bản đồ:** Phát triển luồng bàn giao đồ thất lạc với Live GPS Tracking trên `react-native-maps`, kết hợp hệ thống chat thời gian thực qua Stream Chat SDK và quét radar đồ mất xung quanh bằng WebSocket (`Socket.io`).
- **Giám sát & Độ tin cậy (DevOps / Reliability):** Thiết lập hệ thống giám sát sự cố kép với Sentry Crashlytics và custom Telegram Bot Webhook báo cáo tức thời các lỗi Fatal Crash kèm thông tin thiết bị và stacktrace; bọc React ErrorBoundary ngăn ngừa ứng dụng bị sập đột ngột.
