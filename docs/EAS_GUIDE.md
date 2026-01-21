# EAS Build & Deployment Guide

## 🚀 Getting Started with EAS

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo Account

```bash
eas login
```

### 3. Configure Project

```bash
eas build:configure
```

---

## 🏗️ Building

### Development Build

Build để test trên device:

```bash
npm run build:dev
# hoặc
eas build --profile development --platform android
```

### Preview Build

Build để test với production-like settings:

```bash
npm run build:preview
# hoặc
eas build --profile preview --platform android
```

### Production Build

Build cho production deployment:

```bash
npm run build:production
# hoặc
eas build --profile production --platform all
```

---

## 📱 Platform-Specific Builds

### Android Only

```bash
eas build --profile production --platform android
```

### iOS Only

```bash
eas build --profile production --platform ios
```

### Both Platforms

```bash
eas build --profile production --platform all
```

---

## 🔐 Environment Variables

### Set EAS Secrets

```bash
# API Keys
eas secret:create --scope project --name API_KEY --value "your-api-key"

# Firebase Config
eas secret:create --scope project --name FIREBASE_API_KEY --value "your-firebase-key"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "your-project-id"

# Other secrets
eas secret:create --scope project --name SENTRY_DSN --value "your-sentry-dsn"
```

### List Secrets

```bash
eas secret:list
```

### Delete Secret

```bash
eas secret:delete --name SECRET_NAME
```

---

## 📤 Submission

### Configure Submission

Cập nhật `eas.json` với thông tin submission:

**iOS:**

- Apple ID
- ASC App ID
- Apple Team ID

**Android:**

- Service Account Key Path

### Submit to App Store (iOS)

```bash
npm run submit:ios
# hoặc
eas submit --platform ios
```

### Submit to Play Store (Android)

```bash
npm run submit:android
# hoặc
eas submit --platform android
```

---

## 🔄 Update Strategy

### OTA Updates

Để push updates không cần rebuild:

```bash
# Install
npm install -g eas-cli

# Update
eas update --branch production --message "Fix bug XYZ"
```

---

## 📋 Build Profiles Explained

### Development

- **Purpose**: Testing on physical devices
- **Features**:
  - Development client enabled
  - Internal distribution
  - Fast builds

### Preview

- **Purpose**: Internal testing/QA
- **Features**:
  - Production-like settings
  - Internal distribution
  - APK for Android (easier testing)

### Production

- **Purpose**: App Store/Play Store release
- **Features**:
  - Optimized builds
  - Auto increment version
  - Production environment variables

---

## 🛡️ Security Best Practices

### ✅ DO:

- Store sensitive data in EAS Secrets
- Use different secrets for each environment
- Enable 2FA on Expo account
- Review build logs for sensitive data
- Use service account for Android

### ❌ DON'T:

- Commit `.env` files
- Hardcode API keys in code
- Share credentials in chat/email
- Use same secrets for dev/prod

---

## 📊 Monitoring Builds

### Check Build Status

```bash
eas build:list
```

### View Build Details

```bash
eas build:view BUILD_ID
```

### Cancel Build

```bash
eas build:cancel BUILD_ID
```

---

## 🐛 Troubleshooting

### Build Failed

1. Check build logs: `eas build:view BUILD_ID`
2. Verify all secrets are set
3. Check `eas.json` configuration
4. Ensure all dependencies are compatible

### Submission Failed

1. Verify credentials in `eas.json`
2. Check app version/build number
3. Review submission logs
4. Ensure app meets store requirements

---

## 📱 Testing Builds

### Install Development Build

```bash
# Scan QR code from build page
# Or download from Expo dashboard
```

### Internal Testing

1. Build with `preview` profile
2. Share build URL with testers
3. Testers download and install
4. Collect feedback

---

## 🔗 Useful Links

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Environment Variables](https://docs.expo.dev/build-reference/variables/)
