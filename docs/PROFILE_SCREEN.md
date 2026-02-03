# Profile Screen

## Overview

Màn hình profile hiển thị thông tin cá nhân, thống kê items, và cài đặt ứng dụng.

## Components Structure

```
screens/profile/
├── index.tsx                    # Main screen (137 dòng)
└── components/
    ├── ProfileHeader.tsx        # Header với profile card (67 dòng)
    ├── StatsCard.tsx           # Thống kê items (58 dòng)
    ├── UserInfoCard.tsx        # Thông tin cá nhân (62 dòng)
    ├── SettingsCard.tsx        # Menu cài đặt (120 dòng)
    ├── LogoutButton.tsx        # Nút đăng xuất (34 dòng)
    └── index.ts                # Export components
```

## Features

### 1. **Profile Header**

- Gradient background (blue)
- Avatar placeholder
- Tên user và email
- Badge "Sinh viên PTIT"
- Back button

### 2. **Stats Display**

- Tổng món đồ (Package icon)
- Món đồ an toàn (QrCode icon)
- Món đồ đang mất (AlertTriangle icon)
- Icon với background color tương ứng

### 3. **User Information**

- Họ và tên
- Mã sinh viên
- Email
- Số điện thoại
- Icon cho mỗi trường thông tin

### 4. **Settings Menu**

- Thông báo (Toggle switch)
- Chế độ tối (Toggle switch)
- Bảo mật (Navigate)
- Trợ giúp & Hỗ trợ (Navigate)

### 5. **Logout**

- Confirmation dialog
- Logout action

## API Integration

### Get User Items

```typescript
const data = await itemsApi.getItems();
setItems(data.items || []);
```

### Logout

```typescript
await logout(); // From AuthContext
```

## Navigation

### Route to Profile

```typescript
navigation.navigate('Profile');
```

### From Profile

```typescript
navigation.goBack(); // Back to previous screen
```

## Dependencies

### Required Libraries

```bash
# Gradient background
npx expo install expo-linear-gradient

# Icons
npm install lucide-react-native

# Animations
npm install react-native-reanimated
```

### Types Required

```typescript
interface User {
  fullName: string;
  email: string;
  studentId: string;
  phoneNumber: string;
}

interface Item {
  id: string;
  status: 'safe' | 'lost';
  // ... other fields
}
```

## Usage Example

### Basic Implementation

```typescript
import { ProfileScreen } from '@/screens';

// In navigator
<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{ headerShown: false }}
/>
```

### With Auth Context

```typescript
const { user, logout } = useAuth();

<ProfileScreen />
```

## Styling

### TailwindCSS Classes

#### Gradient Header

```css
colors:
  [ '#3b82f6',
  '#2563eb'] bg-white/10 backdrop-blur-lg;
```

#### Stats Cards

```css
bg-white rounded-2xl p-4 shadow-sm
bg-blue-50 (total)
bg-green-50 (safe)
bg-red-50 (lost)
```

#### Info Rows

```css
bg-blue-50 items-center justify-center
text-xs text-gray-500 (label)
font-semibold text-gray-900 (value)
```

#### Settings Items

```css
bg-white rounded-2xl shadow-sm
border-b border-gray-100 (divider)
bg-gray-50 (icon background)
```

## State Management

### Local State

```typescript
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
```

### Auth Context

```typescript
const { user, logout } = useAuth();
```

### Stats Calculation

```typescript
const stats = useMemo(() => {
  const totalItems = items.length;
  const lostItems = items.filter(i => i.status === 'lost').length;
  const safeItems = items.filter(i => i.status === 'safe').length;
  return { totalItems, lostItems, safeItems };
}, [items]);
```

## Error Handling

### Load Error

```typescript
try {
  const data = await itemsApi.getItems();
  setItems(data.items || []);
} catch (error) {
  Alert.alert('Lỗi', 'Không thể tải danh sách vật phẩm');
}
```

### Logout Error

```typescript
try {
  await logout();
} catch (error) {
  Alert.alert('Lỗi', 'Không thể đăng xuất');
}
```

## Animations

### Component Entry

```typescript
// ProfileHeader: immediate
<Animated.View entering={FadeInDown.duration(400)} />

// StatsCard: delay 100ms
<Animated.View entering={FadeInDown.duration(400).delay(100)} />

// UserInfoCard: delay 200ms
<Animated.View entering={FadeInDown.duration(400).delay(200)} />

// SettingsCard: delay 300ms
<Animated.View entering={FadeInDown.duration(400).delay(300)} />

// LogoutButton: delay 400ms
<Animated.View entering={FadeInDown.duration(400).delay(400)} />
```

## Settings Actions

### Toggle Switches

```typescript
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [darkModeEnabled, setDarkModeEnabled] = useState(false);

<Switch
  value={notificationsEnabled}
  onValueChange={setNotificationsEnabled}
  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
/>
```

### Navigate Actions

```typescript
const handleNavigate = (screen: string) => {
  Alert.alert('Thông báo', `Tính năng ${screen} đang được phát triển`);
};
```

## Logout Confirmation

```typescript
const handlePress = () => {
  Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
    { text: 'Hủy', style: 'cancel' },
    {
      text: 'Đăng xuất',
      style: 'destructive',
      onPress: onLogout,
    },
  ]);
};
```

## Best Practices

### ✅ Do's

- Load items on screen mount
- Show loading state while fetching
- Confirm before logout
- Handle auth errors gracefully
- Animate component entries
- Use memoized stats calculation

### ❌ Don'ts

- Don't skip loading states
- Don't allow logout without confirmation
- Don't mutate user data directly
- Don't navigate before logout completes
- Don't hardcode user info

## Testing Checklist

- [ ] Load user data successfully
- [ ] Display correct stats
- [ ] Toggle switches work
- [ ] Navigate to settings screens
- [ ] Logout with confirmation
- [ ] Handle network errors
- [ ] Show loading states
- [ ] Back button works
- [ ] Animations smooth
- [ ] Responsive on all screens

## Integration Points

### Auth Context

```typescript
const { user, logout } = useAuth();
```

### Items API

```typescript
const data = await itemsApi.getItems();
```

### Navigation

```typescript
navigation.goBack();
navigation.navigate('Settings');
```

## Future Enhancements

1. **Profile Picture Upload**
   - Image picker
   - Crop & resize
   - Upload to storage

2. **Edit Profile**
   - Update name, phone
   - Change password
   - Two-factor auth

3. **Theme Support**
   - Dark mode toggle
   - Persist preference
   - System theme sync

4. **Activity History**
   - Recent scans
   - Found items
   - Messages sent

5. **Privacy Settings**
   - Profile visibility
   - Contact preferences
   - Data export
