# Notifications API Documentation

## 📱 Tích hợp Stream Chat cho Thông báo Real-time

Hệ thống thông báo sử dụng **Stream Chat** cho notifications trong app và **Expo Push Notifications** cho push notifications khi app đóng.

---

## 🔌 API Endpoints

### 1. Cập nhật Push Token

```
PATCH /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

Body:
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "example@gmail.com",
    "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    ...
  },
  "message": "Profile updated successfully"
}
```

### 2. Lấy Stream Chat Token

```
GET /api/stream/token
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "apiKey": "stream_api_key_xxxxxxxx",
    "userId": "user_id_trong_he_thong"
  },
  "message": "Stream token generated successfully"
}
```

### 3. Lấy Danh sách Thông báo

```
GET /api/stream/notifications
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "total": 5,
    "unreadTotal": 2,
    "notifications": [
      {
        "id": "notification_id",
        "type": "item_found",
        "actor": { "id": "user_a", "name": "Nguyễn Văn A" },
        "item": { "id": "item_id", "name": "Chìa khóa xe" },
        "isRead": false,
        "createdAt": "2024-02-02T10:00:00Z"
      }
    ]
  }
}
```

### 4. Đánh dấu Tất cả Đã đọc

```
POST /api/stream/notifications/mark-read
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 5. Ghi nhận Hoạt động

```
POST /api/stream/activity/:activityType
Authorization: Bearer <access_token>

Activity Types:
- qr_scanned: Có người quét QR
- item_found: Tìm thấy món đồ
- new_message: Tin nhắn mới
- item_returned: Đã trả lại món đồ

Query Params:
- itemId: ID của item
- finderName: Tên người tìm thấy
- message: Tin nhắn
- location: Vị trí

Example:
POST /api/stream/activity/item_found?itemId=abc&finderName=John

Response 200:
{
  "success": true,
  "message": "Activity logged successfully"
}
```

---

## 📊 Type Definitions

```typescript
export type ActivityType = 'item_found' | 'new_message' | 'item_returned' | 'qr_scanned';

export interface NotificationActor {
  id: string;
  name: string;
  avatar?: string;
}

export interface NotificationItem {
  id: string;
  name: string;
  category?: string;
}

export interface Notification {
  id: string;
  type: ActivityType;
  actor: NotificationActor;
  item?: NotificationItem;
  message?: string;
  isRead: boolean;
  createdAt: string;
}
```

---

## 🚀 Workflow Tích hợp

### 1. Giai đoạn Đăng nhập

```typescript
// Sau khi login thành công
import { updatePushToken, getStreamToken } from '@/services/notifications';
import * as Notifications from 'expo-notifications';

// Lấy push token từ Expo
const pushToken = (await Notifications.getExpoPushTokenAsync()).data;

// Cập nhật lên server
await updatePushToken(pushToken);

// Lấy Stream token để connect
const streamData = await getStreamToken();
// Lưu streamData.token, streamData.apiKey, streamData.userId
```

### 2. Giai đoạn Hiển thị Notifications

```typescript
import { getNotifications } from '@/services/notifications';

const data = await getNotifications();
setNotifications(data.notifications);
setUnreadCount(data.unreadTotal);
```

### 3. Giai đoạn Đánh dấu Đã đọc

```typescript
import { markAllNotificationsAsRead } from '@/services/notifications';

await markAllNotificationsAsRead();
```

### 4. Giai đoạn Log Activity

```typescript
import { logActivity } from '@/services/notifications';

// Khi user quét QR
await logActivity('qr_scanned', {
  itemId: item.id,
  finderName: user.name,
  location: 'Khu A',
});

// Khi tìm thấy món đồ
await logActivity('item_found', {
  itemId: item.id,
  finderName: user.name,
});
```

---

## 🎨 UI Components

### NotificationsScreen

- Load danh sách thông báo từ API
- Pull-to-refresh
- Optimistic updates
- Fallback to mock data nếu API lỗi

### NotificationCard

- 4 loại icons: QR (🟢), Item Found (🟢), Message (🔵), Item Returned (🟢)
- Hiển thị actor name, item name, time
- Border xanh cho chưa đọc
- Chấm xanh indicator

### Features

- ✅ Real-time notifications với Stream Chat
- ✅ Push notifications khi app đóng
- ✅ Activity feed với 4 loại activities
- ✅ Mark all as read
- ✅ Optimistic UI updates
- ✅ Mock data fallback

---

## 📝 Notes

1. **Push Token**: Phải update push token sau mỗi lần login để nhận push notifications
2. **Stream Token**: Cần lấy stream token để kết nối Stream Chat SDK
3. **Activity Types**: Backend tự động tạo notifications khi có activities mới
4. **Real-time**: Stream Chat sẽ tự động push notifications real-time khi app đang mở
5. **Fallback**: App có mock data để test UI khi backend chưa sẵn sàng
