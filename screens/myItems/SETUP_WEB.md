# Setup Web Version - My Items Screen

## 📋 Tổng quan

Màn hình My Items đã được refactor thành **web version** với các dependencies:

- **framer-motion**: Animations
- **lucide-react**: Icons
- **Tailwind CSS**: Styling (đã có trong project)

## 🚀 Cài đặt Dependencies

### 1. Cài đặt các package cần thiết

```bash
npm install framer-motion lucide-react
# hoặc
yarn add framer-motion lucide-react
```

### 2. Cài đặt ItemsContext Provider

Thêm `ItemsProvider` vào App component của bạn:

```tsx
// App.tsx hoặc _layout.tsx (cho Expo Router)
import { ItemsProvider } from '@/contexts';

export default function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <ToastProvider>{/* Your app content */}</ToastProvider>
      </ItemsProvider>
    </AuthProvider>
  );
}
```

## 📁 Cấu trúc Files đã tạo

```
screens/myItems/
├── index.tsx                           # Main component (~70 dòng)
├── README.md                           # Documentation
├── components/
│   ├── index.ts                       # Exports
│   ├── MyItemsHeader.tsx              # Header (~35 dòng)
│   ├── SummaryCards.tsx               # Summary stats (~75 dòng)
│   ├── SearchBar.tsx                  # Search input (~25 dòng)
│   ├── CategoryFilter.tsx             # Category filter (~35 dòng)
│   ├── ItemsList.tsx                  # Items list (~60 dòng)
│   └── EmptyState.tsx                 # Empty states (~50 dòng)
├── hooks/
│   └── useItemsFilter.ts              # Filter logic (~45 dòng)
└── constants/
    └── categories.ts                  # Category options (~20 dòng)

contexts/
└── ItemsContext.tsx                   # Items state management (~70 dòng)

components/
├── ItemCard.tsx                       # Item card web version (~75 dòng)
├── AddItemModal.tsx                   # Add item modal (~140 dòng)
└── ui/
    └── input.tsx                      # Input component (~20 dòng)
```

## 🎨 Tailwind CSS Setup

### ✅ Đã cấu hình xong!

Các class cần thiết đã được thêm vào:

- **tailwind.config.js**: Colors, utilities
- **styles/global.css**: CSS variables cho light/dark mode

### Import Global CSS

Thêm vào file App chính:

```tsx
// App.tsx
import './styles/global.css';
```

### Các Class Đã Config

**Custom Utilities:**

- `card-elevated` - Card với shadow
- `btn-gradient` - Button với gradient
- `scrollbar-hide` - Ẩn scrollbar

**Colors:**

- `bg-background`, `bg-card`, `bg-secondary` - Background colors
- `text-foreground`, `text-muted-foreground` - Text colors
- `text-primary`, `text-success`, `text-destructive` - Status colors
- `ring-primary`, `ring-success`, `ring-destructive` - Ring colors
- `border-border` - Border colors

📖 **Chi tiết**: Xem [styles/README.md](../../styles/README.md)

## 🔧 Cách sử dụng

```tsx
import { MyItems } from '@/screens/myItems';

function MyItemsPage() {
  const handleSelectItem = (id: string) => {
    // Navigate to item detail
    console.log('Selected item:', id);
  };

  return <MyItems onSelectItem={handleSelectItem} />;
}
```

## ⚠️ Lưu ý

### React Native vs Web

Project hiện tại là **Expo/React Native**, nhưng code My Items mới là **web version** với:

- HTML elements (`div`, `button`, `input`)
- framer-motion (web animation library)
- lucide-react (web icon library)
- Tailwind CSS classes

Nếu bạn muốn **React Native version**, cần convert sang:

- `View`, `Text`, `TouchableOpacity` thay vì `div`, `button`
- `react-native-reanimated` thay vì framer-motion
- Vector icons từ `@expo/vector-icons` thay vì lucide-react
- StyleSheet hoặc NativeWind thay vì Tailwind CSS classes

## 🐛 Troubleshooting

### Error: Cannot find module 'framer-motion'

```bash
npm install framer-motion
```

### Error: Cannot find module 'lucide-react'

```bash
npm install lucide-react
```

### Error: useItems must be used within ItemsProvider

Đảm bảo đã wrap app với `ItemsProvider`:

```tsx
<ItemsProvider>
  <YourApp />
</ItemsProvider>
```

## 📚 Tài liệu tham khảo

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
