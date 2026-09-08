# 🤖 AI-AGENT — Lost & Found QR App Context

> **Mục đích**: File này cung cấp toàn bộ context về codebase cho AI Agent.
> Khi bắt đầu conversation mới, hãy đọc file này TRƯỚC để hiểu rõ project
> mà không cần phải scan lại toàn bộ codebase.

---

## 📌 Tổng Quan Dự Án

**Lost & Found QR** là ứng dụng mobile giúp người dùng:

- **Đăng ký tài sản** và tạo mã QR gắn lên đồ vật
- **Báo mất** khi thất lạc đồ → người nhặt được quét QR → mở chat với chủ sở hữu
- **Live tracking** vị trí khi giao trả đồ
- **Hệ thống Trust Score** đánh giá uy tín người dùng
- **Moderation** chat: flag message, mute/ban user

**Backend API**: `https://backend-api-8rw9.onrender.com`
**Package name**: `com.lostfound.app`

---

## 🛠️ Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| **Framework**      | React Native + Expo SDK 54                       |
| **Language**       | TypeScript (strict mode)                         |
| **Navigation**     | `@react-navigation/native` (Stack + Bottom Tabs) |
| **Styling**        | NativeWind v2 (Tailwind CSS for RN)              |
| **State**          | React Context API (Auth, Items, Toast)           |
| **Auth**           | Firebase Auth + Google Sign-In + Phone OTP       |
| **Chat**           | Stream Chat SDK                                  |
| **Maps**           | `react-native-maps` (Live Tracking)              |
| **QR Scanner**     | `react-native-vision-camera`                     |
| **QR Generate**    | `react-native-qrcode-svg`                        |
| **Error Tracking** | `@sentry/react-native`                           |
| **i18n**           | `react-i18next`                                  |
| **Fonts**          | `@expo-google-fonts/be-vietnam-pro`              |
| **Icons**          | `lucide-react-native`                            |
| **Animations**     | `react-native-reanimated`                        |
| **Storage**        | `@react-native-async-storage/async-storage`      |
| **Build**          | EAS Build (dev / preview / production)           |

---

## 📁 Cấu Trúc Thư Mục

```
LostAndFoundQR/
├── App.tsx                  # Khởi tạo Sentry, gọi AppRoot
├── app-root.tsx             # Bootstrap: splash, fonts, context wrapping
├── index.ts                 # Entry point (registerRootComponent)
├── app.config.js            # Expo config (env vars, plugins)
├── AI-AGENT.md              # 📌 FILE NÀY — Context cho AI
├── README.md                # Project overview
│
├── components/              # UI Components (Atomic Design)
│   ├── atoms/               #   Button, Badge, Input...
│   ├── molecules/           #   Card, ListItem...
│   ├── ui/                  #   Base UI elements
│   ├── home/                #   Home-specific components
│   └── icons/               #   Custom icon components
│
├── screens/                 # Màn hình (grouped by feature)
│   ├── auth/                #   Login, Register, ForgotPassword, VerifyCode
│   ├── home/                #   Dashboard + StatisticsCard + ItemCard
│   ├── scan/                #   QR Scanner (Vision Camera)
│   ├── item-detail/         #   Chi tiết item + QR + Lost Mode
│   ├── found-item/          #   Finder flow (khi scan được đồ người khác)
│   ├── myItems/             #   Danh sách đồ vật của user
│   ├── chat/                #   Chat list + Chat detail (Stream)
│   ├── profile/             #   Profile + Trust Metrics + Settings
│   ├── return-flow/         #   Luồng trả đồ + Live Tracking
│   └── notification/        #   Thông báo real-time
│
├── navigation/              # React Navigation
│   ├── index.tsx            #   Root Stack Navigator
│   └── tab-navigator.tsx    #   Bottom Tab Navigator (Home, Scan, Chat, Profile)
│
├── contexts/                # React Context Providers
│   ├── AuthContext.tsx       #   User, tokens, login/logout
│   ├── ItemsContext.tsx      #   Items CRUD, dashboard data
│   └── ToastContext.tsx      #   In-app toast notifications
│
├── services/                # API Layer (fetch-based)
│   ├── auth/                #   Login, register, Google auth, refresh token
│   ├── items/               #   CRUD items, scan QR, update status
│   ├── chat/                #   Stream Chat channels, inbox
│   ├── notifications/       #   Push tokens, activity feed, Stream token
│   ├── moderation/          #   Flag, mute, ban
│   ├── map/                 #   Location services
│   ├── reports/             #   Report found items
│   ├── returns/             #   Return session management
│   └── upload/              #   Image upload
│
├── hooks/                   # Custom React Hooks
│   ├── useAuth.ts           #   Auth state & actions
│   ├── useGoogleAuth.ts     #   Google OAuth flow
│   ├── useFirebasePhoneAuth.ts  # Firebase Phone OTP
│   ├── useLiveTracking.ts   #   Real-time location tracking
│   └── useReturnSession.ts  #   Return handover session
│
├── types/                   # TypeScript Definitions
│   ├── item.ts              #   Item, ItemCategory, ItemStatus, ScanResponse
│   ├── auth.ts              #   User, AuthState, LoginRequest
│   ├── chat.ts              #   ChatChannel, ChatMessage, InboxChannel
│   ├── notification.ts      #   Notification, ActivityType
│   └── return-flow.ts       #   ReturnSession, TrackingState
│
├── constants/               # App Constants
│   ├── theme.ts             #   Colors (Indigo primary), spacing
│   ├── colors.ts            #   Color palette
│   ├── categories.ts        #   Item categories + icons + labels
│   ├── environment.ts       #   ENV vars reader
│   └── fonts.ts             #   Font configuration
│
├── storage/                 # AsyncStorage Wrappers
│   ├── auth.ts              #   Tokens, user data persistence
│   ├── app.ts               #   App preferences, onboarding flag
│   └── device.ts            #   Device ID
│
├── firebase/                # Firebase Config
│   └── android/             #   google-services.json
│
├── lib/                     # Core Utilities
│   ├── cn.ts                #   Tailwind class merging (clsx + twMerge)
│   └── sessionEvents.ts     #   Event emitter for session expiry
│
├── styles/                  # Global Styles
│   └── global.css           #   NativeWind CSS variables (light/dark)
│
├── translations/            # i18n Locale Files
│   ├── en.json
│   └── vi.json
│
├── utils/                   # Utility Functions
├── scripts/                 # Build/Dev Scripts
│   └── pre-commit           #   Git hook
│
└── docs/                    # 📚 Tất cả tài liệu chi tiết
    ├── CHAT_API.md
    ├── ITEMS_API.md
    ├── MODERATION_API.md
    ├── NOTIFICATIONS_API.md
    ├── QR_CODE_GENERATION.md
    ├── ITEMS_IMPLEMENTATION_SUMMARY.md
    ├── ITEM_DETAIL_SCREEN.md
    ├── NOTIFICATIONS_SCREEN.md
    ├── PROFILE_SCREEN.md
    ├── PROJECT_STRUCTURE.md
    ├── CODE_QUALITY.md
    ├── EAS_GUIDE.md
    ├── GIT_HOOKS.md
    ├── GOOGLE_SIGNIN_SETUP.md
    ├── CHECKLIST.md
    ├── REDESIGN_SUMMARY.md
    ├── SECURITY.md
    ├── SETUP_GOOGLE_SIGNIN.md
    ├── TAILWIND_SETUP_SUMMARY.md
    └── TEST_GOOGLE_LOGIN.md
```

---

## 🏗️ Architecture & Design Patterns

### 1. Feature-Based Screen Organization

Mỗi screen được tổ chức theo feature domain:

```
screens/<feature>/
├── index.tsx                # Main screen component
├── hooks/                   # Feature-specific hooks
│   └── use<Feature>.ts
└── components/              # Feature-specific components
    ├── <Component>.tsx
    └── index.ts             # Barrel exports
```

### 2. Service-Based API Layer

API calls được abstract trong `services/`, sử dụng typed wrappers:

```typescript
// Pattern: services/<domain>/api.ts
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = await authStorage.getAccessToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  return response.json();
}
```

**Response format chuẩn:**

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}
```

### 3. Event-Driven Session Management

Khi token hết hạn (401), hệ thống dùng event emitter thay vì prop drilling:

```
API call → 401 response → sessionEvents.emit('session_expired')
                                    ↓
              app-root.tsx → SessionExpiredModal → logout()
```

**File**: `lib/sessionEvents.ts`

### 4. Context-Based State Management

```
AppRoot wraps:
  └── AuthContext (user, tokens, login/logout)
       └── ItemsContext (items CRUD, dashboard)
            └── ToastContext (global toast notifications)
                 └── NavigationContainer
                      └── RootStackNavigator
```

### 5. Atomic Design Components

```
components/
├── atoms/        # Smallest units: Button, Badge, Text
├── molecules/    # Combinations: Card, ListItem, SearchBar
├── ui/           # Base elements with built-in validation
└── <feature>/    # Feature-specific composed components
```

### 6. Smart App Bootstrap

```
App.tsx
  └── Sentry.wrap(AppRoot)
       └── app-root.tsx
            ├── Custom splash screen fade
            ├── Font loading (Be Vietnam Pro)
            ├── Context providers wrapping
            └── Navigation setup
```

---

## 🧭 Navigation Structure

### Auth Flow (Unauthenticated)

```
Onboarding → Login ↔ Register
                ↓
          ForgotPassword → VerifyCode
```

### Main Flow (Authenticated)

```
TabNavigator
├── Home Tab          → ItemDetails, AddItem
├── Scan Tab          → FoundItem (other's item), ItemDetails (own item)
├── Chat Tab          → ChatDetail
└── Profile Tab       → Settings

Overlay Screens (full-screen từ bất kỳ tab nào):
├── LiveTracking      # Real-time map tracking
├── FoundItemReport   # Báo cáo tìm thấy đồ
├── ReturnFlow        # Luồng trả đồ
└── Notifications     # Thông báo
```

### Deep Linking

```
lostfound://item/<itemId>
lostfoundapp://item/<itemId>
```

---

## 👤 User Model

```typescript
interface User {
  id: string;
  uid: string; // Firebase UID
  memberId: string; // UUID định danh chính
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber: string;
  address?: string;
  bio?: string;
  trustScore: number; // 0-100
  isVerified: boolean;
  totalReturned: number;
  createdAt: string;
}

// Trust Levels:
// 🥉 Bronze: < 50 điểm
// 🥈 Silver: 50-69 điểm
// 🥇 Gold: 70-89 điểm
// 💎 Platinum: ≥ 90 điểm
```

---

## 📦 Item Model

```typescript
interface Item {
  id: string; // UUID (database)
  itemId: string; // nanoid(16) → dùng cho QR
  ownerId: string;
  name: string; // max 100 chars
  category: ItemCategory; // 8 categories
  description?: string; // max 500 chars
  status: 'safe' | 'lost';
  lostMessage?: string; // max 500 chars
  qrCodeUrl: string; // URL QR Code
  imagePublicUrl?: string;
  lastSeenLocation?: { lat: number; lng: number };
  securityPin?: string; // 4 digits
  createdAt: string;
  updatedAt: string;
}

type ItemCategory =
  | 'electronics' // 💻
  | 'wallet' // 👛
  | 'bag' // 🎒
  | 'keys' // 🔑
  | 'phone' // 📱
  | 'jewelry' // 💍
  | 'documents' // 📄
  | 'other'; // 📦
```

---

## 🔌 API Endpoints Tổng Hợp

### Auth

| Method | Endpoint                  | Auth | Description               |
| ------ | ------------------------- | ---- | ------------------------- |
| POST   | `/api/auth/google`        | ❌   | Google Sign-In            |
| POST   | `/api/auth/login`         | ❌   | Email/Password login      |
| POST   | `/api/auth/register`      | ❌   | Register                  |
| POST   | `/api/auth/refresh-token` | ❌   | Refresh access token      |
| PATCH  | `/api/auth/profile`       | ✅   | Update profile/push token |

### Items

| Method | Endpoint                | Auth | Description               |
| ------ | ----------------------- | ---- | ------------------------- |
| GET    | `/api/items`            | ✅   | List items (filter/page)  |
| GET    | `/api/items/:id`        | ✅   | Get item detail           |
| POST   | `/api/items`            | ✅   | Create item               |
| PATCH  | `/api/items/:id`        | ✅   | Update item               |
| DELETE | `/api/items/:id`        | ✅   | Delete item               |
| PATCH  | `/api/items/:id/status` | ✅   | Update status (lost/safe) |
| GET    | `/api/scan/:itemId`     | ❌   | Scan QR (public)          |

### Chat (Stream)

| Method | Endpoint                               | Auth | Description      |
| ------ | -------------------------------------- | ---- | ---------------- |
| GET    | `/api/stream/token`                    | ✅   | Get Stream token |
| POST   | `/api/stream/channels/:itemId/:finder` | ✅   | Create channel   |
| GET    | `/api/stream/channels`                 | ✅   | Get inbox        |
| PUT    | `/api/stream/channels/:id/close`       | ✅   | Close channel    |

### Notifications

| Method | Endpoint                              | Auth | Description       |
| ------ | ------------------------------------- | ---- | ----------------- |
| GET    | `/api/stream/notifications`           | ✅   | Get notifications |
| POST   | `/api/stream/notifications/mark-read` | ✅   | Mark all read     |
| POST   | `/api/stream/activity/:type`          | ✅   | Log activity      |

### Moderation

| Method | Endpoint                                | Auth | Description    |
| ------ | --------------------------------------- | ---- | -------------- |
| POST   | `/api/stream/messages/:id/flag`         | ✅   | Flag message   |
| DELETE | `/api/stream/messages/:id/flag`         | ✅   | Unflag message |
| POST   | `/api/stream/channels/:id/mute/:userId` | ✅   | Mute user      |
| DELETE | `/api/stream/channels/:id/mute/:userId` | ✅   | Unmute user    |
| POST   | `/api/stream/channels/:id/ban/:userId`  | ✅   | Ban user       |

---

## 🎨 Theme & Styling

### Primary Color: Indigo

```
Primary:   #4F46E5 (indigo-600)
Light:     #6366f1 (indigo-500)
Dark:      #4338ca (indigo-700)
Success:   #10B981 (emerald-500)
Verified:  #3b82f6 (blue-500)
```

### NativeWind Custom Utilities

```css
.card-elevated    /* Card với bg, border, shadow */
.btn-gradient     /* Button với gradient */
.glass-panel      /* Glass morphism effect */
.scrollbar-hide   /* Ẩn scrollbar */
```

### CSS Variables (Light/Dark Mode)

Defined in `styles/global.css` — HSL format cho dynamic theming.

---

## 🔐 Auth Flow

```
1. App Start → Check authStorage for tokens
2. Token exists → Validate → AuthContext.user = userData
3. No token → Show Onboarding → Login/Register
4. Google Sign-In:
   expo-auth-session → Google idToken → POST /api/auth/google → tokens
5. Phone OTP:
   Firebase Auth → verifyPhoneNumber → confirmCode → backend verify
6. Token Refresh:
   401 → sessionEvents.emit('session_expired') → auto refresh or logout
```

---

## 📱 Core User Flows

### Flow 1: Đăng ký đồ vật

```
Home → [+] Add Item → Fill form (name, category, description, photo)
  → POST /api/items → QR Code generated → Download/Share QR
  → Dán QR lên đồ vật
```

### Flow 2: Báo mất

```
Home → Item Card → Item Detail → Toggle Lost Mode ON
  → Nhập lost message → PATCH /api/items/:id/status {status: 'lost'}
  → Chờ người nhặt quét QR
```

### Flow 3: Người nhặt quét QR (Finder Flow)

```
Scan Tab → Camera → Scan QR → GET /api/scan/:itemId
  → Nếu item status = 'lost':
    → FoundItem Screen (thông tin owner, trust score)
    → "Nhắn tin cho chủ sở hữu" → Create Stream Chat channel
    → Chat Detail Screen
  → Nếu item status = 'safe':
    → Info only (item an toàn, không cần action)
  → Nếu là đồ của mình:
    → Navigate to ItemDetails
```

### Flow 4: Trả đồ với Live Tracking

```
Chat → Thỏa thuận giao trả → Start Return Session
  → Live Tracking Screen (react-native-maps)
  → Cả 2 bên thấy vị trí real-time
  → Xác nhận đã nhận đồ → Close channel → Update trust score
```

### Flow 5: Notifications

```
Activity xảy ra (QR scanned, item found, new message, item returned)
  → Backend log activity → POST /api/stream/activity/:type
  → Push notification (Expo Push) khi app đóng
  → In-app notification (Stream) khi app mở
  → Notification Screen hiển thị feed
```

---

## 🧩 Path Aliases

```typescript
import { Button } from '@components/Button';
import { HomeScreen } from '@screens/home';
import { useAuth } from '@hooks/useAuth';
import { itemsApi } from '@services/items';
import { Item } from '@types/item';
import { COLORS } from '@constants/theme';
import { authStorage } from '@storage/auth';
import { cn } from '@lib/cn';
```

Cấu hình trong `tsconfig.json` và `babel.config.js`.

---

## 📝 Coding Conventions

### Naming

| Type              | Convention  | Example                |
| ----------------- | ----------- | ---------------------- |
| Components        | PascalCase  | `ItemCard.tsx`         |
| Screens           | PascalCase  | `HomeScreen`           |
| Hooks             | camelCase   | `useAuth.ts`           |
| Utils             | camelCase   | `formatDate.ts`        |
| Constants         | UPPER_SNAKE | `API_URL`, `MAX_RETRY` |
| Types/Interfaces  | PascalCase  | `User`, `ApiResponse`  |
| Files (component) | PascalCase  | `ProfileHeader.tsx`    |
| Files (util)      | camelCase   | `apiClient.ts`         |

### Component Template

```tsx
import React from 'react';
import { View, Text } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View className="p-4">
      <Text className="text-lg font-bold">{title}</Text>
    </View>
  );
};
```

### File Size Rule

- Mỗi file nên **< 200 dòng**
- Tách component lớn thành sub-components trong `components/` folder

### Import Order

```typescript
// 1. React / React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AlertTriangle } from 'lucide-react-native';

// 3. Internal modules (path aliases)
import { useAuth } from '@hooks/useAuth';
import { itemsApi } from '@services/items';
import { Item } from '@types/item';

// 4. Relative imports (same feature)
import { ItemCard } from './components/ItemCard';
```

---

## 🔧 Development Commands

```bash
# Start dev server
npm start

# Run on platforms
npm run android
npm run ios

# Code quality
npm run format          # Prettier format all
npm run lint:fix        # ESLint auto-fix
npm run type-check      # TypeScript check
npm run validate        # All checks combined

# Build (EAS)
npm run build:dev
npm run build:preview
npm run build:production
```

---

## ⚠️ Lưu Ý Quan Trọng Cho AI

### PHẢI làm:

1. **Dùng NativeWind** (`className="..."`) — KHÔNG dùng `StyleSheet.create()`
2. **Dùng path aliases** (`@components/`, `@hooks/`...) — KHÔNG dùng relative path `../../`
3. **TypeScript strict** — mọi prop phải có interface
4. **Tách component** khi file > 200 dòng
5. **Error handling** với `try/catch` + Toast notification
6. **Animations** dùng `react-native-reanimated` (FadeInDown, etc.)
7. **Icons** dùng `lucide-react-native`
8. **Follow Indigo theme** (#4F46E5 primary)

### KHÔNG ĐƯỢC làm:

1. ❌ Commit `.env` files
2. ❌ Hardcode API keys
3. ❌ Dùng `console.log` trong production code
4. ❌ Dùng inline styles
5. ❌ Bỏ qua TypeScript errors
6. ❌ Tạo file > 200 dòng mà không tách
7. ❌ Dùng `any` type
8. ❌ Mutate state trực tiếp

---

## 📚 Tài Liệu Chi Tiết

Tất cả docs chi tiết nằm trong `docs/`:

| File                              | Nội dung                      |
| --------------------------------- | ----------------------------- |
| `ITEMS_API.md`                    | Full Items API documentation  |
| `CHAT_API.md`                     | Stream Chat API integration   |
| `NOTIFICATIONS_API.md`            | Push + in-app notifications   |
| `MODERATION_API.md`               | Flag, mute, ban APIs          |
| `QR_CODE_GENERATION.md`           | QR generation flow            |
| `ITEM_DETAIL_SCREEN.md`           | Item detail screen docs       |
| `NOTIFICATIONS_SCREEN.md`         | Notifications screen docs     |
| `PROFILE_SCREEN.md`               | Profile screen docs           |
| `ITEMS_IMPLEMENTATION_SUMMARY.md` | Items feature summary         |
| `REDESIGN_SUMMARY.md`             | UI redesign (Student → Pro)   |
| `PROJECT_STRUCTURE.md`            | Full project structure        |
| `CODE_QUALITY.md`                 | Prettier, ESLint, conventions |
| `EAS_GUIDE.md`                    | Build & deployment            |
| `SECURITY.md`                     | Security best practices       |
| `GOOGLE_SIGNIN_SETUP.md`          | Google Sign-In setup          |
| `SETUP_GOOGLE_SIGNIN.md`          | Detailed Google setup guide   |
| `TEST_GOOGLE_LOGIN.md`            | Google login test guide       |
| `TAILWIND_SETUP_SUMMARY.md`       | NativeWind/Tailwind setup     |
| `GIT_HOOKS.md`                    | Git hooks (Husky)             |
| `CHECKLIST.md`                    | Setup checklist               |

---

## 🔄 Trạng Thái Hiện Tại (Last Updated: 2026-09-07)

### ✅ Đã hoàn thành

- Auth flow (Email + Google + Phone OTP)
- Home Screen với real API integration
- Items CRUD + QR Code generation
- Item Detail Screen (QR download, lost mode)
- Scanner + Finder Flow (FoundItem screen)
- Chat integration (Stream Chat SDK)
- Profile Screen (Trust Metrics, Settings)
- Notifications Screen (real-time feed)
- Moderation API service layer
- Live Tracking foundation
- Return Flow hooks
- Indigo theme migration
- Trust Score / Verified Badge system

### 🚧 Đang phát triển / Cần hoàn thiện

- Stream Chat Context full integration
- Offline caching/support
- Image upload cho items
- Location picker UI
- Security PIN verification flow
- Swipe actions trên ItemCard
- Full dark mode support
- CI/CD pipeline (GitHub Actions)

---

> **💡 Tip cho AI Agent**: Khi nhận task mới, hãy:
>
> 1. Đọc file này trước
> 2. Xác định feature thuộc domain nào (screens/, services/, hooks/...)
> 3. Kiểm tra file liên quan trong `docs/` nếu cần detail
> 4. Follow đúng conventions ở trên
> 5. Tách component nếu code dài > 200 dòng
