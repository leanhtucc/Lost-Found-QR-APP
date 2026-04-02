# Tailwind CSS Setup Guide

## 📋 Cấu hình đã thêm

### 1. Tailwind Config (tailwind.config.js) ✅

Đã thêm:

- **Colors**: Hệ thống màu với CSS variables (primary, secondary, success, destructive, etc.)
- **Utilities**: Custom classes (card-elevated, btn-gradient, scrollbar-hide)
- **Font Family**: Display font với fallbacks

### 2. Global Styles (styles/global.css) ✅

Đã tạo file với:

- Tailwind directives (@tailwind base, components, utilities)
- CSS variables cho light mode và dark mode
- Base styles cho body và elements

## 🚀 Cách sử dụng

### Bước 1: Import Global CSS

Thêm import vào file App chính của bạn:

**Cho React/Next.js:**

```tsx
// App.tsx hoặc _app.tsx
import '@/styles/global.css';

function App() {
  return (
    // Your app
  );
}
```

**Cho Expo Web:**

```tsx
// App.tsx
import './styles/global.css';

export default function App() {
  return (
    // Your app
  );
}
```

### Bước 2: Sử dụng các class đã config

```tsx
// Example usage
<div className="card-elevated">
  <h1 className="text-foreground">Hello</h1>
  <button className="btn-gradient">Click me</button>
</div>
```

## 🎨 Các Class Tùy Chỉnh

### card-elevated

Card với background, border và shadow:

```tsx
<div className="card-elevated p-4">
  <p>Nội dung card</p>
</div>
```

### btn-gradient

Button với gradient background:

```tsx
<button className="btn-gradient px-6 py-3">Nút đẹp</button>
```

### scrollbar-hide

Ẩn scrollbar nhưng vẫn scroll được:

```tsx
<div className="overflow-x-auto scrollbar-hide">
  <div className="flex gap-2">{/* Scrollable content */}</div>
</div>
```

## 🌈 Hệ Thống Màu

### Background Colors

- `bg-background` - Màu nền chính
- `bg-card` - Màu nền card
- `bg-secondary` - Màu nền phụ

### Text Colors

- `text-foreground` - Text chính
- `text-muted-foreground` - Text mờ
- `text-primary` - Text màu primary
- `text-success` - Text màu thành công
- `text-destructive` - Text màu lỗi

### Status Colors

- `bg-primary` / `text-primary` - Màu chính
- `bg-success` / `text-success` - Màu thành công (xanh lá)
- `bg-destructive` / `text-destructive` - Màu lỗi/nguy hiểm (đỏ)

### Border & Ring

- `border-border` - Màu viền
- `ring-primary` - Ring màu primary
- `ring-success` - Ring màu success
- `ring-destructive` - Ring màu destructive

## 🌙 Dark Mode

CSS variables tự động chuyển đổi khi thêm class `dark` vào thẻ html:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

## 🔧 Tùy Chỉnh Màu

Sửa file `styles/global.css` để thay đổi màu:

```css
:root {
  --primary: 262 83% 58%; /* Purple mặc định */
  /* Thay đổi sang blue: */
  --primary: 217 91% 60%;
}
```

Màu sử dụng định dạng HSL: `hue saturation lightness`

## ✅ Kiểm Tra Cài Đặt

Tạo component test:

```tsx
export function TailwindTest() {
  return (
    <div className="p-8 space-y-4">
      <div className="card-elevated p-4">
        <h2 className="text-xl font-bold text-foreground">Card Elevated</h2>
        <p className="text-muted-foreground">Đây là một card với shadow</p>
      </div>

      <button className="btn-gradient px-6 py-3 rounded-lg text-primary-foreground">
        Button Gradient
      </button>

      <div className="flex gap-2">
        <div className="w-20 h-20 bg-primary rounded-lg" />
        <div className="w-20 h-20 bg-success rounded-lg" />
        <div className="w-20 h-20 bg-destructive rounded-lg" />
      </div>
    </div>
  );
}
```

Nếu component này hiển thị đúng màu sắc và styles → Cài đặt thành công! ✅

## 📚 Tham Khảo

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind CSS Variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [HSL Color Picker](https://hslpicker.com/)
