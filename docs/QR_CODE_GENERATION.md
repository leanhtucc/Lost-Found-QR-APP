# 📱 QR Code Generation Flow - Lost & Found App

## 🔄 Luồng tạo QR Code

### Backend Flow (Tự động)

```
┌─────────────────────────────────────────┐
│  Client: POST /api/items                │
│  {                                      │
│    name: "Laptop Dell",                 │
│    category: "electronics"              │
│  }                                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Backend: Create Item                   │
│  1. Generate unique itemId (nanoid)     │
│     itemId = "abc123xyz789def0"         │
│  2. Create QR URL                       │
│     qrCodeUrl = "https://api.../scan/   │
│                  abc123xyz789def0"      │
│  3. Generate QR Code Image (optional)   │
│  4. Save to database                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Response to Client                     │
│  {                                      │
│    success: true,                       │
│    data: {                              │
│      id: "uuid",                        │
│      itemId: "abc123xyz789def0",        │
│      qrCodeUrl: "https://api.../scan/   │
│                  abc123xyz789def0",     │
│      ...                                │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  App: Display QR Code                   │
│  - Use qrCodeUrl to generate QR         │
│  - Or use pre-generated QR image        │
└─────────────────────────────────────────┘
```

---

## 🎯 2 Cách Implement QR Code

### **Option 1: Backend Generate QR Image (Recommended)**

Backend tự động tạo QR code image và upload lên storage (S3, Cloudinary, etc.)

**Backend Code (Node.js):**

```typescript
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

// POST /api/items
async function createItem(req, res) {
  const { name, category } = req.body;

  // 1. Generate unique itemId
  const itemId = nanoid(16); // "abc123xyz789def0"

  // 2. Create QR URL
  const qrCodeUrl = `${process.env.APP_URL}/scan/${itemId}`;

  // 3. Generate QR Code Image
  const qrImageBuffer = await QRCode.toBuffer(qrCodeUrl, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // 4. Upload to storage (S3/Cloudinary)
  const qrImageUrl = await uploadToStorage(qrImageBuffer, `qr-${itemId}.png`);

  // 5. Save to database
  const item = await Item.create({
    ownerId: req.user.id,
    name,
    category,
    itemId,
    qrCodeUrl,
    qrImageUrl, // URL to the QR image
    status: 'safe',
  });

  return res.json({
    success: true,
    data: item,
  });
}
```

**App Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "itemId": "abc123xyz789def0",
    "name": "Laptop Dell",
    "qrCodeUrl": "https://yourapp.com/scan/abc123xyz789def0",
    "qrImageUrl": "https://cdn.yourapp.com/qr-abc123xyz789def0.png"
  }
}
```

**App Usage:**

```tsx
// Hiển thị QR từ URL có sẵn
<Image source={{ uri: item.qrImageUrl }} style={{ width: 200, height: 200 }} />
```

---

### **Option 2: App Generate QR (Client-side)**

App tự generate QR từ `qrCodeUrl`

**Backend Code:**

```typescript
// POST /api/items
async function createItem(req, res) {
  const { name, category } = req.body;

  // 1. Generate unique itemId
  const itemId = nanoid(16);

  // 2. Create QR URL
  const qrCodeUrl = `${process.env.APP_URL}/scan/${itemId}`;

  // 3. Save to database (NO QR image generation)
  const item = await Item.create({
    ownerId: req.user.id,
    name,
    category,
    itemId,
    qrCodeUrl,
    status: 'safe',
  });

  return res.json({
    success: true,
    data: item,
  });
}
```

**App Code (React Native):**

```tsx
import QRCode from 'react-native-qrcode-svg';

// Component hiển thị QR
function ItemQRCode({ qrCodeUrl }: { qrCodeUrl: string }) {
  return (
    <View style={styles.qrContainer}>
      <QRCode value={qrCodeUrl} size={200} color="#000000" backgroundColor="#FFFFFF" />
    </View>
  );
}

// Usage
<ItemQRCode qrCodeUrl={item.qrCodeUrl} />;
```

---

## 📦 Package Recommendations

### Backend (Node.js)

```bash
npm install qrcode nanoid
```

### Frontend (React Native)

```bash
npm install react-native-qrcode-svg react-native-svg
```

---

## 🎨 UI Flow trong App

### 1. **Create Item Screen**

```
┌─────────────────────────────┐
│  Thêm món đồ mới            │
│  ─────────────────────      │
│  Tên: [Laptop Dell]         │
│  Danh mục: 💻 Điện tử       │
│                             │
│  [Thêm món đồ] ← API Call   │
└─────────────────────────────┘
```

### 2. **Item Created - Show QR**

```
┌─────────────────────────────┐
│  ✅ Tạo thành công!         │
│  ─────────────────────      │
│  [QR Code Image]            │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓              │
│  ▓▓    ▓▓    ▓▓             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓              │
│                             │
│  Laptop Dell                │
│  ID: abc123xyz789def0       │
│                             │
│  [Tải QR xuống]             │
│  [Chia sẻ]                  │
└─────────────────────────────┘
```

### 3. **Item Detail Screen**

```
┌─────────────────────────────┐
│  Laptop Dell                │
│  💻 Điện tử | ✅ An toàn     │
│  ─────────────────────      │
│  [QR Code]                  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓              │
│                             │
│  [Xem QR lớn hơn]           │
│  [Tải xuống]                │
│  [Báo mất]                  │
└─────────────────────────────┘
```

---

## 🔐 QR Code Security

### URL Structure

```
https://yourapp.com/scan/{itemId}
```

### Khi người khác scan QR:

**Public Endpoint:** `GET /api/scan/:itemId`

```typescript
// Backend
async function scanQR(req, res) {
  const { itemId } = req.params;

  const item = await Item.findOne({ itemId });

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.status === 'lost') {
    // Show contact info
    return res.json({
      action: 'open_chat',
      item_info: {
        name: item.name,
        status: 'lost',
        lost_message: item.lostMessage,
        owner_info: {
          display_name: item.owner.name,
        },
      },
    });
  } else {
    // Just show info
    return res.json({
      action: 'info_only',
      message: 'This item is safe',
    });
  }
}
```

---

## ✨ Advanced Features

### 1. **Downloadable QR**

```tsx
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function downloadQR(qrImageUrl: string) {
  const fileUri = FileSystem.documentDirectory + 'my-qr.png';

  await FileSystem.downloadAsync(qrImageUrl, fileUri);
  await Sharing.shareAsync(fileUri);
}
```

### 2. **Print QR Sticker**

```tsx
import * as Print from 'expo-print';

async function printQR(item: Item) {
  const html = `
    <html>
      <body style="text-align: center">
        <img src="${item.qrImageUrl}" width="300" />
        <h2>${item.name}</h2>
        <p>ID: ${item.itemId}</p>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
}
```

### 3. **Custom QR Design**

```tsx
<QRCode
  value={qrCodeUrl}
  size={200}
  logo={require('@assets/logo.png')} // Your app logo
  logoSize={30}
  logoBackgroundColor="#ffffff"
  color="#3b82f6" // Blue QR
  backgroundColor="#f0f9ff"
/>
```

---

## 📝 Summary

### ✅ **Recommended Flow:**

1. **Backend tự động tạo:**
   - `itemId` (nanoid 16 chars)
   - `qrCodeUrl` (scan URL)
   - `qrImageUrl` (pre-generated QR image)

2. **App chỉ cần:**
   - Hiển thị QR từ `qrImageUrl`
   - Cho phép download/share
   - Scan QR của người khác

3. **Public Scan Flow:**
   - Người khác scan QR → `/api/scan/:itemId`
   - Nếu lost → Show contact button
   - Nếu safe → Show info only

### 📦 **Packages Needed:**

**Backend:**

- `qrcode` - Generate QR images
- `nanoid` - Generate unique IDs

**App:**

- `react-native-qrcode-svg` - Display QR (Option 2)
- `expo-sharing` - Share QR
- `expo-print` - Print QR

---

**🎯 Kết luận:** Backend tự động tạo QR khi tạo item, không cần action riêng từ app!
