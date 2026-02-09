# 🚀 Quick Start - My Items Screen

## Các bước để chạy code mới

### 1. ✅ Cài đặt dependencies

```bash
npm install framer-motion lucide-react
```

### 2. ✅ Import Global CSS

Thêm vào file **App.tsx** hoặc file entry point:

```tsx
import './styles/global.css';
```

### 3. ✅ Setup ItemsProvider

Wrap app với **ItemsProvider**:

```tsx
import { ItemsProvider } from '@/contexts';

export default function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <ToastProvider>{/* Your app */}</ToastProvider>
      </ItemsProvider>
    </AuthProvider>
  );
}
```

### 4. ✅ Sử dụng MyItems component

```tsx
import { MyItems } from '@/screens/myItems';

function MyItemsPage() {
  return <MyItems onSelectItem={id => console.log('Selected:', id)} />;
}
```

## 📁 Files đã được tạo

✅ **Tailwind Config**

- `tailwind.config.js` - Đã cập nhật với colors & utilities
- `styles/global.css` - CSS variables cho light/dark mode

✅ **Context**

- `contexts/ItemsContext.tsx` - State management cho items

✅ **Components** (Web version)

- `components/ItemCard.tsx`
- `components/AddItemModal.tsx`
- `components/ui/input.tsx`

✅ **My Items Screen**

- `screens/myItems/index.tsx` - Main component (70 dòng)
- `screens/myItems/components/` - 6 components con
- `screens/myItems/hooks/useItemsFilter.ts`
- `screens/myItems/constants/categories.ts`

## ✨ Tính năng

- ✅ Search items theo tên hoặc ID
- ✅ Filter theo category (laptop, phone, wallet, etc.)
- ✅ Filter theo status (all, safe, lost)
- ✅ Statistics cards (tổng số, an toàn, đang mất)
- ✅ Add new item modal
- ✅ Empty states
- ✅ Smooth animations với framer-motion
- ✅ Icons với lucide-react
- ✅ Responsive design

## 🎨 Styling

Sử dụng Tailwind CSS với custom utilities:

- `card-elevated` - Card với shadow
- `btn-gradient` - Button gradient
- `scrollbar-hide` - Ẩn scrollbar

Theme colors tự động support dark mode!

## 📖 Tài liệu chi tiết

- [SETUP_WEB.md](SETUP_WEB.md) - Setup đầy đủ
- [README.md](README.md) - Cấu trúc code
- [styles/README.md](../../styles/README.md) - Tailwind config chi tiết

## ⚠️ Lưu ý

Code này là **Web version**. Nếu bạn đang dùng React Native/Expo, cần convert sang:

- `View`, `Text`, `TouchableOpacity` thay vì HTML elements
- `react-native-reanimated` thay vì framer-motion
- `@expo/vector-icons` thay vì lucide-react

## 🐛 Troubleshooting

**Error: Cannot find module 'framer-motion'**

```bash
npm install framer-motion lucide-react
```

**Error: useItems must be used within ItemsProvider**
→ Wrap app với `<ItemsProvider>`

**Styles không hiển thị đúng**
→ Kiểm tra đã import `styles/global.css`

---

🎉 **Hoàn tất!** Giờ bạn có thể sử dụng màn hình My Items với code sạch và dễ maintain!
