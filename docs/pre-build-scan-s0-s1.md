# Pre-build scan: S0 + S1

Date: 2026-10-06

The mobile checkout is `LostAndFoundQR`; the backend checkout is `Documents/GitHub/backend-basic`. Existing user changes were present in both working copies. They were preserved.

## 1. Baseline and after

| Project/check | Baseline | After |
|---|---|---|
| Mobile TypeScript (`npx tsc --noEmit`) | Did not start: the `npx` shim points to a missing npm CLI file. `node_modules` is absent. | Not verified. |
| Mobile Jest (`npm test`) | Did not start for the same broken npm shim. | Not verified. |
| Mobile ESLint | Did not start for the same broken npm shim. | Not verified. |
| Mobile Prettier | Available Prettier 3.9.6 found 8 files needing formatting. | `prettier --check "**/*.{js,jsx,ts,tsx,json}"` passes after formatting. The project’s pinned 3.7.x toolchain and `npm run validate` remain unavailable. |
| Backend TypeScript (`npm run typecheck`) | Passed. | Passed. |
| Backend Vitest | 25 files passed, 1 skipped; 184 passed, 11 skipped. The Phase 4 database integration gate was forced off, so no database was contacted. | Same counts after edits. |
| Backend format check | 13 files failed. | `npm run format:check` passes after formatting and the log cleanup. |
| `npm audit --omit=dev` | Registry advisory endpoint unavailable. | Still unavailable; no high/critical finding list could be obtained. |

## 2. S0 findings

### Console output

Dynamic values that could expose phone numbers, email details, message bodies, item data, location coordinates, identifiers, URLs, or full responses were removed or reduced to static event names. Authentication flow helpers now emit only the event name and timestamp; their detail objects are not printed.

| File:line | Previous output | Action |
|---|---|---|
| `services/firebase/phoneAuth.ts:97` | Normalized destination phone number | Removed. |
| `screens/scan/index.tsx:56` | Entire scan result, including the channel ID when present | Removed. |
| `hooks/useNotificationHandler.ts:78` | Full foreground notification and notification data | Removed. |
| `screens/home/index.tsx:148` | Feed previews, including pin latitude/longitude | Removed the debug effect. |
| `screens/home/hooks/useMapDiscovery.ts:244` | Subscribe acknowledgement and socket ID | Removed. |
| `screens/home/hooks/useHomeLostFeed.ts:125` | Subscribe acknowledgement; item identifiers in event logs | Removed/redacted. |
| `screens/home/hooks/useLiveRadar.ts:250` | Server acknowledgement message and item identifier | Replaced with static event labels. |
| `hooks/useAuth.ts:85`, `hooks/useFirebasePhoneAuth.ts:45`, `services/auth/api.ts:54`, `screens/auth/register/index.tsx:26`, `screens/auth/codeVerify/constants/helpers.ts:11` | Auth event details, which included masked email/phone values and response/error data | Emit event name and timestamp only. |
| `services/items/api.ts:542,593` | Request URLs and raw request parameters | Replaced with static request-start labels. |
| `services/notifications/api.ts:66,155,181,205,251,282` | URLs with notification/device identifiers, preferences, and response messages | Replaced with static event labels. |
| `services/notifications/pushNotification.ts:86,137` | Device ID and platform | Replaced with static event labels. |
| `services/upload/index.ts:129` | Upload URL and local file URI in debug output | Removed; only a static upload-start event remains. |
| `screens/reportItems/hooks/useReportFlow.ts:688` | Full created-item response | Removed. Item-selection logs now omit item IDs and names. |
| `docs/TEST_GOOGLE_LOGIN.md:81-83,257-267`, `docs/CHAT_API.md:66,114`, `docs/MODERATION_API.md:190,296`, `docs/ITEMS_API.md:299-302`, `docs/GOOGLE_SIGNIN_SETUP.md:136` | Examples printed tokens, user/message data, or channel details | Replaced with booleans, counts, or static status output. |
| Backend `src/middlewares/query-to-body.middleware.ts:28` | Entire copied query/body | Removed. The remaining middleware log is static. |

Other retained application logs report static state changes, counts, or event names. Documentation examples in `SETUP_GOOGLE_SIGNIN.md` still print the public OAuth client ID; it is configuration metadata rather than an access token.

### `any`

No `any` annotations were changed. The source scan found 60 mobile and 116 backend syntactic `any` patterns, excluding tests and generated code. The out-of-scope mobile files are `navigation/index.tsx`, `hooks/useNotificationHandler.ts`, `services/notifications/pushNotification.ts`, `components/molecules/LocationPickerModal.tsx`, `screens/home/index.tsx`, `screens/home/components/BottomSheetContent.tsx`, `screens/home/components/MapSection.tsx`, `screens/home/components/RadarItemPreviewCard.tsx`, and `types/react-test-renderer.d.ts`. Backend out-of-scope files are `src/middlewares/validate.middleware.ts`, `src/libs/logger.ts`, `src/libs/redis.ts`, `src/libs/typesafe.ts`, `src/utils/template.ts`, `src/utils/response.ts`, `src/socket/radar.socket.ts`, `src/modules/map/map.service.ts`, `src/modules/report/report.service.ts`, and `src/modules/notification/notification.repository.ts`, `notification.scheduler.ts`, and `notification.service.ts`. `any` occurrences inside the allowed auth, item, scan, chat/stream, return/handover, found-report, and response-parsing areas also remain. This part of S0 is unfinished; the scan did not justify broad type changes without the mobile compiler.

### Backend stray files

| Path | Finding | Recommendation |
|---|---|---|
| `prompt.txt` | Already absent in this working copy and shown as deleted by Git. No package/source reference was found. I did not delete it. | Preserve the current deletion unless the owner wants it restored. |
| `test-gemini.js` | Standalone Gemini smoke-test script by name; no package/source reference found. Not executed. | Keep only if used manually; move under a developer-only scripts folder after its owner reviews it. |
| `clean-test-user.js` | Standalone test-user cleanup script by name; no package/source reference found. Not executed. | Keep only if used manually; review its target safeguards before any use or removal. |
| `dist/` | Build output. `build` creates it and `start`/`main` use it. It is ignored by Git and excluded by Docker and Render. | Keep excluded as a generated artifact. |
| `uploads/images/` | Directory exists; no source reference to that exact path was found. `uploads/` is ignored/excluded by Git, Docker, and Render. | Retain local data until the owner confirms it is disposable; exclude it from archives. |

### Packaging, environment examples, dependencies

The mobile `.gitignore` and backend `.gitignore`, `.dockerignore`, and `.renderignore` now exclude `node_modules`, `dist`, `build`, `.expo`, `coverage`, `.env*`, `*.pem`, `*.key`, both named service-account JSON files, and `credentials/`. Each ignore file keeps `.env*.example` templates unignored. Missing code-read environment key names were appended with empty values to the mobile `.env.example` and backend `.env.example` and `.env.development.example`; names only were inspected.

Ready-to-use zip exclusions: `**/node_modules/**`, `**/dist/**`, `**/build/**`, `**/.expo/**`, `**/coverage/**`, `**/.env*` (except `**/.env*.example`), `**/*.pem`, `**/*.key`, `**/firebase-service-account.json`, `**/android-service-account.json`, `**/credentials/**`, `**/uploads/**`, and `.git/**`. No zip was created.

`.env` and other local environment-file names are present in the working copies. Their contents were not inspected. Treat any live credentials in them as exposed to the local working copy and rotate them before sharing or packaging.

The npm security audit could not reach `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`; high/critical advisories and production reachability are therefore unknown for both projects.

## 3. S1 navigation map

### Route inventory

| Route | Registered | Params | Callers/reachability | Issues |
|---|---|---|---|---|
| `TabNavigator` | Yes, stack | `{screen?: string}` | Initial route after auth | Nested screen is a broad string, not a typed tab param list. |
| `Home` | Yes, stack and tab | `undefined` | Default tab; home actions | Reachable. |
| `Scan` | Yes, stack and tab | `undefined` | Tab; found-report flow | Reachable. |
| `MyItems` | Yes, stack and tab | `undefined` | Tab, profile, home | Reachable. |
| `ChatInbox` | Tab only | `undefined` | Chat tab | Not in `RootStackParamList`; it is a child tab route. |
| `Profile` | Yes, stack and tab | `undefined` | Tab and account actions | Protected. |
| `ItemDetails` | Yes, stack | `{itemId: string}` | Owner item cards, owner notifications, scan result | Protected. Backend returns 403 to a non-owner. |
| `PublicItemDetails` | Yes, stack | `{itemId: string}` | Home discovery; `item/:itemId` and `public-item/:itemId` links | Guest-allowed; public API request uses no auth. |
| `ReportItems` | Yes, stack | `undefined` | Home and notification empty state | Protected. |
| `FoundItemReport` | Yes, stack | `undefined` | Home | Protected. |
| `ManualFoundReport` | Yes, stack | `undefined` | Found-item report flow | Protected. |
| `FoundReportDetails` | Yes, stack | `{reportId: string}` | Home and notifications | Protected. |
| `Notifications` | Yes, stack | `undefined` | Profile and notification tab actions | Protected. |
| `ChatList` | Yes, stack | `undefined` | Notification handler and chat navigation | Separate from the `ChatInbox` tab name. |
| `Chat` | Yes, stack | `{channelId, itemName, userName, userAvatar?, memberId?, isVerified?}` | Scan, found-report acceptance, public item contact, chat list, notifications | Protected; channel ID is required. |
| `LiveTracking` | Yes, stack | `{returnSessionId: string}` | Chat detail | Protected. |
| `HandoverConfirm` | Yes, stack | `{returnSessionId: string}` | Chat detail and live tracking | Protected. |
| `RewardStatus` | Yes, stack | `{returnSessionId: string}` | Handover confirmation | Protected. |
| `RateFinder` | Yes, stack | `{returnSessionId: string}` | Chat detail and reward flow | Protected. |
| `EditProfile` | Yes, stack | `undefined` | Profile | Protected. |
| `NotificationSettings` | Yes, stack | `undefined` | Profile | Protected. |
| `ChangePassword` | Yes, stack | `undefined` | Profile | Protected. |
| `DeleteAccount` | Yes, stack | `undefined` | Profile | Protected. |
| `Onboarding` | Yes, stack | `undefined` | Initial route when onboarding is incomplete | Reachable without auth. |
| `Login` | Yes, stack | `undefined` | Initial route, auth actions, protected-route redirect | Reachable without auth. |
| `AuthRegister` | Yes, stack | `undefined` | Auth flow | Reachable without auth. |
| `CodeVerify` | Yes, stack | `{email: string}` | Registration/auth flow | Reachable without auth. |
| `ForgotPassword` | Yes, stack | `undefined` | Login | Reachable without auth. |
| `ResetPassword` | Yes, stack | `{token?: string}` | `reset-password` link | Reachable without auth. |
| `Congratulation` | Yes, stack | `undefined` | No call site found | Dead/unreachable from current app flows. |
| `Register`, `QRCodeView`, `ScanResult`, `Settings`, `EditItem`, `Help`, `SignUp` | No | Declared in `RootStackParamList` only | No registered screen | Stale declarations. |

`RootStackParamList` also does not describe `ChatInbox` as a tab child. Calls to `Chat` use the required channel/item/user fields, and return-flow calls pass `returnSessionId`. The typed root list contains other routes used through the stack. Call-site inventory was source-based; dynamic targets were not executed.

### Issues fixed and remaining

- Owner item detail’s chat action had navigated to nonexistent `ChatScreen` and had no available channel ID. The action is now hidden. Owners can use the existing inbox; a channel ID is not invented.
- `item/:itemId` now resolves to `PublicItemDetails`, with `public-item/:itemId` as an explicit alias. The owner detail fetch returns 403 for a non-owner; routing legacy finder links through that screen would be unsafe. The public screen uses the public item endpoint and omits owner-only fields/actions.
- Unauthenticated navigation now permits `PublicItemDetails`. Other protected stack routes are reset to Login/Onboarding after the navigator is ready. Auth screens remain available without a session.
- Added deep-link parser tests for both public paths. They could not be run because the mobile Jest dependencies are absent.
- Native Android/iOS scheme filters were not changed. Later build-config work must register `lostfoundqr`, `lostfound`, and `lostfoundapp` as URL schemes/intent filters while retaining the Expo `createURL` prefix.

### Back behavior and gating

Global stack `gestureEnabled` is false. The scan screen handles Android hardware Back and has a visible close action. Item, public item, chat, auth, tracking, handover, reward, and rating screens found in the scan have visible back/close or completion actions. Live tracking and handover do not install a `BackHandler`; their sessions may continue when Android Back leaves the screen. Verify this on device before deciding whether to intercept Back or show a confirmation. No navigation trap was changed beyond the owner chat action.

Guest access is limited to `PublicItemDetails`; auth/onboarding screens are public. All other registered screens sit behind the auth-state reset. Deep-link and Android hardware-back behavior still require device verification.

## 4. Owner decisions

- Decide whether `test-gemini.js` and `clean-test-user.js` are still used manually before moving or deleting them.
- Decide whether the existing `uploads/images/` contents may be discarded.
- Rotate any live credentials stored in local `.env*` files before sharing the working copy.
- The unused typed routes can be removed in a separate cleanup after callers are confirmed; they were left untouched here.

## 5. Later phases

- Add native scheme declarations/Android intent filters in the planned build-config phase.
- Device-test deep links, auth redirects, Android Back in tracking/handover, and gesture behavior.
- Run mobile TypeScript, Jest, ESLint, and `npm run validate` after restoring the project dependencies and npm launcher.
- Re-run `npm audit --omit=dev` when registry access works; verify any reported high/critical package reachability.
- No Phase 3 backend work, migrations, production database access, commits, pushes, deployments, or zip creation were performed.

## 6. Files changed

Format-only backend files: the 13 files identified by the baseline Prettier check (`src/jobs/daily-notification.job.ts`, `src/jobs/refund.job.ts`, `src/libs/redis.ts`, `src/libs/typesafe.ts`, `src/modules/ai/ai.typesafe.test.ts`, `src/modules/auth/auth.schema.test.ts`, `src/modules/item/item.repository.ts`, `src/modules/notification/notification.scheduler.ts`, `src/modules/notification/notification.template.ts`, `src/modules/report/report.controller.ts`, `src/modules/report/report.schema.ts`, `src/modules/report/report.service.ts`, `src/modules/report/report.types.ts`). Mobile formatting changed all 8 files identified by the read-only check; 4 were format-only (`Button.tsx`, `Typography.tsx`, `BottomTab.tsx`, `types/radar.ts`) and 4 also contain S1/privacy logic changes. The final project Prettier check is green.

Logic/configuration changes for this scan: mobile `navigation/index.tsx`, new `navigation/linking.ts` and `navigation/__tests__/linking.test.ts`, `screens/item-detail/index.tsx`, privacy-safe logging in the mobile source/docs listed above, `.gitignore`, `.env.example`, and `.gitattributes`; backend `src/middlewares/query-to-body.middleware.ts`, `.gitignore`, `.dockerignore`, `.renderignore`, both environment example files, and `.gitattributes`.

Both repositories already contained unrelated working-tree changes. Their total `git diff --stat` includes those pre-existing edits and deletions, so it is not a reliable measure of this scan’s changes. No commit was created.

## Explicitly unverified

Mobile TypeScript, Jest, ESLint, and `npm run validate`; execution of the new deep-link tests; npm audit vulnerability/reachability results; device deep-link and Back behavior; and whether the standalone backend scripts or upload directory are still needed. Backend TypeScript, tests, and formatting were verified as reported above.
