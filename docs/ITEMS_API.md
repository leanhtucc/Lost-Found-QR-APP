# 📦 Items API Documentation

## Tổng quan

API Items được xây dựng để quản lý tài sản của người dùng trong ứng dụng Lost & Found QR. API hỗ trợ đầy đủ các chức năng CRUD và các tính năng đặc biệt như báo mất/tìm thấy, quét QR code.

---

## 🗂️ Data Model

### Item Interface

```typescript
interface Item {
  id: string; // UUID - Database ID
  itemId: string; // nanoid(16) - Unique ID cho QR
  ownerId: string; // User ID của chủ sở hữu
  name: string; // Tên vật phẩm (max 100 chars)
  category: ItemCategory; // Danh mục
  description?: string; // Mô tả (max 500 chars)
  status: 'safe' | 'lost'; // Trạng thái
  lostMessage?: string; // Tin nhắn khi mất (max 500 chars)
  qrCodeUrl: string; // URL QR Code
  imagePublicUrl?: string; // URL ảnh vật phẩm
  lastSeenLocation?: Location; // {lat: number, lng: number}
  securityPin?: string; // Mã PIN 4 số
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### Categories

```typescript
type ItemCategory =
  | 'electronics' // 💻 Điện tử
  | 'wallet' // 👛 Ví/Bóp
  | 'bag' // 🎒 Túi xách
  | 'keys' // 🔑 Chìa khóa
  | 'phone' // 📱 Điện thoại
  | 'jewelry' // 💍 Trang sức
  | 'documents' // 📄 Giấy tờ
  | 'other'; // 📦 Khác
```

---

## 🔌 API Endpoints

### 1. Lấy Dashboard Data

**Method:** Helper function (client-side)  
**Function:** `itemsApi.getDashboardData()`

**Response:**

```typescript
{
  items: Item[];
  total: number;
  safeCount: number;
  lostCount: number;
}
```

**Sử dụng:**

```typescript
const dashboardData = await itemsApi.getDashboardData();
console.log(
  `Tổng: ${dashboardData.total}, An toàn: ${dashboardData.safeCount}, Mất: ${dashboardData.lostCount}`
);
```

---

### 2. Lấy danh sách Items

**Endpoint:** `GET /api/items`  
**Auth:** ✅ Required

**Query Parameters:**

| Parameter | Type                        | Required | Description                 |
| --------- | --------------------------- | -------- | --------------------------- |
| status    | `"safe" \| "lost" \| "all"` | ❌       | Filter theo trạng thái      |
| category  | `ItemCategory`              | ❌       | Filter theo danh mục        |
| page      | `number`                    | ❌       | Trang (default: 1)          |
| limit     | `number`                    | ❌       | Số item/trang (default: 10) |

**Response:**

```typescript
{
  success: true,
  data: {
    items: Item[],
    total: 4,
    page: 1,
    limit: 10,
    totalPages: 1
  }
}
```

**Sử dụng:**

```typescript
// Lấy tất cả items
const allItems = await itemsApi.getItems({ status: 'all' });

// Lấy items đang mất
const lostItems = await itemsApi.getItems({ status: 'lost' });

// Lấy items theo category
const wallets = await itemsApi.getItems({ category: 'wallet' });
```

---

### 3. Lấy thông tin 1 Item

**Endpoint:** `GET /api/items/:id`  
**Auth:** ✅ Required

**Response:**

```typescript
{
  success: true,
  data: Item
}
```

**Sử dụng:**

```typescript
const item = await itemsApi.getItemById('uuid-here');
```

---

### 4. Tạo Item mới

**Endpoint:** `POST /api/items`  
**Auth:** ✅ Required

**Query Parameters:**

| Parameter        | Type           | Required | Description   |
| ---------------- | -------------- | -------- | ------------- |
| name             | `string`       | ✅       | Tên vật phẩm  |
| category         | `ItemCategory` | ✅       | Danh mục      |
| description      | `string`       | ❌       | Mô tả         |
| imagePublicUrl   | `string`       | ❌       | URL ảnh       |
| lastSeenLocation | `string`       | ❌       | JSON location |
| securityPin      | `string`       | ❌       | PIN 4 số      |

**Response:**

```typescript
{
  success: true,
  message: "Item created successfully",
  data: Item
}
```

**Sử dụng:**

```typescript
const newItem = await itemsApi.createItem({
  name: 'Laptop Dell Vostro',
  category: 'electronics',
  description: 'Laptop màu đen, có sticker',
  securityPin: '1234',
});
```

---

### 5. Cập nhật Item

**Endpoint:** `PATCH /api/items/:id`  
**Auth:** ✅ Required

**Query Parameters:**

| Parameter        | Type           | Required |
| ---------------- | -------------- | -------- |
| name             | `string`       | ❌       |
| category         | `ItemCategory` | ❌       |
| description      | `string`       | ❌       |
| imagePublicUrl   | `string`       | ❌       |
| lastSeenLocation | `string`       | ❌       |
| securityPin      | `string`       | ❌       |

**Sử dụng:**

```typescript
await itemsApi.updateItem('item-id', {
  name: 'Laptop Dell Vostro 15',
  description: 'Đã cập nhật mô tả',
});
```

---

### 6. Xóa Item

**Endpoint:** `DELETE /api/items/:id`  
**Auth:** ✅ Required

**Sử dụng:**

```typescript
await itemsApi.deleteItem('item-id');
```

---

### 7. Cập nhật Status (Báo mất/Tìm thấy)

**Endpoint:** `PATCH /api/items/:id/status`  
**Auth:** ✅ Required

**Query Parameters:**

| Parameter   | Type               | Required |
| ----------- | ------------------ | -------- |
| status      | `"safe" \| "lost"` | ✅       |
| lostMessage | `string`           | ❌       |

**Sử dụng:**

```typescript
// Báo mất
await itemsApi.updateStatus('item-id', {
  status: 'lost',
  lostMessage: 'Tôi đã mất ví ở quận 1, xin hãy liên hệ!',
});

// Tìm thấy
await itemsApi.updateStatus('item-id', {
  status: 'safe',
});
```

---

### 8. Quét QR Code (Public)

**Endpoint:** `GET /api/scan/:itemId`  
**Auth:** ❌ Public - Không cần Auth

**Response khi item "safe":**

```typescript
{
  item_info: {
    id: "abc123xyz789def0",
    name: "Laptop Dell Vostro",
    category: "electronics",
    status: "safe",
    owner_info: {
      display_name: "Anh Tu",
      avatar: "https://...",
      joined_date: "2024"
    }
  },
  action: "info_only",
  message: "This item is not reported as lost"
}
```

**Response khi item "lost":**

```typescript
{
  item_info: {
    id: "abc123xyz789def0",
    name: "Ví da nâu",
    category: "wallet",
    status: "lost",
    lost_message: "Tôi đã mất ví ở quận 1, xin hãy liên hệ!",
    owner_info: {...}
  },
  action: "open_chat"
}
```

**Sử dụng:**

```typescript
const scanResult = await itemsApi.scanQR('abc123xyz789def0');

if (scanResult.action === 'open_chat') {
  // Mở chat để liên hệ chủ sở hữu
  console.log('Item đang mất:', scanResult.item_info.lost_message);
} else {
  // Chỉ hiển thị thông tin
  console.log('Item an toàn, thuộc về:', scanResult.item_info.owner_info.display_name);
}
```

---

## 📊 Category Constants

### CATEGORY_ICONS

```typescript
export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  electronics: '💻',
  wallet: '👛',
  bag: '🎒',
  keys: '🔑',
  phone: '📱',
  jewelry: '💍',
  documents: '📄',
  other: '📦',
};
```

### CATEGORY_NAMES_VI

```typescript
export const CATEGORY_NAMES_VI: Record<ItemCategory, string> = {
  electronics: 'Điện tử',
  wallet: 'Ví/Bóp',
  bag: 'Túi xách',
  keys: 'Chìa khóa',
  phone: 'Điện thoại',
  jewelry: 'Trang sức',
  documents: 'Giấy tờ',
  other: 'Khác',
};
```

### Helper Functions

```typescript
// Lấy label tiếng Việt
const label = getCategoryLabel('electronics'); // "Điện tử"

// Lấy emoji icon
const icon = getCategoryIcon('wallet'); // "👛"
```

---

## 🎨 UI Components

### StatisticsCard

Hiển thị thống kê tổng quan:

```tsx
<StatisticsCard safeCount={3} lostCount={1} totalCount={4} lastAdded="2024-01-15T10:30:00Z" />
```

### ItemCard

Hiển thị thông tin item:

```tsx
<ItemCard
  item={item}
  index={0}
  onPress={() => handleSelectItem(item.id)}
  onMenuPress={() => handleItemMenu(item.id)}
/>
```

---

## 🔄 Luồng sử dụng trong Home Screen

```typescript
// 1. Load dashboard data khi mount
useEffect(() => {
  loadDashboardData();
}, []);

// 2. Hiển thị statistics
<StatisticsCard
  safeCount={dashboardData.safeCount}
  lostCount={dashboardData.lostCount}
  totalCount={dashboardData.total}
/>

// 3. Hiển thị danh sách items
{filteredItems.map((item, index) => (
  <ItemCard
    key={item.id}
    item={item}
    index={index}
    onPress={() => handleSelectItem(item.id)}
  />
))}

// 4. Pull to refresh
const onRefresh = useCallback(() => {
  setRefreshing(true);
  loadDashboardData(false);
}, []);
```

---

## ⚠️ Error Handling

Tất cả API calls đều throw Error khi có lỗi:

```typescript
try {
  const items = await itemsApi.getItems();
} catch (error) {
  console.error('Failed to load items:', error);
  showToast({
    message: error instanceof Error ? error.message : 'Không thể tải dữ liệu',
    type: 'error',
  });
}
```

---

## 📝 Notes

1. **Authentication:** Hầu hết endpoints cần authentication token (trừ scan QR)
2. **Query Parameters:** Sử dụng URLSearchParams để build query strings
3. **Date Format:** Tất cả dates được trả về dưới dạng ISO string
4. **Location:** Có thể là object `{lat, lng}` hoặc JSON string
5. **Image URLs:** Là public URLs từ storage service

---

## 🚀 Next Steps

- [ ] Implement item detail screen
- [ ] Add item editing functionality
- [ ] Implement QR code generation
- [ ] Add image upload for items
- [ ] Implement location picker
- [ ] Add security PIN verification
- [ ] Implement push notifications for lost items
- [ ] Add item sharing functionality

---

## 📞 API Configuration

Backend base URL được config trong `constants/environment.ts`:

```typescript
export const ENV = {
  API_URL: process.env.API_URL || 'http://192.168.10.102:3000',
};
```

Đảm bảo cập nhật `.env` file với đúng API URL của backend.
