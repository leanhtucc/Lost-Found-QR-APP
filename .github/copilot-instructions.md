# LostAndFoundQR Project Guidelines

## Scope

These instructions apply to all coding tasks in this workspace.

## Project Context

- Product: LostAndFoundQR (FindBack), a Lost & Found app with QR-based flows.
- Main domains: auth, onboarding, home feed, scan, item detail, report items, chat, notifications, profile.

## Tech Stack

- Expo SDK 54, React Native 0.81.5, TypeScript strict.
- React Navigation v7 (Stack + Bottom Tabs).
- Styling uses NativeWind and StyleSheet together.
- Global app state currently uses React Context (AuthContext, ToastContext, ItemsContext).
- Backend integrations include Firebase (App/Auth), Google Sign-in, and service modules under services/.
- Error tracking uses Sentry.

## Architecture Rules

- Keep flow: Screen -> Hook -> Service -> Context/Storage.
- Place API/domain calls in services/.
- Place reusable business logic in hooks/.
- Reuse existing contexts before introducing new global-state architecture.
- Do not introduce Zustand/store as the default pattern unless explicitly requested.

## Code Conventions

- Prefer Functional Components + Hooks.
- Prefer alias imports over deep relative imports.
- Prefer NativeWind className for static styling; use StyleSheet for complex/reusable styles.
- Avoid inline styles unless values are dynamic.
- Keep changes minimal and consistent with the surrounding module patterns.

## Path Aliases

Use these aliases where possible:

- @/\*
- @components/\*
- @screens/\*
- @navigation/\*
- @hooks/\*
- @utils/\*
- @constants/\*
- @services/\*
- @types/\*
- @firebase/\*
- @storage/\*
- @translations/\*
- @contexts/\*
- @assets

## App Bootstrap and Splash

- Startup flow: index.ts -> App.tsx -> app-root.tsx.
- Keep the two-layer splash architecture in app-root.tsx (native splash + custom overlay).
- Do not remove or bypass preventAutoHideAsync/hideAsync sequencing unless task explicitly requires it.

## Quality and Validation

When relevant to the change, run:

- npm run lint
- npm run type-check
- npm run validate

## Platform Notes

- Android prebuild: npm run prebuild:android.
- iOS prebuild requires macOS/Linux; on Windows, iOS native generation can be skipped.

## Communication

- Prefer Vietnamese for explanations and code comments unless the user requests another language.
- Be concise, practical, and implementation-focused.
