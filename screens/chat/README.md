# Chat Feature

Hệ thống chat 1-1 giữa owner và finder sử dụng Stream Chat API.

## 📁 Structure

```
screens/chat/
├── index.ts                    # Export screens
├── list/                       # Chat List Screen
│   ├── index.tsx              # Main list screen
│   └── components/
│       ├── index.ts
│       ├── ChatListHeader.tsx
│       ├── ConversationCard.tsx
│       ├── EmptyChat.tsx
│       └── LoadingChat.tsx
└── detail/                     # Chat Detail Screen
    ├── index.tsx              # Main chat screen
    ├── types.ts              # Local types
    └── components/
        ├── ChatHeader.tsx
        ├── ChatMessages.tsx
        └── ChatInput.tsx
```

## 🎯 Screens

### 1. ChatListScreen (Chat Inbox)

**Màn hình danh sách các cuộc hội thoại**

Features:

- ✅ Hiển thị danh sách conversations
- ✅ Unread count badge
- ✅ Last message preview
- ✅ Online status indicator
- ✅ Item name display
- ✅ Pull to refresh
- ✅ Empty state
- ✅ Loading state

Navigation:

- Tab Navigator → Chat tab → ChatListScreen
- Click conversation → Navigate to ChatDetailScreen

### 2. ChatDetailScreen (1-1 Chat)

**Màn hình chat chi tiết giữa 2 người**

Features:

- ✅ Message list với scroll
- ✅ Send text messages
- ✅ Typing indicator
- ✅ Online status
- ✅ Item context trong header
- ✅ Call & Video buttons (coming soon)
- ✅ Attach images (coming soon)
- ✅ Emoji picker (coming soon)

Navigation params:

```typescript
{
  channelId: string;
  itemName: string;
  userName: string;
  userAvatar?: string;
}
```

## 🔌 API Integration

### Get Inbox (Chat List)

```typescript
import { getInbox } from '@/services/chat';

const response = await getInbox();
// Returns: { total: number, channels: Conversation[] }
```

### Create Channel (When scanning QR)

```typescript
import { createChannel } from '@/services/chat';

const channel = await createChannel(itemId, finderId);
```

### Close Channel (Mark as resolved)

```typescript
import { closeChannel } from '@/services/chat';

await closeChannel(channelId);
```

## 📊 Data Flow

### When Finder scans QR code:

```
1. Scan QR → Get itemId
2. Call createChannel(itemId, currentUserId)
3. API creates channel between owner & finder
4. Navigate to ChatDetailScreen
```

### When opening Chat tab:

```
1. Open Chat tab → ChatListScreen
2. Load conversations via getInbox()
3. Display list of conversations
4. Click conversation → ChatDetailScreen
```

## 🎨 Components

### ChatListScreen Components:

**ChatListHeader**

- Back button
- Title "Tin nhắn"
- Unread count display

**ConversationCard**

- Avatar với online indicator
- User name & item name
- Last message preview
- Unread badge
- Timestamp

**EmptyChat**

- Empty state illustration
- Helper text

**LoadingChat**

- Loading spinner
- Loading text

### ChatDetailScreen Components:

**ChatHeader**

- Back button
- User avatar & name
- Item name subtitle
- Online status
- Call / Video / More buttons

**ChatMessages**

- Scrollable message list
- Message bubbles (sent/received)
- Timestamps
- Typing indicator

**ChatInput**

- Text input
- Send button
- Attach button
- Emoji button

## 🔧 Usage

### Navigate to Chat List

```typescript
navigation.navigate('ChatList');
```

### Navigate to Chat Detail

```typescript
navigation.navigate('Chat', {
  channelId: 'channel-id',
  itemName: 'Ví da nâu',
  userName: 'Nguyễn Văn A',
  userAvatar: 'https://...',
});
```

### Open chat from QR scan

```typescript
// After scanning QR
const channel = await createChannel(itemId, currentUserId);

navigation.navigate('Chat', {
  channelId: channel.channel.id,
  itemName: channel.itemName,
  userName: ownerName,
  userAvatar: ownerAvatar,
});
```

## 🚀 Next Steps

- [ ] Implement Stream Chat SDK integration
- [ ] Real-time message updates
- [ ] Push notifications for new messages
- [ ] Image attachments
- [ ] Voice/Video calls
- [ ] Message reactions
- [ ] Read receipts
- [ ] Delete messages
- [ ] Block users

## 📝 Notes

- ChatListScreen hiển thị trong Tab Navigator
- ChatDetailScreen là full-screen modal
- API auto-creates channel khi scan QR lần đầu
- Channel ID format: `item-{itemId}`
- Support offline mode với local cache
