# 📁 Project Structure Overview

```
LostAndFoundQR/
│
├── 📱 App Files
│   ├── App.tsx                      # Main app entry
│   ├── app.config.js                # Expo configuration
│   ├── app.d.ts                     # NativeWind types
│   └── index.ts                     # Entry point
│
├── ⚙️ Configuration
│   ├── babel.config.js              # Babel + NativeWind + dotenv
│   ├── tsconfig.json                # TypeScript + path aliases
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── eas.json                     # EAS build profiles
│   ├── .eslintrc.js                 # ESLint rules
│   ├── .prettierrc                  # Prettier config
│   └── package.json                 # Dependencies + scripts
│
├── 📂 Source Code
│   ├── 🎨 components/               # Reusable components
│   │   ├── Button.tsx
│   │   ├── InputField.tsx
│   │   └── index.ts
│   │
│   ├── 📱 screens/                  # App screens
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   │
│   ├── 🧭 navigation/               # Navigation config
│   │   └── index.ts
│   │
│   ├── 🔧 hooks/                    # Custom React hooks
│   │   └── index.ts
│   │
│   ├── 🛠️ utils/                    # Utility functions
│   │   └── index.ts
│   │
│   ├── 📊 constants/                # App constants
│   │   ├── index.ts
│   │   └── environment.ts           # Environment config
│   │
│   ├── 🌐 services/                 # API services
│   │   └── index.ts
│   │
│   ├── 💾 storage/                  # Storage utilities
│   │   └── index.ts
│   │
│   ├── 🏪 store/                    # State management
│   │   └── index.ts
│   │
│   ├── 🔥 firebase/                 # Firebase config
│   │   └── index.ts
│   │
│   ├── 📚 libs/                     # Third-party lib configs
│   │   └── index.ts
│   │
│   ├── ✅ schemas/                  # Validation schemas
│   │   └── index.ts
│   │
│   ├── 🌍 translations/             # i18n translations
│   │   └── index.ts                 # en, vi
│   │
│   └── 📝 types/                    # TypeScript types
│       ├── index.ts
│       └── env.d.ts                 # Environment types
│
├── 🖼️ Assets
│   └── assets/                      # Images, fonts, icons
│       ├── icon.png
│       ├── splash.png
│       ├── adaptive-icon.png
│       └── favicon.png
│
├── 📱 Native
│   └── android/                     # Android native code
│
├── 🔒 Environment & Security
│   ├── .env.example                 # Environment template
│   ├── .env.dev                     # Development env (gitignored)
│   ├── .env.production              # Production env (gitignored)
│   └── .gitignore                   # Git ignore rules
│
├── 🛠️ Scripts
│   └── scripts/
│       ├── setup.bat                # Windows quick setup
│       ├── setup.sh                 # Unix quick setup
│       └── pre-commit               # Git pre-commit hook
│
├── 📚 Documentation
│   ├── README.md                    # Main documentation
│   ├── SECURITY.md                  # Security practices
│   ├── SETUP_COMPLETE.md            # Setup summary
│   ├── CHECKLIST.md                 # Setup checklist
│   │
│   └── docs/
│       ├── CODE_QUALITY.md          # Formatting & linting
│       ├── EAS_GUIDE.md             # Build & deployment
│       └── GIT_HOOKS.md             # Git hooks setup
│
├── 🔧 IDE Configuration
│   └── .vscode/
│       ├── settings.json            # VSCode settings
│       └── extensions.json          # Recommended extensions
│
└── 📦 Dependencies
    └── node_modules/                # NPM packages

```

---

## 🎯 Key Directories Explained

### Source Code (`/`)

- **components/** - Shared UI components (Button, Input, etc.)
- **screens/** - Full-screen views (Home, Profile, etc.)
- **navigation/** - Navigation configuration
- **hooks/** - Custom React hooks (useAuth, useApi, etc.)
- **utils/** - Helper functions (date, string, validation)
- **constants/** - App-wide constants (colors, API URLs)
- **services/** - API calls and external services
- **storage/** - Local storage operations
- **store/** - Global state management (Context/Redux)
- **types/** - TypeScript type definitions
- **translations/** - Multi-language support

### Configuration Files

- **package.json** - Dependencies and npm scripts
- **tsconfig.json** - TypeScript config with path aliases
- **babel.config.js** - Babel with NativeWind & dotenv
- **tailwind.config.js** - Tailwind CSS configuration
- **eas.json** - EAS build profiles
- **.eslintrc.js** - Linting rules
- **.prettierrc** - Code formatting rules

### Security Files

- **.env.example** - Environment template (committed)
- **.env** - Actual environment (gitignored)
- **.gitignore** - Prevents committing sensitive files
- **SECURITY.md** - Security best practices

### Documentation

- **README.md** - Project overview and quick start
- **docs/CODE_QUALITY.md** - Code quality guidelines
- **docs/EAS_GUIDE.md** - Build and deployment guide
- **SECURITY.md** - Security practices
- **SETUP_COMPLETE.md** - Complete setup reference

---

## 📝 File Naming Conventions

### Components

```
components/
├── Button.tsx              # Component file
├── InputField.tsx          # Component file
└── index.ts                # Export file
```

### Screens

```
screens/
├── HomeScreen.tsx          # Screen component
├── ProfileScreen.tsx       # Screen component
└── index.ts                # Export file
```

### Utilities

```
utils/
├── formatDate.ts           # Utility function
├── apiClient.ts            # API client
└── index.ts                # Export file
```

### Types

```
types/
├── User.ts                 # Type definitions
├── Api.ts                  # API types
├── env.d.ts                # Environment types
└── index.ts                # Export file
```

---

## 🎨 Import Path Aliases

Instead of messy relative imports:

```typescript
// ❌ Bad
import { Button } from '../../../components/Button';
```

Use clean path aliases:

```typescript
// ✅ Good
import { Button } from '@components/Button';
```

### Available Aliases

- `@components/*` - Components
- `@screens/*` - Screens
- `@navigation/*` - Navigation
- `@hooks/*` - Custom hooks
- `@utils/*` - Utilities
- `@constants/*` - Constants
- `@services/*` - Services
- `@store/*` - State management
- `@types/*` - Type definitions
- `@firebase/*` - Firebase config
- `@libs/*` - Library configs
- `@storage/*` - Storage utils
- `@schemas/*` - Validation schemas
- `@translations/*` - Translations

---

## 🔄 Data Flow

```
User Action
    ↓
Screen Component
    ↓
Custom Hook (optional)
    ↓
Service (API call)
    ↓
Store (state update)
    ↓
Component Re-render
```

---

## 📦 Adding New Features

### 1. New Component

```bash
# Create file
components/NewComponent.tsx

# Export in index
components/index.ts
```

### 2. New Screen

```bash
# Create file
screens/NewScreen.tsx

# Add to navigation
navigation/index.ts

# Export
screens/index.ts
```

### 3. New Utility

```bash
# Create file
utils/newUtil.ts

# Export
utils/index.ts
```

### 4. New Type

```bash
# Create file
types/NewType.ts

# Export
types/index.ts
```

---

## 🎯 Best Practices

### File Organization

✅ One component per file
✅ Group related files in folders
✅ Use index.ts for exports
✅ Keep files focused and small

### Naming

✅ Components: PascalCase
✅ Files: PascalCase for components
✅ Utilities: camelCase
✅ Constants: UPPER_SNAKE_CASE

### Imports

✅ Use path aliases
✅ Group imports logically
✅ Sort alphabetically

---

This structure provides:

- 🎯 **Clear organization**
- 🔍 **Easy navigation**
- 📚 **Scalability**
- 🛡️ **Security**
- 🚀 **Performance**
