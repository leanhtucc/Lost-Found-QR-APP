# Code Quality & Formatting Guide

## 🎨 Code Formatting

### Prettier

Project sử dụng Prettier để format code tự động.

**Format tất cả files:**

```bash
npm run format
```

**Check formatting (không modify):**

```bash
npm run format:check
```

**Prettier sẽ tự động format khi save** nếu bạn cài đặt extension trong VSCode.

### Cấu hình

- **Tab width**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line width**: 100 characters

---

## 🔍 Linting

### ESLint

Project sử dụng ESLint với TypeScript và React Native rules.

**Check linting:**

```bash
npm run lint
```

**Auto-fix linting errors:**

```bash
npm run lint:fix
```

### Rules

- TypeScript strict mode enabled
- React hooks rules enforced
- No unused variables (warning)
- No inline styles (warning)
- No console.log (warning, allows warn/error)

---

## 🔧 TypeScript

### Type Checking

**Run type check:**

```bash
npm run type-check
```

### Path Aliases

Sử dụng path aliases để import:

```typescript
// ✅ Good
import { Button } from '@components/Button';
import { HomeScreen } from '@screens/HomeScreen';

// ❌ Avoid
import { Button } from '../../components/Button';
```

---

## ✅ Validation

**Chạy tất cả checks:**

```bash
npm run validate
```

Script này sẽ chạy:

1. TypeScript type checking
2. ESLint
3. Prettier format check

---

## 📝 Best Practices

### 1. Format Before Commit

Luôn format code trước khi commit:

```bash
npm run format
npm run lint:fix
```

### 2. Fix Type Errors

Không bỏ qua TypeScript errors. Fix tất cả errors trước khi commit.

### 3. Component Structure

```typescript
// Template cho React component
import React from 'react';
import { View, Text } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View className="p-4">
      <Text className="text-lg font-bold">{title}</Text>
    </View>
  );
};
```

### 4. Naming Conventions

- **Components**: PascalCase (`Button.tsx`, `HomeScreen.tsx`)
- **Utilities**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRY`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)

### 5. File Organization

```
ComponentName/
  ├── ComponentName.tsx      # Main component
  ├── ComponentName.styles.ts # Styles (if needed)
  ├── ComponentName.test.tsx  # Tests
  └── index.ts               # Export
```

---

## 🔒 Pre-commit Checks

Pre-commit hook sẽ tự động chạy:

- Security checks (no env files)
- Type checking
- Linting

Nếu có lỗi, commit sẽ bị reject.

---

## 🛠️ VSCode Integration

### Recommended Extensions

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Tailwind autocomplete
4. **Expo Tools** - Expo development

### Settings

VSCode settings đã được cấu hình trong `.vscode/settings.json`:

- Format on save: ✅
- Auto fix ESLint on save: ✅
- Use workspace TypeScript: ✅

---

## 📊 CI/CD Integration

Thêm vào GitHub Actions/CI pipeline:

```yaml
- name: Install dependencies
  run: npm ci

- name: Run validation
  run: npm run validate
```
