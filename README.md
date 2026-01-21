# Lost & Found QR - Expo App

Ứng dụng Lost & Found QR được xây dựng bằng Expo, React Native và NativeWind (Tailwind CSS).

## 📁 Cấu trúc thư mục

```
├── android/              # Android native code
├── assets/              # Images, fonts, and other assets
├── components/          # Reusable React components
├── constants/           # App constants and configurations
├── firebase/            # Firebase configuration
├── hooks/               # Custom React hooks
├── libs/                # Third-party libraries configuration
├── navigation/          # Navigation configuration
├── schemas/             # Validation schemas
├── screens/             # App screens/pages
├── services/            # API services
├── storage/             # Storage utilities
├── store/               # State management
├── translations/        # i18n translations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main app component
├── app.config.js        # Expo configuration
├── babel.config.js      # Babel configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on Android:

```bash
npm run android
```

4. Run on iOS (Mac only):

```bash
npm run ios
```

5. Run on Web:

```bash
npm run web
```

## 🎨 Tailwind CSS (NativeWind)

Dự án sử dụng NativeWind để có thể dùng Tailwind CSS classes trong React Native:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-blue-600">Hello World</Text>
</View>
```

## 📝 Path Aliases

Dự án được cấu hình với các path aliases:

- `@components/*` → `./components/*`
- `@screens/*` → `./screens/*`
- `@navigation/*` → `./navigation/*`
- `@hooks/*` → `./hooks/*`
- `@utils/*` → `./utils/*`
- `@constants/*` → `./constants/*`
- `@services/*` → `./services/*`
- `@store/*` → `./store/*`
- `@types/*` → `./types/*`
- `@firebase/*` → `./firebase/*`
- `@libs/*` → `./libs/*`
- `@storage/*` → `./storage/*`
- `@schemas/*` → `./schemas/*`
- `@translations/*` → `./translations/*`

## 📚 Technologies

- **Expo** - React Native framework
- **React Native** - Mobile app framework
- **TypeScript** - Type safety
- **NativeWind** - Tailwind CSS for React Native
- **React Navigation** - Navigation library
- **EAS** - Expo Application Services for building & deployment

---

## 🎨 Code Quality & Formatting

### Format Code

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Linting

```bash
# Check linting
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

### Run All Validations

```bash
npm run validate
```

📖 **Chi tiết**: Xem [CODE_QUALITY.md](./docs/CODE_QUALITY.md)

---

## 🏗️ Building with EAS

### Setup EAS

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure
```

### Build Commands

```bash
# Development build
npm run build:dev

# Preview build
npm run build:preview

# Production build
npm run build:production
```

📖 **Chi tiết**: Xem [EAS_GUIDE.md](./docs/EAS_GUIDE.md)

---

## 🔐 Security

### Environment Variables

1. **NEVER** commit `.env` files
2. Use `.env.example` as template
3. Store production secrets in **EAS Secrets**

```bash
# Set EAS secrets
eas secret:create --scope project --name API_KEY --value "your-key"
```

### Security Checklist

- ✅ All `.env` files gitignored
- ✅ No hardcoded secrets
- ✅ Pre-commit hooks enabled
- ✅ TypeScript strict mode
- ✅ Regular dependency audits

📖 **Chi tiết**: Xem [SECURITY.md](./SECURITY.md)

---

## 📚 Documentation

- [Code Quality Guide](./docs/CODE_QUALITY.md) - Formatting, linting, best practices
- [EAS Guide](./docs/EAS_GUIDE.md) - Building & deployment
- [Security](./SECURITY.md) - Security best practices

---

## 🤝 Contributing

1. Format code: `npm run format`
2. Fix linting: `npm run lint:fix`
3. Check types: `npm run type-check`
4. Run validation: `npm run validate`
5. Commit changes

---

## 📄 License

MIT
