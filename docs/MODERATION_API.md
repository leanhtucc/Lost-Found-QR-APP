# Moderation API Documentation

Tài liệu API Kiểm duyệt nội dung, báo cáo vi phạm và quản lý người dùng trong Chat.

---

## 📋 API Endpoints

### 1. Báo cáo Tin nhắn Vi phạm (Flag Message)

```typescript
POST /api/stream/messages/:messageId/flag
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "flag": {
      "user_id": "nguoi_bao_cao",
      "target_message_id": "message_id_bi_flag",
      "created_at": "..."
    }
  },
  "message": "Message flagged successfully"
}
```

**Usage:**

```typescript
import { flagMessage } from '@/services/moderation';

await flagMessage('message_id_123');
```

---

### 2. Gỡ bỏ Báo cáo (Unflag Message)

```typescript
DELETE /api/stream/messages/:messageId/flag
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "message": "Message unflagged successfully"
}
```

**Usage:**

```typescript
import { unflagMessage } from '@/services/moderation';

await unflagMessage('message_id_123');
```

---

### 3. Tắt tiếng Người dùng (Mute User)

```typescript
POST /api/stream/channels/:channelId/mute/:targetUserId
Authorization: Bearer <access_token>
Query Params:
  - timeout (optional): Thời gian tắt tiếng (phút)

Example:
POST /api/stream/channels/ch1/mute/user2?timeout=60

Response 200:
{
  "success": true,
  "message": "User muted successfully"
}
```

**Usage:**

```typescript
import { muteUser } from '@/services/moderation';

// Tắt tiếng 1 giờ (60 phút)
await muteUser('channel_id', 'user_id', { timeout: 60 });

// Tắt tiếng vĩnh viễn
await muteUser('channel_id', 'user_id');
```

---

### 4. Bỏ Tắt tiếng (Unmute User)

```typescript
DELETE /api/stream/channels/:channelId/mute/:targetUserId
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "message": "User unmuted successfully"
}
```

**Usage:**

```typescript
import { unmuteUser } from '@/services/moderation';

await unmuteUser('channel_id', 'user_id');
```

---

### 5. Chặn Người dùng (Ban User)

```typescript
POST /api/stream/channels/:channelId/ban/:targetUserId
Authorization: Bearer <access_token>

Body:
{
  "reason": "Spam and scamming content",
  "timeout": 1440
}

Response 200:
{
  "success": true,
  "message": "User banned successfully"
}
```

**Usage:**

```typescript
import { banUser } from '@/services/moderation';

// Chặn vĩnh viễn
await banUser('channel_id', 'user_id', {
  reason: 'Spam and scamming content',
});

// Chặn 24 giờ (1440 phút)
await banUser('channel_id', 'user_id', {
  reason: 'Harassment',
  timeout: 1440,
});
```

---

### 6. Lấy Danh sách Tin nhắn bị Flag

```typescript
GET /api/stream/channels/:channelId/flagged-messages
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "total": 2,
    "messages": [
      {
        "id": "msg_01",
        "text": "Nội dung vi phạm",
        "user": {
          "id": "user_id",
          "name": "...",
          "avatar": "..."
        },
        "flags_count": 1,
        "created_at": "..."
      }
    ]
  }
}
```

**Usage:**

```typescript
import { getFlaggedMessages } from '@/services/moderation';

const data = await getFlaggedMessages('channel_id');
console.log(`Total flagged: ${data.total}`);
console.log(data.messages);
```

---

## 📊 Type Definitions

```typescript
// Flag Message
export interface FlagResponse {
  success: boolean;
  data: {
    flag: {
      user_id: string;
      target_message_id: string;
      created_at: string;
    };
  };
  message: string;
}

// Mute User
export interface MuteUserParams {
  timeout?: number; // Phút, undefined = vĩnh viễn
}

export interface MuteResponse {
  success: boolean;
  message: string;
}

// Ban User
export interface BanUserParams {
  reason?: string;
  timeout?: number; // Phút
}

export interface BanResponse {
  success: boolean;
  message: string;
}

// Flagged Messages
export interface FlaggedMessage {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  flags_count: number;
  created_at?: string;
}
```

---

## 🎯 Use Cases

### 1. User báo cáo tin nhắn xấu

```typescript
import { flagMessage } from '@/services/moderation';
import { Alert } from 'react-native';

const handleFlagMessage = async (messageId: string) => {
  try {
    await flagMessage(messageId);
    Alert.alert('Thành công', 'Đã báo cáo tin nhắn vi phạm');
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể báo cáo tin nhắn');
  }
};
```

### 2. Owner tắt tiếng người quấy rối

```typescript
import { muteUser } from '@/services/moderation';

// Tắt tiếng 1 ngày (1440 phút)
await muteUser(channelId, annoyingUserId, { timeout: 1440 });
```

### 3. Admin chặn người lừa đảo

```typescript
import { banUser } from '@/services/moderation';

await banUser(channelId, scammerId, {
  reason: 'Phát hiện lừa đảo, yêu cầu chuyển tiền trước',
  timeout: undefined, // Chặn vĩnh viễn
});
```

### 4. Owner xem danh sách tin nhắn bị báo cáo

```typescript
import { getFlaggedMessages } from '@/services/moderation';

const data = await getFlaggedMessages(channelId);

if (data.total > 0) {
  console.log(`Có ${data.total} tin nhắn bị báo cáo:`);
  data.messages.forEach(msg => {
    console.log(`- "${msg.text}" từ ${msg.user.name}`);
  });
}
```

---

## ⚠️ Important Notes

### Phân quyền

- **Flag/Unflag**: Tất cả user đều có thể báo cáo tin nhắn
- **Mute/Unmute**: Chỉ áp dụng cho bản thân user (không ảnh hưởng người khác)
- **Ban**: Chỉ Item Owner hoặc Admin mới được phép ban user
- **Get Flagged Messages**: Chỉ Item Owner hoặc Admin

### Best Practices

1. **Flag Message**: Hiển thị confirmation dialog trước khi flag
2. **Mute**: Cung cấp options thời gian (1h, 8h, 24h, vĩnh viễn)
3. **Ban**: Luôn yêu cầu nhập lý do ban
4. **Flagged Messages**: Chỉ hiển thị cho Owner/Admin

### Error Handling

```typescript
try {
  await flagMessage(messageId);
} catch (error) {
  if (error.message.includes('403')) {
    // Không có quyền
    Alert.alert('Lỗi', 'Bạn không có quyền thực hiện thao tác này');
  } else if (error.message.includes('404')) {
    // Tin nhắn không tồn tại
    Alert.alert('Lỗi', 'Tin nhắn không tồn tại');
  } else {
    Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
  }
}
```

---

## 📱 UI Implementation Examples

### Message Long Press Menu

```typescript
const MessageActions = ({ message, channelId }) => {
  const [isOwner, setIsOwner] = useState(false);

  return (
    <ActionSheet>
      {/* Tất cả user */}
      <Action onPress={() => handleFlagMessage(message.id)}>
        🚩 Báo cáo tin nhắn
      </Action>

      {/* Chỉ Owner/Admin */}
      {isOwner && (
        <>
          <Action onPress={() => handleMuteUser(channelId, message.user.id)}>
            🔇 Tắt tiếng người này
          </Action>

          <Action onPress={() => handleBanUser(channelId, message.user.id)} danger>
            🚫 Chặn người này
          </Action>
        </>
      )}
    </ActionSheet>
  );
};
```

### Owner Dashboard

```typescript
const OwnerDashboard = ({ channelId }) => {
  const [flaggedMessages, setFlaggedMessages] = useState([]);

  useEffect(() => {
    loadFlaggedMessages();
  }, []);

  const loadFlaggedMessages = async () => {
    const data = await getFlaggedMessages(channelId);
    setFlaggedMessages(data.messages);
  };

  return (
    <View>
      <Text>Tin nhắn bị báo cáo: {flaggedMessages.length}</Text>
      {flaggedMessages.map(msg => (
        <FlaggedMessageCard key={msg.id} message={msg} />
      ))}
    </View>
  );
};
```

---

## ✅ Implementation Checklist

- [x] Types definitions
- [x] API service methods
- [x] Error handling
- [ ] UI components (Message actions)
- [ ] Owner dashboard
- [ ] Permission checks
- [ ] Confirmation dialogs
- [ ] Success/error toasts
