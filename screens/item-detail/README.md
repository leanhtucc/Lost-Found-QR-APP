# Item Detail Components

Các component được chia nhỏ để dễ maintain và test, mỗi file < 200 dòng.

## Components

### 1. ItemDetailHeader

**File:** `components/ItemDetailHeader.tsx` (49 dòng)

**Chức năng:**

- Header với back button, title, delete button
- Alert confirmation khi xóa
- Navigation goBack()

**Props:**

```typescript
interface ItemDetailHeaderProps {
  itemId: string;
  onDelete: () => void;
}
```

**Usage:**

```tsx
<ItemDetailHeader itemId={item.id} onDelete={handleDelete} />
```

---

### 2. ItemInfoCard

**File:** `components/ItemInfoCard.tsx` (48 dòng)

**Chức năng:**

- Hiển thị thông tin cơ bản item
- Icon theo category (Lucide icons)
- Status badge (ĐANG MẤT / AN TOÀN)
- Description (optional)

**Props:**

```typescript
interface ItemInfoCardProps {
  item: Item;
}
```

**Animations:**

- FadeInDown 300ms (no delay)

---

### 3. QRCodeCard

**File:** `components/QRCodeCard.tsx` (73 dòng)

**Chức năng:**

- Generate QR code với react-native-qrcode-svg
- Capture QR as PNG với ViewShot
- Download/Share QR code
- Item ID display

**Props:**

```typescript
interface QRCodeCardProps {
  itemId: string;
  itemName: string;
}
```

**Dependencies:**

```typescript
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
```

**Animations:**

- FadeInDown 300ms delay 100ms

---

### 4. LostModeCard

**File:** `components/LostModeCard.tsx` (121 dòng)

**Chức năng:**

- Toggle switch lost/safe
- TextInput multiline cho lost message
- Update button với loading state
- Chat button (optional)

**Props:**

```typescript
interface LostModeCardProps {
  item: Item;
  onToggleLost: () => void;
  onUpdateMessage: (message: string) => Promise<void>;
  onOpenChat?: () => void;
}
```

**State:**

```typescript
const [lostMessage, setLostMessage] = useState(item.lostMessage || '');
const [isUpdating, setIsUpdating] = useState(false);
```

**Animations:**

- FadeInDown 300ms delay 200ms
- FadeIn 300ms for lost message section

---

## Main Screen

**File:** `index.tsx` (124 dòng)

**Responsibilities:**

- Fetch item data from API
- Handle state management
- Coordinate component interactions
- API calls (get, update, delete)

**State:**

```typescript
const [item, setItem] = useState<Item | null>(null);
const [isLoading, setIsLoading] = useState(true);
```

**API Calls:**

- `itemsApi.getItemById(itemId)` - Load item
- `itemsApi.updateStatus(id, params)` - Toggle lost/safe, update message
- `itemsApi.deleteItem(itemId)` - Delete item

---

## Component Communication

```
ItemDetailScreen (Parent)
├── ItemDetailHeader
│   └── onDelete → handleDelete()
│
├── ItemInfoCard
│   └── item prop (read-only)
│
├── QRCodeCard
│   └── itemId, itemName props
│
└── LostModeCard
    ├── onToggleLost → handleToggleLost()
    ├── onUpdateMessage → handleUpdateMessage()
    └── onOpenChat → handleOpenChat()
```

---

## File Sizes

| File                 | Lines   | Purpose           |
| -------------------- | ------- | ----------------- |
| index.tsx            | 124     | Main screen logic |
| ItemDetailHeader.tsx | 49      | Header UI         |
| ItemInfoCard.tsx     | 48      | Info display      |
| QRCodeCard.tsx       | 73      | QR management     |
| LostModeCard.tsx     | 121     | Lost mode UI      |
| **Total**            | **415** | **5 files**       |

Mỗi file < 200 dòng ✅

---

## Styling Guide

### Colors

- Primary: `#3b82f6` (blue-500)
- Success: `#10b981` (green-500)
- Danger: `#ef4444` (red-500)
- Gray: `#6b7280` (gray-500)

### Border Radius

- Small: `rounded-xl` (12px)
- Medium: `rounded-2xl` (16px)
- Full: `rounded-full`

### Shadows

```css
shadow-sm: {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
}
```

### Spacing

- Gap between cards: `mb-4` (16px)
- Card padding: `p-4` (16px)
- Content padding: `p-6` (24px)

---

## Animation Timing

```typescript
// Staggered card animations
ItemInfoCard:   delay 0ms
QRCodeCard:     delay 100ms
LostModeCard:   delay 200ms

// All use FadeInDown.duration(300)
```

---

## Error Handling Pattern

```typescript
try {
  await apiCall();
  // Update state
  setItem(newItem);
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Lỗi', 'Không thể thực hiện thao tác');
  // Optionally revert state
}
```

---

## Testing

### Unit Tests

```typescript
// ItemInfoCard.test.tsx
it('renders item info correctly', () => {
  const item = mockItem();
  render(<ItemInfoCard item={item} />);
  expect(screen.getByText(item.name)).toBeDefined();
});

// LostModeCard.test.tsx
it('calls onToggleLost when switch pressed', () => {
  const onToggleLost = jest.fn();
  render(<LostModeCard item={item} onToggleLost={onToggleLost} />);
  fireEvent.press(screen.getByRole('switch'));
  expect(onToggleLost).toHaveBeenCalled();
});
```

### Integration Tests

```typescript
// ItemDetailScreen.test.tsx
it('loads and displays item', async () => {
  const { getByText } = render(<ItemDetailScreen />);
  await waitFor(() => {
    expect(getByText('Test Item')).toBeDefined();
  });
});
```

---

## Performance Optimization

### Memoization

```typescript
// For category icon lookup
const CategoryIcon = useMemo(() => getCategoryIcon(item.category), [item.category]);
```

### Callback Refs

```typescript
// For ViewShot in QRCodeCard
const qrCodeRef = useRef<ViewShot>(null);
```

### Avoid Re-renders

- Use `React.memo()` for pure components
- Stable callback references with `useCallback()`
- Memoize expensive computations

---

## Accessibility

### Labels

```tsx
<TouchableOpacity accessibilityLabel="Quay lại" accessibilityRole="button">
  <ArrowLeft />
</TouchableOpacity>
```

### Text Input

```tsx
<TextInput
  accessibilityLabel="Lời nhắn cho người nhặt được"
  accessibilityHint="Nhập tin nhắn để người nhặt được biết cách liên hệ"
/>
```

### Buttons

```tsx
<TouchableOpacity
  accessibilityLabel="Xóa món đồ"
  accessibilityRole="button"
  accessibilityHint="Xóa món đồ này khỏi danh sách"
>
  <Trash2 />
</TouchableOpacity>
```
