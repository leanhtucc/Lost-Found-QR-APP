# Phase 2 Mobile Acceptance

## A. Architecture Before

REST services independently read SecureStore tokens, built Authorization headers, parsed errors, and—in Items, Radar, Notifications, and Returns—implemented separate 401 refresh/retry paths. Concurrent failures could issue multiple refresh requests, overwrite token pairs, clear storage repeatedly, and emit multiple logout/navigation events.

Expo metadata was duplicated between `app.json` and `app.config.js`, the npm package retained the unrelated `expertenglish` name, and environment identity was partly inferred from `__DEV__` instead of the configured development/preview/production profile.

## B. Architecture After

All authenticated backend REST modules route through a single transport policy in `services/http`. Feature services retain DTO and endpoint ownership. Auth state/navigation remains in `AuthContext`; Socket.io, Firebase, and native map functionality remain outside the client.

## C. Files Changed

- Added central client, error model, queue tests, and service migration regression tests under `services/http`.
- Migrated Auth, Items, Radar, Notifications, Found Reports, Returns, Reports, Chat, Moderation, Map backend calls, and Upload services.
- Added identifier aliases and applied them to Item, Return, and Found Report DTOs.
- Consolidated Expo config and strengthened environment profile validation.
- Removed the legacy client-side Telegram bot logger/config so a server credential is no longer bundled; Sentry remains the client reporting channel.
- Renamed npm package metadata to `lost-and-found-qr-mobile` without changing native IDs.
- Added Phase 2 architecture and acceptance documentation.

## D. API Client

The client centralizes base URL, headers, auth modes, timeout, safe parsing, error normalization, refresh, retry, and session-expiry signaling. No token/password/Authorization value is logged by the new client.

## E. Refresh Queue

Unit coverage proves that three parallel 401 responses produce exactly one refresh call, all originals retry after success, failure rejects all waiters while clearing/emitting once, and a retry that remains 401 does not loop.

## F. Error Model

`ApiError` exposes stable `status`, `code`, `message`, `details`, and categorized `kind` values for validation, auth, forbidden, not found, conflict, rate limit, network, timeout, and server errors.

## G. Identifier Contract

Typed aliases document internal item identity, public item identity, QR identity, Guardian/found report identities, channel identity, return-session identity, and synthetic discovery keys. No QR payload or scanner route changed.

## H. Config Consolidation

`app.config.js` is the only Expo config source; the obsolete `app.json` was removed. Development remote-host and production private-host guards prevent accidental cross-environment API selection. Display name is `Lost and Found QR`; slug/scheme and `com.lostfound.app` native IDs remain stable.

## I. Dependencies Removed/Kept

No dependency was removed without a native rebuild. Scanner/Firebase/native dependencies were retained. Confirmed source-unused candidates are documented for a later isolated cleanup with Android rebuild verification.

## J. Test Results (re-run 2026-09-27)

- TypeScript: **PASS** (`tsc --noEmit`, exit 0).
- ESLint: **PASS with 0 errors**; 20 pre-existing warnings remain in UI/test code outside this refactor.
- Prettier (`format:check`): **PASS** for all configured JS/JSX/TS/TSX/JSON files.
- Jest (`npm test -- --runInBand`): **PASS**, 24 suites / 169 tests, ~231 s. This includes all 10 central-client cases in `services/http/__tests__/apiClient.test.ts` — notably `uses exactly one refresh request for three parallel 401 responses`, `clears and emits session expiration once when shared refresh fails`, and `does not enter a refresh loop when the single retry is still 401` — plus the Items, Radar, Notifications, Found Report, and Return service regressions.
- Expo config resolution with `.env.dev`: **PASS** (exit 0).
- Expo Doctor: **KNOWN**, 16/18 checks pass, no BLOCKER. The two non-blocking checks report (1) New Architecture/no-metadata warnings for `@react-native-ml-kit/barcode-scanning` and `react-native-vector-icons`, and (2) Expo SDK package version drift (minor/patch). No SDK/RN or scanner-engine upgrade was made outside scope.
- `git diff --check`: **PASS** (exit 0; only informational LF→CRLF notices).

**Config-guard note:** `expo config` / `expo-doctor` must be run with `ENVFILE=.env.dev`. With the default `.env` (which currently sets `ENV=development` **and** a remote `code.run` `API_URL` without `ALLOW_REMOTE_DEV_API=true`), the `app.config.js` development-host guard throws by design, so a bare `npx expo-doctor` / `npx expo start` exits non-zero at config resolution. This is a `.env` inconsistency, not a code defect; it was left unchanged because correcting the default requires an owner decision (point `.env` at the LAN host, or explicitly acknowledge the remote dev backend). The guard itself is working as intended.

## K. Backend Connectivity (2026-09-27)

- Remote backend (default `.env` `API_URL`, `https://p01--be-app-lost-found-qr--gnw8wlv2lzqz.code.run`): **UP**. `GET /` → `200 {"success":true,"message":"API is running"}`. The app's health signal is the API root; there is no separate `/health` route (`/health`, `/api/health` → 404). Auth base is `/api/auth`, refresh is `POST /api/auth/refresh`.
- LAN development backend (`.env.dev` `API_URL`, `http://192.168.10.102:3000`): **DOWN / unreachable** from the host (connection failed on `/`, `/health`, `/api/health`). No backend source exists in this mobile repo to start; it runs on a separate machine on the LAN. The physical device is on the same subnet (device IP `192.168.10.101/24`, gateway `192.168.10.1`, SSID "Phong Ngu T3 5G"), so once a host serves `:3000` on `192.168.10.102` the device can reach it.

## L. Android Runtime Smoke (2026-09-27)

**PARTIAL — the required authenticated runtime sequence was not executed.**

- Device connected: **CPH2591**, Android 15, WiFi validated (`192.168.10.101`). App package `com.lostfound.app` is installed.
- The installed build is an **Expo dev-client** (`expo-dev-client`). Launching it opens `expo.modules.devlauncher.launcher.DevLauncherActivity`, i.e. the dev launcher — the React Native JS bundle (and therefore Firebase init, `AuthContext`, and all REST calls) does **not** execute until the client connects to a running Metro dev server. No Metro server was running and no dev URL was selected, so no JS-level logs (React/Firebase/auth) were produced.
- Consequently **login, Home REST data, My Items, Item Detail, and logout/login could not be exercised**, and the **runtime** refresh-success / parallel-401 / refresh-failure behaviors could not be observed on-device. These remain proven at the unit level only (§J, §E).

Executing this sequence requires, together: (1) the development backend reachable by the device (start `:3000` on `192.168.10.102`, or repoint `.env`/`.env.dev`), (2) a Metro dev server the device connects to, and (3) valid test-account credentials for login and the authenticated screens. None were available in this environment.

## M. Firebase FIS_AUTH_ERROR Investigation (2026-09-27)

Investigated per the acceptance checklist; findings are evidence-based, not inferred:

- **Package name** — consistent everywhere: `com.lostfound.app` in `app.config.js`, `google-services.json`, `android/app/build.gradle` (`applicationId`), and the installed APK.
- **google-services.json project consistency** — project `lost-and-found-98cdd`, sender/`project_number` `798465121325`, `mobilesdk_app_id` `1:798465121325:android:0ec9605e93a98d73a5eca4`. The exact same values are baked into the installed APK (`google_app_id`, `google_api_key`, `gcm_defaultSenderId`, `project_id` read back from the on-device `base.apk`), so the running app is not on a stale config.
- **SHA-1 / SHA-256** — the installed `base.apk` is signed (v2) with SHA-1 `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`, which is **exactly** the `certificate_hash` registered for the Android OAuth client in `google-services.json`. (SHA-256 `fac61745…033b9c`.) Release builds sign with the project `android/app/debug.keystore`, whose fingerprint matches. No SHA mismatch.
- **Firebase Android registration + API-key restriction** — a live `POST https://firebaseinstallations.googleapis.com/v1/projects/798465121325/installations` using the google-services API key `AIzaSyBaEWUeCU…` with the app's `X-Android-Package` / `X-Android-Cert` headers returned **HTTP 200** with a valid installation + auth token. This proves the Firebase Installations API is enabled, the app is registered, and the key's restrictions **permit** FIS for this package+SHA-1. No API-key restriction needed to be loosened (checklist item: restrictions were **not** removed).
- **Device clock** — accurate (within seconds of host), so no time-skew FIS failure.

**Conclusion:** the current committed Firebase configuration is internally consistent and FIS registration succeeds against it. The previously reported `FIS_AUTH_ERROR` was not reproduced and shows no config-level root cause; it was most plausibly transient (captured during the earlier run that also had no backend/connectivity) or a stale on-device Installations cache from an older build. Recommended runtime confirmation (owner): clear app data / reinstall the dev-client, connect to Metro, and confirm `FirebaseInstallations.getId()` succeeds. A native rebuild is only warranted if `google-services.json` is changed — it currently matches the installed build, so no rebuild is required for this reason.

## N. Telegram Bot Token (checklist item 15)

The legacy client Telegram logger was already removed from source in Phase 2 (`services/telegram/*` deleted; no `[Tt]elegram` reference remains in any `.ts/.tsx/.js`). However the orphaned `EXPO_PUBLIC_TELEGRAM_BOT_TOKEN` (and `_CHAT_ID`, `_TEST_ON_LAUNCH`) were still present in the local `.env` and `.env.dev`. Because `EXPO_PUBLIC_*` values are inlined into the JS bundle at build time, that bot token was shipped in earlier builds.

- Action taken: removed those three lines from `.env` and `.env.dev` (both are git-ignored and were **not** committed; `git grep`/`git log -S` confirm the token is absent from tracked files and history). No new token was added (checklist item 15).
- **Owner action required:** revoke/rotate the exposed bot token in Telegram **@BotFather** (`/revoke` or `/token`). This cannot be done from the codebase — only the bot owner can. Client error reporting remains Sentry-only.

## O. Deferred Phase 3 Issues

**QR Resolver / ownership inference: DEFERRED TO PHASE 3.** The scanner's `isOwnItem = !isOpenChat` inference remains unchanged by instruction. No QR payload or scanner routing was changed (checklist items 1–2).

QR/finder flow, scanner routing, guest sessions, real chat, Return Session redesign, payment, Radar background lifecycle, and Expo/RN upgrades were not started.

## Conclusion

MOBILE PHASE 2: **PARTIAL** (final runtime acceptance not completed).

Verified in this pass: TypeScript, ESLint, Prettier, Jest (24/169, incl. 10/10 central-client and the parallel-401 / refresh-failure / no-loop cases), Expo Doctor (16/18, no blocker with `.env.dev`), `git diff --check`, remote backend reachability, and an evidence-based Firebase review showing the current config is consistent and FIS registration succeeds (§M). The exposed Telegram token was stripped from local env files (§N).

Still open (each needs a resource unavailable in this environment):

1. **Login / My Items / Item Detail / logout-login runtime** — needs the dev backend reachable by the device **and** valid test-account credentials. The installed build is a dev-client, so it also needs a Metro server to run the JS at all.
2. **Refresh success / parallel-401 queue / refresh-failure at runtime on device** — needs a live authenticated session (proven at unit level only).
3. **Firebase `FIS_AUTH_ERROR` runtime re-confirmation** — config is healthy (§M); confirm on-device after clearing app data + connecting to Metro. No Console change or rebuild is warranted by the current config.
4. **Telegram token revocation** — owner action in @BotFather.

No commit and no push were made (checklist items 16–17).

## Final Runtime Acceptance

Attempted 2026-09-27. The on-device authenticated runtime sequence **could not be executed**: the three prerequisites (a connected Android device, a reachable dev backend, and a development test account) were all absent in this environment. Evidence for each blocker is recorded below.

- **Device:** OPPO CPH2591 — **NOT CONNECTED.** `adb devices -l` returns an empty list even after `adb kill-server && adb start-server` and `adb reconnect`. The device that was USB-attached in the earlier session (§L) is no longer present; a physical USB re-connect (with USB-debugging authorization) or a `adb connect <ip>:<port>` pairing is required, neither of which can be initiated from this environment.
- **Android:** 15 (recorded from the prior session; the device is not attached now to re-confirm).
- **Backend URL:** `.env.dev` → `http://192.168.10.102:3000` (chosen LAN dev target). Default `.env` → remote `https://p01--be-app-lost-found-qr--gnw8wlv2lzqz.code.run` (dev-host guard blocks this under `ENV=development` unless `ALLOW_REMOTE_DEV_API=true`, which was **not** set).
- **Backend port:** 3000 — **NOT LISTENING.** `Test-NetConnection 192.168.10.102:3000` = `False` (TCP connect failed). The Windows host's own Wi-Fi IP **is** `192.168.10.102`, so the LAN dev backend is expected to run on this machine, but nothing is bound to `:3000`, and no lost-found backend source exists in this repo or was locatable on this machine to start it.
- **ENVFILE:** `.env.dev` (the explicit development configuration; the dev-host guard was **not** disabled and `ALLOW_REMOTE_DEV_API` was **not** set — checklist item 4).
- **Metro:** **NOT STARTED.** With no device able to connect, starting a Metro dev server cannot cause any on-device JS to execute, so it would prove nothing about the runtime (checklist item 5: "Do not confuse opening DevLauncherActivity with the app JS actually running"). No JS-level runtime was observed.
- **Test account:** **NOT AVAILABLE.** Per checklist item 7 ("If test credentials are not available: stop and report that exact blocker. Do not invent credentials."), no credentials were fabricated or hardcoded.

| Gate                                            | Result      | Note                                                                                                                                                                                             |
| ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login                                           | **BLOCKED** | needs device + dev backend + test account (none available)                                                                                                                                       |
| Home REST                                       | **BLOCKED** | depends on Login                                                                                                                                                                                 |
| My Items                                        | **BLOCKED** | depends on Login                                                                                                                                                                                 |
| Item Detail (incl. 404 → ApiError → ErrorState) | **BLOCKED** | depends on Login                                                                                                                                                                                 |
| Logout / Login again                            | **BLOCKED** | depends on Login                                                                                                                                                                                 |
| Refresh success (runtime)                       | **BLOCKED** | proven at unit level only (§E, §J)                                                                                                                                                               |
| Parallel 401 (runtime)                          | **BLOCKED** | **Refresh requests observed: N/A.** Unit test `uses exactly one refresh request for three parallel 401 responses` proves count = 1 (§E, §J)                                                      |
| Refresh failure (runtime)                       | **BLOCKED** | unit test `clears and emits session expiration once when shared refresh fails` + `does not enter a refresh loop when the single retry is still 401` prove single clear/emit and no loop (§E, §J) |
| Firebase FIS (runtime)                          | **BLOCKED** | config proven healthy and live FIS API returns HTTP 200 (§M); on-device re-confirmation still needs a device + Metro                                                                             |

## Final Validation

Re-run 2026-09-27 (post-attempt):

- **TypeScript:** **PASS** (`npm run type-check` / `tsc --noEmit`, exit 0).
- **ESLint:** **PASS** — 0 errors, 20 pre-existing warnings (unused vars / `require()` imports in UI/test code, outside this refactor).
- **Prettier:** **PASS** (`npm run format:check` — "All matched files use Prettier code style!").
- **Jest:** **PASS** — 24 suites / 169 tests (`npm test -- --runInBand`, exit 0), including all 10 central-client cases in `services/http/__tests__/apiClient.test.ts`.
- **Expo Doctor** (`ENVFILE=.env.dev npx expo-doctor`): **16/18, no BLOCKER** — 2 non-blocking checks: (1) native/New-Architecture metadata warnings and (2) SDK minor/patch version drift (3 minor: `@sentry/react-native`, `@shopify/flash-list`, `react-native-keyboard-controller`; 13 patch). No SDK/RN or scanner upgrade made (checklist items 17–18: "Do not upgrade Expo/RN just to reach 18/18").
- **git diff --check:** **PASS** (exit 0; only informational LF→CRLF notices).
- **Telegram secrets:** clean — no `EXPO_PUBLIC_TELEGRAM_BOT_TOKEN` / `_CHAT_ID` / `_TEST_ON_LAUNCH` assignment remains in `.env`, `.env.dev`, `.env.example`, or `services/` (only explanatory comments). Owner must still revoke the previously-shipped token in @BotFather (§N).

### Verdict

**MOBILE PHASE 2: PARTIAL.** All static/offline gates pass, but the required physical-Android runtime gates (checklist item 20: "physical Android JS runtime actually executed") could not run. Exact blockers, any one of which is disqualifying:

1. **No Android device connected** — `adb devices` empty after server restart/reconnect; needs a physical USB re-connect + USB-debugging authorization (or wireless `adb connect`).
2. **No dev backend reachable** — `192.168.10.102:3000` not listening; needs the lost-found backend started and bound to `0.0.0.0:3000` on this host (backend source not present in this repo).
3. **No development test account** — required for Login and every authenticated gate; not provided, and not to be invented (checklist item 7).

No commit and no push were made. Phase 3 was not started.
