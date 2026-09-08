# Security Rules for Lost & Found QR

## Environment Variables

### ⚠️ IMPORTANT - DO NOT COMMIT THESE FILES:

- `.env`
- `.env.dev`
- `.env.production`
- `android-service-account.json` (Google Play)
- `*.p12` (iOS certificates)
- `*.mobileprovision` (iOS provisioning profiles)

### Safe Environment Variables

Store sensitive data in EAS Secrets instead:

```bash
# Set secrets for EAS builds
eas secret:create --scope project --name API_KEY --value "your-api-key"
eas secret:create --scope project --name FIREBASE_API_KEY --value "your-firebase-key"
```

### Environment Variable Usage

1. **Development**: Use `.env.dev` (gitignored)
2. **Production**: Use EAS Secrets (never commit)
3. **Public Values**: Can be in `app.config.js` under `extra`

## Firebase Security

### Never commit these files:

- Firebase service account keys
- Firebase config with sensitive data
- Google Services JSON/PLIST with private data

### Store in:

- EAS Secrets for production
- Local `.env` files (gitignored) for development

## Code Security

### Best Practices:

1. ✅ Always use TypeScript strict mode
2. ✅ Validate all user inputs
3. ✅ Use HTTPS only for API calls
4. ✅ Implement proper authentication
5. ✅ Never log sensitive data
6. ✅ Use secure storage for tokens
7. ✅ Implement certificate pinning for production

### Dependencies:

- Run `npm audit` regularly
- Keep dependencies updated
- Review security advisories

## Access Control

### Repository:

- Enable branch protection
- Require PR reviews
- Enable secret scanning (GitHub)

### EAS:

- Use role-based access
- Limit production access
- Enable 2FA for all team members

## Checklist Before Production

- [ ] All `.env` files are gitignored
- [ ] No hardcoded secrets in code
- [ ] All sensitive data in EAS Secrets
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Certificate pinning enabled
- [ ] Analytics properly configured
- [ ] Error tracking configured (no sensitive data)
