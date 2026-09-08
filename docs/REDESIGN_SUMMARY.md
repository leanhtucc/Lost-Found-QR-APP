# UI & Logic Re-design: Professional Lost & Found App

## Tổng quan thay đổi

Chuyển đổi toàn bộ giao diện và luồng dữ liệu từ **Sinh viên** sang **Người dùng đại chúng chuyên nghiệp**.

---

## 1. ✅ Cập nhật Data Types (TypeScript)

### 📁 `services/auth/types.ts`

**User Type - Đã cập nhật:**

- ✨ Thêm `memberId: string` - UUID định danh chính
- ✨ Thêm `trustScore: number` - Điểm uy tín (0-100)
- ✨ Thêm `isVerified: boolean` - Trạng thái xác minh
- ✨ Thêm `phoneNumber: string`
- ✨ Thêm `address?: string`
- ✨ Thêm `bio?: string`
- ✨ Thêm helper functions: `getUserLevel()`, `getLevelInfo()`

**User Levels:**

- 🥉 Bronze (< 50 điểm)
- 🥈 Silver (50-69 điểm)
- 🥇 Gold (70-89 điểm)
- 💎 Platinum (≥ 90 điểm)

### 📁 `types/item.ts`

- ✨ Thêm `owner?: User` - Object User đầy đủ
- ✨ Cập nhật `ScanItemResponse` với trust metrics:
  - `memberId` (thay vì studentId)
  - `trust_score`
  - `is_verified`
  - `total_returned`

### 📁 `types/chat.ts`

- ✨ Cập nhật để sử dụng `memberId`
- ✨ Thêm `isVerified` và `trustScore` cho chat participants
- 📝 Document: API Key Stream Chat: `tbn8y285wevk`

---

## 2. ✅ ProfileScreen - Trust Metrics

### 🎨 ProfileHeader (`screens/profile/components/ProfileHeader.tsx`)

**Thay đổi thiết kế:**

- 🖼️ Cover Image style với gradient Indigo
- 👤 Avatar lớn hơn (28x28) với border trắng
- ✅ Verified Badge (BadgeCheck icon) cạnh tên
- ❌ Loại bỏ label "Sinh viên PTIT"

### 🆕 TrustMetricsCard - Component mới

**File:** `screens/profile/components/TrustMetricsCard.tsx`

Hiển thị 3 metrics ngang:

- ⭐ **Uy tín:** trustScore với icon ngôi sao vàng
- 📦 **Đã trả lại:** totalReturned items
- 🏆 **Cấp bậc:** User level (Đồng/Bạc/Vàng/Bạch Kim)

### 📝 UserInfoCard (`screens/profile/components/UserInfoCard.tsx`)

**Cập nhật:**

- 🆔 "Mã sinh viên" → "Mã thành viên"
- ✨ Thêm hiển thị `address` (nếu có)
- ✨ Thêm hiển thị `bio` (nếu có)
- 🎨 Style cards bo góc 12px, icon Indigo

### 📱 ProfileScreen (`screens/profile/index.tsx`)

**Thứ tự hiển thị mới:**

1. ProfileHeader (Cover + Avatar + Verified)
2. 🆕 TrustMetricsCard
3. StatsCard (Tổng đồ/An toàn/Đang mất)
4. UserInfoCard
5. SettingsCard
6. LogoutButton

---

## 3. ✅ Finder Flow - Found Item Screen

### 🆕 FoundItemScreen

**File:** `screens/found-item/index.tsx`

**Màn hình mới dành cho người tìm thấy đồ (Finder):**

- 🎯 Hiển thị status banner (Lost/Safe)
- 📦 Thông tin đồ vật với category icon
- 💬 Lost message từ chủ sở hữu
- 👤 Owner Info Card với trust metrics
- 💌 Nút "Nhắn tin cho chủ sở hữu" (chỉ khi status = 'lost')

### 🆕 OwnerInfoCard

**File:** `screens/item-detail/components/OwnerInfoCard.tsx`

Component hiển thị thông tin chủ sở hữu:

- Avatar, tên, verified badge
- User level badge
- Trust Score và Total Returned
- Trust level indicator

---

## 4. ✅ Scanner & Deep Linking

### 🔄 Scanner Logic (`screens/scan/hooks/useQRScanner.ts`)

**Cập nhật:**

- 🔍 Fetch scan data từ API
- ✅ Kiểm tra ownership (own item vs other's item)
- 🚀 Navigate logic:
  - Own item → `ItemDetails` screen
  - Other's item → `FoundItem` screen

**Deep Link URL mới:**

```
lostfound://item/[id]
lostfoundapp://item/[id]
```

❌ Loại bỏ: `lostfoundqr://`

### 🗺️ Navigation (`navigation/index.tsx`)

**Thêm screens:**

- ✨ `FoundItem` screen
- ✨ Deep link config cho `/found/:itemId`

**RootStackParamList - Cập nhật:**

```typescript
Chat: {
  channelId: string;
  itemName: string;
  userName: string;
  userAvatar?: string;
  memberId?: string;      // 🆕
  isVerified?: boolean;   // 🆕
}
```

---

## 5. ✅ ChatDetail với Verified Badge

### 💬 ChatHeader (`screens/chat/detail/components/ChatHeader.tsx`)

**Thêm:**

- ✅ `isVerified` prop
- 🎖️ BadgeCheck icon bên cạnh tên người dùng

### 📱 ChatDetailScreen (`screens/chat/detail/index.tsx`)

**Cập nhật:**

- 📥 Nhận `isVerified` từ route params
- 🔄 Truyền `isVerified` vào ChatHeader

### 📋 ChatListScreen (`screens/chat/list/index.tsx`)

**Cập nhật:**

- 🔄 Pass `isVerified` khi navigate to Chat

---

## 6. ✅ Theme & Icons System

### 🎨 Theme Constants

**File mới:** `constants/theme.ts`

**Primary Color - Indigo:**

- Main: `#4F46E5` (indigo-600)
- Light: `#6366f1` (indigo-500)
- Dark: `#4338ca` (indigo-700)

**Success Color - Emerald:**

- Main: `#10B981` (emerald-500)

**Trust Score Colors:**

- 🥇 Gold: `#FFD700`
- 🥈 Silver: `#C0C0C0`
- 🥉 Bronze: `#CD7F32`

**Verified Badge:** `#3b82f6` (Blue)

### 📦 Icons

✅ Sử dụng **Lucide-React-Native** toàn bộ app

**Icon chính:**

- `BadgeCheck` - Verified badge
- `Star` - Trust score
- `Award` - User level
- `Package` - Items returned
- `CreditCard` - Member ID
- `MapPin` - Address
- `FileText` - Bio

---

## 📊 Cấu trúc Files mới

```
screens/
├── found-item/
│   └── index.tsx                          # 🆕 Finder Flow screen
├── profile/
│   └── components/
│       ├── TrustMetricsCard.tsx          # 🆕 Trust metrics
│       ├── ProfileHeader.tsx             # ✏️ Updated
│       └── UserInfoCard.tsx              # ✏️ Updated
├── item-detail/
│   └── components/
│       └── OwnerInfoCard.tsx             # 🆕 Owner info with trust
├── scan/
│   └── hooks/
│       └── useQRScanner.ts               # ✏️ Updated logic
└── chat/
    └── detail/
        └── components/
            └── ChatHeader.tsx            # ✏️ Added verified badge

constants/
└── theme.ts                              # 🆕 Professional theme

types/
├── item.ts                               # ✏️ Updated with owner
└── chat.ts                               # ✏️ Updated with memberId

services/auth/
└── types.ts                              # ✏️ Enhanced User type

navigation/
└── index.tsx                             # ✏️ Added FoundItem, updated links
```

---

## 🚀 Migration Notes

### Backend Integration Required:

1. **User API:**
   - Thêm fields: `memberId`, `trustScore`, `isVerified`, `address`, `bio`
   - Endpoint cập nhật profile

2. **Scan API:**
   - Endpoint: `/api/scan/:itemId`
   - Response: `ScanItemResponse` với trust metrics

3. **Stream Chat:**
   - Setup với API Key: `tbn8y285wevk`
   - User ID mapping: sử dụng `memberId`

### Database Changes:

```sql
-- Add new fields to users table
ALTER TABLE users ADD COLUMN member_id UUID UNIQUE;
ALTER TABLE users ADD COLUMN trust_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
```

---

## 🎯 Testing Checklist

- [ ] ProfileScreen hiển thị Trust Metrics
- [ ] Verified badge hiển thị đúng
- [ ] Scanner phân biệt own item vs other's item
- [ ] FoundItem screen hiển thị đúng thông tin owner
- [ ] Nút chat chỉ hiện khi status = 'lost'
- [ ] ChatDetail hiển thị verified badge
- [ ] Deep linking với URL mới hoạt động
- [ ] Theme colors Indigo được áp dụng
- [ ] All icons sử dụng Lucide-React-Native

---

## 📝 Known Limitations

1. **Scanner API Integration:**
   - Hiện tại sử dụng `getItemById` thay vì `/scan/:itemId`
   - Cần implement ownership check với `memberId`

2. **Mock Data:**
   - ChatDetailScreen vẫn dùng mock messages
   - Cần integrate với Stream Chat SDK

3. **Theme Migration:**
   - Một số màn hình cũ vẫn dùng blue cũ
   - Cần migrate dần sang Indigo theme

---

## 🎨 Design Improvements

### Before (Student-focused):

- 🎓 "Sinh viên PTIT" labels
- 🆔 "Mã sinh viên"
- 🔵 Blue theme (#3b82f6)
- ❌ No trust metrics
- ❌ No verified badges

### After (Professional):

- 👥 General public users
- 🆔 "Mã thành viên" (memberId)
- 💜 Indigo theme (#4f46e5)
- ⭐ Trust Score system
- ✅ Verified badges
- 🏆 User level tiers
- 📊 Professional metrics display

---

## 📚 Documentation Updated

- [x] TypeScript Types
- [x] Component interfaces
- [x] Navigation types
- [x] Theme constants
- [x] README này

---

**Version:** 2.0.0  
**Status:** ✅ Hoàn thành  
**Date:** 2026-02-08
