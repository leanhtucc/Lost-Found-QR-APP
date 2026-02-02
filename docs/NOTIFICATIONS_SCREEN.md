# Notifications Screen Documentation

## 📁 Cấu trúc thư mục

```
screens/notification/
├── index.tsx                    # Main screen (156 dòng)
├── utils.ts                     # Helper functions (92 dòng)
├── components/
│   ├── NotificationHeader.tsx   # Header component (49 dòng)
│   ├── NotificationCard.tsx     # Card component (115 dòng)
│   ├── EmptyState.tsx          # Empty state (23 dòng)
│   ├── LoadingState.tsx        # Loading state (17 dòng)
│   └── index.ts                # Components export (4 dòng)

types/
└── notification.ts              # Type definitions (29 dòng)

services/notifications/
├── api.ts                       # API service (123 dòng)
└── index.ts                     # Service export (1 dòng)
```

## 🎯 Các tính năng

### 1. NotificationHeader Component

- Nút back về màn hình trước
- Hiển thị số lượng thông báo chưa đọc
- Nút "Đọc tất cả" (chỉ hiện khi có thông báo chưa đọc)
- Responsive và animated

### 2. NotificationCard Component

- Hiển thị icon theo loại thông báo (scan/message/system)
- Title và message với số dòng giới hạn
- Thời gian relative (vừa xong, 5 phút trước, etc.)
- Badge hiển thị tên item
- Nút xóa thông báo
- Indicator chấm xanh cho thông báo chưa đọc
- Border màu xanh cho thông báo chưa đọc
- Fade in animation khi load

### 3. EmptyState Component

- Icon Bell lớn
- Text thông báo không có dữ liệu
- Fade in animation

### 4. LoadingState Component

- Activity indicator
- Text đang tải
- Fade in animation

### 5. Main Screen Features

- Load notifications từ API
- Pull to refresh
- Mark as read khi tap vào card
- Mark all as read
- Delete notification với confirmation dialog
- Optimistic updates
- Fallback to mock data nếu API lỗi
- Safe area view cho notch/island

## 🔌 API Endpoints

```typescript
GET    /api/notifications              # Lấy danh sách thông báo
PATCH  /api/notifications/:id/read     # Đánh dấu đã đọc
PATCH  /api/notifications/read-all     # Đánh dấu tất cả đã đọc
DELETE /api/notifications/:id          # Xóa thông báo
GET    /api/notifications/unread-count # Lấy số lượng chưa đọc
```

## 📊 Types

```typescript
export type NotificationType = 'scan' | 'message' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  item_id: string;
  item_name: string;
  is_read: boolean;
  created_at: string;
  scanner_info?: {
    name?: string;
    location?: string;
  };
}
```

## 🎨 UI/UX Features

### Colors by Type

- **scan**: Green (bg-green-100, #22c55e)
- **message**: Blue (bg-blue-100, #3b82f6)
- **system**: Gray (bg-gray-100, #6b7280)

### Animations

- Cards: FadeInDown with stagger (50ms delay per card)
- Empty state: FadeIn 400ms
- Loading: FadeIn 300ms

### Time Formatting

- Vừa xong (< 1 phút)
- X phút trước (< 60 phút)
- X giờ trước (< 24 giờ)
- Hôm qua (24-48 giờ)
- X ngày trước (< 7 ngày)
- DD/MM (≥ 7 ngày)

## 🔄 State Management

### Optimistic Updates

Tất cả các actions (mark as read, delete) đều update UI ngay lập tức, sau đó mới call API. Nếu API lỗi, sẽ revert về state cũ.

```typescript
// Example: Mark as read
setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
await markNotificationAsRead(id);
```

## 📱 Mock Data

Nếu backend chưa implement API, app sẽ tự động fallback về mock data với 4 notifications mẫu.

## 🚀 Usage

```typescript
import NotificationsScreen from '@/screens/notification';

// In navigator
<Stack.Screen name="Notifications" component={NotificationsScreen} />
```

## ✅ Code Quality

- ✅ Tất cả files < 200 dòng
- ✅ TypeScript strict mode
- ✅ Component separation
- ✅ Clean code principles
- ✅ Error handling
- ✅ Loading states
- ✅ Optimistic updates
- ✅ Responsive design
- ✅ Accessibility (active opacity, touch targets)
- ✅ Vietnamese localization
