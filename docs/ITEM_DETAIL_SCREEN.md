# Item Detail Screen

## Overview

Màn hình chi tiết món đồ cho phép người dùng xem thông tin đầy đủ về item, quản lý QR code, và cập nhật trạng thái thất lạc.

## Components Structure

```
screens/item-detail/
├── index.tsx                    # Main screen (124 dòng)
└── components/
    ├── ItemDetailHeader.tsx     # Header với back + delete (49 dòng)
    ├── ItemInfoCard.tsx         # Thông tin item (48 dòng)
    ├── QRCodeCard.tsx          # QR code với download (73 dòng)
    ├── LostModeCard.tsx        # Chế độ thất lạc (121 dòng)
    └── index.ts                # Export components
```

## Features

### 1. **Item Info Display**

- Icon theo category (Lucide icons)
- Tên item và ID
- Status badge (ĐANG MẤT / AN TOÀN)
- Description (nếu có)

### 2. **QR Code Management**

- Hiển thị QR code với size 200x200
- Download QR as PNG
- Share QR code
- Item ID display

### 3. **Lost Mode Toggle**

- Switch để đánh dấu lost/safe
- Confirmation dialog khi toggle
- Auto-update status trên backend

### 4. **Lost Message**

- TextInput multiline cho lời nhắn
- Placeholder gợi ý
- Update button với loading state
- Chat button (khi có finder)

### 5. **Item Actions**

- Back button
- Delete button với confirmation
- Navigate to chat (nếu có conversation)

## API Integration

### Get Item Details

```typescript
const item = await itemsApi.getItemById(itemId);
```

### Update Status

```typescript
const updatedItem = await itemsApi.updateStatus(itemId, {
  status: 'lost',
  lostMessage: 'Tôi rơi ở canteen tầng 1',
});
```

### Delete Item

```typescript
await itemsApi.deleteItem(itemId);
```

## Navigation

### Route to Item Detail

```typescript
navigation.navigate('ItemDetail', { itemId: '123' });
```

### From Item Detail

```typescript
// Back to previous screen
navigation.goBack();

// To chat (when finder found item)
navigation.navigate('ChatScreen', { itemId: item.id });
```

## Dependencies

### Required Libraries

```bash
# QR Code generation
npm install react-native-qrcode-svg

# View capture for download
npm install react-native-view-shot

# Sharing files
npx expo install expo-sharing expo-file-system

# Icons
npm install lucide-react-native

# Animations
npm install react-native-reanimated
```

### Types Required

```typescript
interface Item {
  id: string;
  itemId: string;
  name: string;
  category: ItemCategory;
  description?: string;
  status: 'safe' | 'lost';
  lostMessage?: string;
  qrCodeUrl: string;
  // ... other fields
}
```

## Usage Example

### Basic Implementation

```typescript
import { ItemDetailScreen } from '@/screens';

// In navigator
<Stack.Screen
  name="ItemDetail"
  component={ItemDetailScreen}
  options={{ headerShown: false }}
/>
```

### With Custom Props

```typescript
// From MyItemsScreen
<TouchableOpacity
  onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
>
  <Text>{item.name}</Text>
</TouchableOpacity>
```

## Styling

### TailwindCSS Classes Used

```css
/* Card */
bg-white rounded-2xl p-4 shadow-sm

/* Header */
bg-white border-b border-gray-100

/* Status Badge - Lost */
bg-red-100 text-red-600 px-4 py-2 rounded-full

/* Status Badge - Safe */
bg-green-100 text-green-600 px-4 py-2 rounded-full

/* QR Container */
bg-white p-4 rounded-2xl border-2 border-gray-200

/* Switch - Active */
bg-red-500 (lost) / bg-gray-300 (safe)

/* Button - Primary */
bg-blue-50 active:bg-blue-100 text-blue-600

/* TextInput */
bg-gray-50 rounded-xl p-4 min-h-[100px]
```

## State Management

### Local State

```typescript
const [item, setItem] = useState<Item | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [lostMessage, setLostMessage] = useState('');
const [isUpdating, setIsUpdating] = useState(false);
```

### Update Flow

1. User toggles lost switch → Confirmation alert
2. API call to update status
3. Update local state optimistically
4. Show success/error toast

## Error Handling

### Load Error

```typescript
try {
  const data = await itemsApi.getItemById(itemId);
  setItem(data);
} catch (error) {
  Alert.alert('Lỗi', 'Không thể tải thông tin món đồ');
  navigation.goBack();
}
```

### Update Error

```typescript
try {
  await itemsApi.updateStatus(itemId, { status: 'lost' });
} catch (error) {
  Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
  // Revert local state
}
```

### Delete Error

```typescript
try {
  await itemsApi.deleteItem(itemId);
  navigation.goBack();
} catch (error) {
  Alert.alert('Lỗi', 'Không thể xóa món đồ');
}
```

## Animations

### Card Enter Animation

```typescript
<Animated.View entering={FadeInDown.duration(300)}>
  {/* Content */}
</Animated.View>
```

### Staggered Delays

```typescript
// ItemInfoCard: delay 0
// QRCodeCard: delay 100ms
// LostModeCard: delay 200ms
```

## QR Code Download

### Implementation

```typescript
const handleDownloadQR = async () => {
  // 1. Capture view as image
  const uri = await qrCodeRef.current.capture?.();

  // 2. Check sharing availability
  const isAvailable = await Sharing.isAvailableAsync();

  // 3. Share/Save the image
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: `Lưu mã QR - ${itemName}`,
  });
};
```

### ViewShot Configuration

```typescript
<ViewShot
  ref={qrCodeRef}
  options={{ format: 'png', quality: 1.0 }}
>
  <QRCode value={itemId} size={200} />
</ViewShot>
```

## Lost Mode Features

### Toggle Confirmation

```typescript
Alert.alert(
  isLost ? 'Đánh dấu an toàn' : 'Đánh dấu thất lạc',
  isLost ? 'Bạn đã tìm lại được món đồ?' : 'Món đồ của bạn bị thất lạc?',
  [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xác nhận', onPress: onToggleLost },
  ]
);
```

### Message Update

```typescript
const handleUpdate = async () => {
  if (!lostMessage.trim()) {
    Alert.alert('Thông báo', 'Vui lòng nhập lời nhắn');
    return;
  }

  setIsUpdating(true);
  await onUpdateMessage(lostMessage);
  setIsUpdating(false);
};
```

## Integration with Chat

### When to Show Chat Button

```typescript
// Show chat button when item is lost and has finder
{item.status === 'lost' && item.finderId && (
  <TouchableOpacity onPress={onOpenChat}>
    <MessageCircle size={20} color="#3b82f6" />
  </TouchableOpacity>
)}
```

### Navigate to Chat

```typescript
const handleOpenChat = () => {
  navigation.navigate('ChatScreen', {
    itemId: item.id,
    finderId: item.finderId,
  });
};
```

## Best Practices

### ✅ Do's

- Always fetch fresh data on screen focus
- Show loading state while fetching
- Optimistic updates for better UX
- Confirm destructive actions (delete)
- Handle network errors gracefully
- Animate card entries for smooth UX

### ❌ Don'ts

- Don't mutate item state directly
- Don't skip error handling
- Don't allow empty lost message
- Don't navigate before async completion
- Don't show chat when no finder exists

## Testing Checklist

- [ ] Load item details successfully
- [ ] Toggle lost/safe status
- [ ] Update lost message
- [ ] Download QR code
- [ ] Delete item with confirmation
- [ ] Navigate back
- [ ] Handle network errors
- [ ] Show loading states
- [ ] Validate empty message
- [ ] Responsive layout on all screen sizes

## Future Enhancements

1. **Real-time Updates**
   - WebSocket for status changes
   - Auto-refresh when finder scans

2. **QR Customization**
   - Color picker for QR code
   - Logo in center of QR
   - Different sizes

3. **Enhanced Lost Mode**
   - Geo-fence notifications
   - Last seen location on map
   - Reward amount for finder

4. **Social Features**
   - Share item on social media
   - Public lost & found board
   - Community help requests
