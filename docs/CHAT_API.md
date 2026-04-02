# Chat API Documentation

Tài liệu API Chat cho hệ thống Lost & Found sử dụng Stream Chat.

---

## 📋 API Endpoints

### 1. Lấy Stream Chat Token

**Đã implement trong Notifications API**

```typescript
GET /api/stream/token
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "apiKey": "stream_api_key_xxxxxxxx",
    "userId": "user_id_trong_he_thong"
  }
}
```

**Usage:**

```typescript
import { getStreamToken } from '@/services/notifications';

const streamData = await getStreamToken();
// streamData.token, streamData.apiKey, streamData.userId
```

---

### 2. Tạo Cuộc hội thoại Mới (Create Channel)

```typescript
POST /api/stream/channels/:itemId/:finderId
Authorization: Bearer <access_token>

Response 201:
{
  "success": true,
  "data": {
    "channel": {
      "id": "item-id-xxxxxxxx",
      "type": "messaging",
      "name": "Chat về món đồ: Ví tiền"
    },
    "itemName": "Ví tiền"
  }
}
```

**Usage:**

```typescript
import { createChannel } from '@/services/chat';

// Khi user quét QR code
const data = await createChannel('item_123', 'current_user_id');
console.log(`Channel ID: ${data.channel.id}`);
console.log(`Item: ${data.itemName}`);

// Navigate to chat screen
navigation.navigate('ChatScreen', {
  channelId: data.channel.id,
  itemName: data.itemName,
});
```

---

### 3. Lấy Danh sách Hộp thư (Get Inbox)

```typescript
GET /api/stream/channels
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "total": 5,
    "channels": [
      {
        "id": "channel_01",
        "last_message": "Chào bạn, mình đã thấy ví của bạn",
        "unread_count": 2,
        "receiver": {
          "id": "user_id",
          "name": "Nguyễn Văn A",
          "image": "..."
        },
        "created_at": "2024-02-03T10:00:00Z"
      }
    ]
  }
}
```

**Usage:**

```typescript
import { getInbox } from '@/services/chat';

const data = await getInbox();
console.log(`Total conversations: ${data.total}`);

data.channels.forEach(channel => {
  console.log(`${channel.receiver.name}: ${channel.last_message}`);
  console.log(`Unread: ${channel.unread_count}`);
});
```

---

### 4. Đóng Cuộc hội thoại (Close Channel)

```typescript
PUT /api/stream/channels/:channelId/close
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "message": "Channel closed successfully"
}
```

**Usage:**

```typescript
import { closeChannel } from '@/services/chat';
import { Alert } from 'react-native';

const handleCloseChat = async (channelId: string) => {
  Alert.alert(
    'Đóng hội thoại',
    'Bạn đã nhận lại đồ thành công? Hội thoại sẽ chuyển sang chế độ chỉ đọc.',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đóng',
        onPress: async () => {
          await closeChannel(channelId);
          Alert.alert('Thành công', 'Đã đóng hội thoại');
        },
      },
    ]
  );
};
```

---

### 5. Lấy Chi tiết Channel (Bonus)

```typescript
GET /api/stream/channels/:channelId
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "data": {
    "id": "channel_01",
    "name": "Chat về món đồ: Ví tiền",
    "members": [...],
    "created_at": "..."
  }
}
```

**Usage:**

```typescript
import { getChannelById } from '@/services/chat';

const channelData = await getChannelById('channel_123');
```

---

## 📊 Type Definitions

```typescript
// Channel
export interface ChatChannel {
  id: string;
  type: string;
  name: string;
  last_message?: string;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Receiver (người chat với mình)
export interface ChatReceiver {
  id: string;
  name: string;
  image?: string;
  avatar?: string;
}

// Inbox Channel
export interface InboxChannel {
  id: string;
  last_message?: string;
  unread_count: number;
  receiver: ChatReceiver;
  created_at?: string;
}

// Message
export interface ChatMessage {
  id: string;
  text: string;
  user: ChatReceiver;
  created_at: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'image' | 'file' | 'video';
  asset_url: string;
  title?: string;
  mime_type?: string;
}
```

---

## 🚀 Workflow Integration

### 1. Khởi tạo App

```typescript
import { getStreamToken } from '@/services/notifications';
import { StreamChat } from 'stream-chat';

// Sau khi login
const initializeChat = async () => {
  const streamData = await getStreamToken();

  // Khởi tạo Stream Chat Client
  const client = StreamChat.getInstance(streamData.apiKey);

  await client.connectUser({ id: streamData.userId }, streamData.token);

  return client;
};
```

---

### 2. Quét QR và Tạo Channel

```typescript
import { createChannel } from '@/services/chat';

const handleQRScan = async (itemId: string, currentUserId: string) => {
  try {
    // Tạo channel mới
    const data = await createChannel(itemId, currentUserId);

    // Navigate to chat
    navigation.navigate('ChatScreen', {
      channelId: data.channel.id,
      itemName: data.itemName,
    });
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể tạo hội thoại');
  }
};
```

---

### 3. Hiển thị Inbox

```typescript
import { getInbox } from '@/services/chat';
import { useState, useEffect } from 'react';

const InboxScreen = () => {
  const [channels, setChannels] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    const data = await getInbox();
    setChannels(data.channels);

    const total = data.channels.reduce(
      (sum, ch) => sum + ch.unread_count,
      0
    );
    setUnreadTotal(total);
  };

  return (
    <View>
      <Text>Tin nhắn ({unreadTotal})</Text>
      <FlatList
        data={channels}
        renderItem={({ item }) => (
          <ChatListItem channel={item} />
        )}
      />
    </View>
  );
};
```

---

### 4. Chat Screen với Stream SDK

```typescript
import { Channel, MessageList, MessageInput } from 'stream-chat-react-native';
import { useStreamChatContext } from '@/contexts/StreamChatContext';

const ChatScreen = ({ route }) => {
  const { channelId } = route.params;
  const { client } = useStreamChatContext();

  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const initChannel = async () => {
      const ch = client.channel('messaging', channelId);
      await ch.watch();
      setChannel(ch);
    };

    initChannel();
  }, [channelId]);

  if (!channel) return <LoadingScreen />;

  return (
    <Channel channel={channel}>
      <MessageList />
      <MessageInput />
    </Channel>
  );
};
```

---

### 5. Đóng Channel khi hoàn tất

```typescript
import { closeChannel } from '@/services/chat';

const ChatHeader = ({ channelId, itemName }) => {
  const handleComplete = async () => {
    Alert.alert(
      'Xác nhận',
      `Bạn đã nhận lại "${itemName}" thành công?`,
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Hoàn tất',
          onPress: async () => {
            await closeChannel(channelId);

            // Log activity
            await logActivity('item_returned', {
              itemId: itemName
            });

            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View>
      <Text>{itemName}</Text>
      <Button onPress={handleComplete}>
        ✅ Đã nhận lại đồ
      </Button>
    </View>
  );
};
```

---

## 🎯 Complete Example: QR Scan to Chat

```typescript
import { createChannel } from '@/services/chat';
import { logActivity } from '@/services/notifications';
import { scanQRCode } from '@/services/items';

const ScanScreen = () => {
  const handleBarCodeScanned = async ({ data }) => {
    try {
      // 1. Scan QR và lấy item info
      const itemData = await scanQRCode(data);

      // 2. Log activity: qr_scanned
      await logActivity('qr_scanned', {
        itemId: itemData.id,
        finderName: currentUser.name,
      });

      // 3. Tạo channel chat
      const channelData = await createChannel(
        itemData.id,
        currentUser.id
      );

      // 4. Navigate to chat
      navigation.navigate('ChatScreen', {
        channelId: channelData.channel.id,
        itemName: channelData.itemName,
        itemData: itemData,
      });

      // 5. Show success message
      Alert.alert(
        'Thành công',
        `Đã tạo hội thoại về "${channelData.itemName}"`
      );

    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <BarCodeScanner
      onBarCodeScanned={handleBarCodeScanned}
    />
  );
};
```

---

## ⚠️ Important Notes

### Backend Auto-handling

- **Create Channel**: Backend tự động thêm Owner + Finder vào channel
- **Channel ID**: Backend tự generate, format: `item-{itemId}-{timestamp}`
- **Channel Name**: Tự động lấy từ item name

### Stream Chat SDK

- **Send/Receive Messages**: Dùng trực tiếp Stream SDK, không qua backend API
- **Real-time**: Stream SDK tự động handle websocket connection
- **Offline Support**: Stream SDK có offline mode built-in

### Best Practices

1. **Token Refresh**: Lưu token và refresh khi hết hạn
2. **Channel Cache**: Cache channel list để giảm API calls
3. **Optimistic UI**: Update UI trước khi API response
4. **Error Handling**: Handle network errors gracefully

---

## 📱 UI Components Needed

### 1. InboxScreen

- List of conversations
- Last message preview
- Unread count badge
- Pull to refresh

### 2. ChatScreen

- Message list (Stream SDK)
- Message input (Stream SDK)
- Header with item name
- "Đã nhận lại đồ" button

### 3. ChatListItem

- Avatar
- Name
- Last message
- Timestamp
- Unread badge

---

## ✅ Implementation Checklist

- [x] Types definitions
- [x] API service methods
- [x] Error handling
- [ ] Stream Chat Context
- [ ] InboxScreen UI
- [ ] ChatScreen UI
- [ ] ChatListItem component
- [ ] QR scan integration
- [ ] Close channel flow
- [ ] Offline support
