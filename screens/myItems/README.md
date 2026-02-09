# My Items Screen

Màn hình quản lý đồ vật của người dùng với cấu trúc code được tổ chức hợp lý.

## 📁 Cấu trúc thư mục

```
myItems/
├── index.tsx                    # Component chính (70 dòng)
├── components/                  # Các component con
│   ├── index.ts                # Export file
│   ├── MyItemsHeader.tsx       # Header với title và nút thêm (~35 dòng)
│   ├── SummaryCards.tsx        # 3 cards thống kê (~75 dòng)
│   ├── SearchBar.tsx           # Thanh tìm kiếm (~25 dòng)
│   ├── CategoryFilter.tsx      # Bộ lọc danh mục (~35 dòng)
│   ├── ItemsList.tsx           # Danh sách items (~60 dòng)
│   └── EmptyState.tsx          # Trạng thái rỗng (~50 dòng)
├── hooks/
│   └── useItemsFilter.ts       # Logic lọc items (~45 dòng)
└── constants/
    └── categories.ts           # Danh sách categories (~20 dòng)
```

## 🎯 Mô tả các file

### 1. **index.tsx** - Component chính

- Quản lý state và kết nối các component con
- Xử lý logic mở/đóng modal
- Khoảng 70 dòng code

### 2. **Components**

#### MyItemsHeader.tsx

- Hiển thị tiêu đề và tổng số items
- Nút thêm item mới
- Props: `totalItems`, `onAddClick`

#### SummaryCards.tsx

- 3 thẻ thống kê: Tổng cộng, An toàn, Đang mất
- Animated với framer-motion
- Props: `totalItems`, `safeCount`, `lostCount`, `statusFilter`, `onStatusFilterChange`

#### SearchBar.tsx

- Thanh tìm kiếm đơn giản
- Props: `value`, `onChange`

#### CategoryFilter.tsx

- Bộ lọc theo danh mục (scrollable horizontal)
- Props: `selectedCategory`, `onCategoryChange`

#### ItemsList.tsx

- Hiển thị danh sách items đã lọc
- Xử lý cả trường hợp có/không có items
- Props: `items`, `filteredItems`, `statusFilter`, `onSelectItem`, `onAddClick`

#### EmptyState.tsx

- 2 kiểu: `no-items` và `no-results`
- Hiển thị khi chưa có item hoặc không tìm thấy kết quả
- Props: `type`, `onAddClick?`

### 3. **Hooks**

#### useItemsFilter.ts

- Custom hook xử lý logic filter
- Input: items, searchQuery, categoryFilter, statusFilter
- Output: filteredItems, lostCount, safeCount
- Sử dụng useMemo để tối ưu performance

### 4. **Constants**

#### categories.ts

- Danh sách các category options với icon và label
- Dùng chung cho CategoryFilter component

## 💡 Ưu điểm của cấu trúc này

1. **Dễ bảo trì**: Mỗi component có trách nhiệm riêng
2. **Dễ test**: Có thể test từng component độc lập
3. **Reusable**: Các component có thể tái sử dụng
4. **Clean code**: Mỗi file < 200 dòng, dễ đọc
5. **Performance**: Sử dụng useMemo để tối ưu rendering
6. **Type-safe**: TypeScript với đầy đủ type definitions

## 🔧 Cách sử dụng

```tsx
import { MyItems } from '@/screens/myItems';

// Trong component cha
<MyItems onSelectItem={id => navigate('ItemDetail', { id })} />;
```

## 🎨 Styling

- Sử dụng Tailwind CSS
- Responsive design
- Dark mode support (thông qua theme variables)
- Animations với framer-motion
