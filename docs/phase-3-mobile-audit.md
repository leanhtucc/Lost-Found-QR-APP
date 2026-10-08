# LOST & FOUND QR — PHASE 3 MOBILE PRODUCT FLOW AUDIT

**Audit Date:** 2026-10-05  
**Scope:** Mobile Product Flow & Architectural Audit (Phase 3 Mobile)  
**Status:** COMPLETE (Audit-only; no implementation code modified)  
**Target Environment:** Expo SDK 54 / React Native 0.81.5 (Fabric / New Architecture) / React 19.1 / Central API Client

---

## Executive Summary

Phase 1 & Phase 2 established a solid foundation: the Central API Client handles token rotation and concurrency flawlessly, the Design System is uniform, and Return Flow / Verification (Handover) logic exhibits sophisticated state-machine modeling.

However, the **core Finder journey and Chat interaction are severely blocked or non-functional**:
1. **Critical Scanner Routing Bug:** The QR scanner unconditionally routes finders into the Owner's `ItemDetails` screen rather than `PublicItemDetails`.
2. **Unsafe Ownership Inference:** `isOwnItem = !isOpenChat` treats any SAFE item as owned by the finder.
3. **Guest Lockout:** Unauthenticated users are barred by navigation guards from accessing the scanner, public item view, or reporting found items.
4. **Mocked Chat Engine:** The Chat screen uses hardcoded static mock messages with simulated local timeouts; no real-time message transport exists.

Implementation **CANNOT** proceed as a quick patch. It requires a targeted, phased remediation following the roadmap documented herein.

---

## A. Current QR Flow

### 1. Actual Trace
```
Scanner (screens/scan/index.tsx)
  ↳ Camera (useQRScanner.ts) / Gallery (useImageQRScanner.ts) / Manual (ManualInputModal)
  ↳ processRawValue (useScanProcessor.ts)
  ↳ normalizeScanPayload (screens/scan/utils/scanPayload.ts)
  ↳ itemsApi.scanQR(itemId) (services/items/api.ts) -> GET /api/scan/:itemId
  ↳ toScanResult (useScanProcessor.ts)
  ↳ handleScanSuccess (screens/scan/index.tsx)
  ↳ Navigation Router
```

### 2. Detailed Technical Audit
- **QR Formats Accepted:**
  - Raw alphanumeric identifiers containing `[a-zA-Z0-9_-]` (length: 1–128 characters).
  - Deep links: `lostfound://item/<id>` and `lostfoundqr://item/<id>`.
  - Approved HTTPS URLs matching `lostfound.app`, `www.lostfound.app`, `app.lostfound.vn`, `www.app.lostfound.vn`, `findback.vn`, `www.findback.vn` with path `/item/<id>`.
- **Malformed & Invalid QR Handling:**
  - Dangerous URL schemes (`javascript:`, `data:`, `file:`, `blob:`) are rejected immediately by `normalizeScanPayload`.
  - Unrecognized domains or invalid URI schemes fail normalization and show localized error banner in `ScannerError`.
  - Manual input enforces a 500-character ceiling (`MAX_INPUT_LENGTH`).
- **Loading & Concurrency State:**
  - `processingRef.current` lock prevents concurrent API calls.
  - Tracking frame animates (`status = 'tracking'`) when bounds are detected.
  - Spinner displayed during `status = 'processing'`.
- **Duplicate Scan Protection:**
  - `DEDUPE_WINDOW_MS = 2000` ms window suppresses identical payloads.
- **Network Failure & Error Surfacing:**
  - On network / 5xx error, `fetchScanData` catches the exception and sets generic message: `"Không thể kiểm tra mã lúc này."`
  - **Defect:** Discards backend `ApiError` code (e.g. `QR_DISABLED`, `ITEM_NOT_FOUND`, `RATE_LIMITED`).
- **Location Payload:**
  - `itemsApi.scanQR(itemId, params)` supports `current_lat` and `current_lng`, but `useScanProcessor.ts` never passes user coordinates to `itemsApi.scanQR(itemId)`.
- **Item Status & Routing Decisions:**
  - Backend response `ScanItemResponse` has two shapes:
    - Safe (`action: 'info_only'`): `item_info` only.
    - Lost (`action: 'open_chat'`): `item_info` + `channelId`.
  - **Major Routing Flaw (`screens/scan/index.tsx:78`):**
    - If `action === 'open_chat'` and `channelId` present: navigates to `Chat`.
    - If `action === 'info_only'`: navigates to `ItemDetails` (Owner screen) instead of `PublicItemDetails`!
  - **Major Ownership Flaw (`useScanProcessor.ts:66`):**
    - Computes `isOwnItem: !isOpenChat`.
    - If a stranger scans a SAFE item (`isOpenChat === false`), `isOwnItem` evaluates to `true`, treating the finder as the owner!

---

## B. Current Finder Flow

| Capability | Current State | Evidence & Architectural Cause |
|---|---|---|
| **Scan without login** | **BLOCKED** | `navigation/index.tsx:224-235` forces navigation reset to `Login` if `!isAuthenticated`. `Scan` is omitted from `AUTH_ROUTE_NAMES`. `itemsApi.scanQR` also uses `auth: 'required'`. |
| **View public item** | **PARTIAL** | Authenticated users can view via Home Radar feed (`PublicItemDetailsScreen`), but scanning a QR routes to Owner `ItemDetailsScreen` (which errors or leaks). Unauthenticated users cannot view at all. |
| **Report found (QR item)** | **BLOCKED** | No flow exists to file a report against a scanned QR item if chat is unavailable. |
| **Report found (non-QR)** | **WORKING** | Authenticated users can submit via `ManualFoundReportScreen` with photo, Gemini AI classification, and map coordinates. |
| **Continue as guest** | **BLOCKED** | Backend contract `POST /api/scan/guest-init` is implemented in `itemsApi.initGuestScanSession`, but the mobile UI has **zero** intake screen, prompt, or local guest session store. |
| **Guest-to-Auth transition**| **NON-EXISTENT**| No handoff mechanism exists to migrate anonymous scan sessions or guest chat tokens to an authenticated profile upon registration/login. |

**Stop Point:** The unauthenticated finder journey terminates before opening the camera. Authenticated finders scanning SAFE items terminate on a broken owner screen.

---

## C. Current Item Detail Flow

### 1. Owner Item Detail (`screens/item-detail/index.tsx`)
- **Access Control:** Authenticated owner via `itemsApi.getItemById(itemId)`.
- **Private Data Exposed to Owner:** Full name, description, registered safe-point address, exact GPS coordinates with map preview, internal item ID, and QR code vector.
- **State Actions:**
  - **SAFE:** Lost Mode toggle is OFF. Toggling prompts for GPS permissions, gets coordinates via `expo-location`, reverse geocodes, and calls `PATCH /v1/items/:id/status` with `LOST`.
  - **LOST:** Lost Mode toggle is ON. Allows updating `lostMessage` or toggling back to `SAFE`.
  - **FOUND:** Toggle disabled (`item.status !== 'SAFE' && item.status !== 'LOST'`).
  - **RESOLVED:** Toggle disabled.
  - **Chat Button:** Statically alerts `"Tính năng chat đang được phát triển"`.

### 2. Public Finder Item Detail (`screens/public-item-detail/index.tsx`)
- **Access Control:** Public GET `/api/items/public/:id` (`auth: 'none'`).
- **Privacy Enforcement:** **PASS.** Safe storage coordinates and private addresses are stripped. Only displays public image, name, category, lost notice, approximate lost address, and masked owner display name.
- **Action:** `"Tôi đã nhặt được món đồ này"` executes `createChannel(itemId, finderId)`:
  - Fails if `finderId` is missing (`Alert.alert('Cần đăng nhập')`).
  - Calls `POST /api/stream/channels/:itemId/:finderId` with authenticated token.

---

## D. Current Found Report Flow

### 1. Manual Found Report (`screens/manual-found-report/index.tsx`)
- **Form & Input Validation:**
  - Name (required, max 100 characters).
  - Category selector (`CategorySelector`).
  - Description (optional, max 500 characters).
  - Image (required; camera or media library via `expo-image-picker`).
  - Location (required; validated finite latitude `[-90, 90]` and longitude `[-180, 180]`).
- **AI Assist:** Auto-calls Gemini Vision via `itemsApi.analyzeItemImage(uri)` (POST `/v1/ai/analyze-item`), prefilling name, category, and uploading image.
- **Map & Geocoding:**
  - Integrated `MapPickerModal` with Google Places autocomplete (`mapApi.autocomplete`).
  - GPS acquisition via `expo-location`.
  - Reverse geocoding via `mapApi.reverseGeocode` with native fallback.
- **Image Upload:** Handled via `uploadApi.uploadImage` (POST `/api/upload`) if not pre-analyzed.
- **Submission & Concurrency:**
  - `submitInFlightRef.current` lock prevents double submissions.
  - Idempotency key generated with `Crypto.randomUUID()`.
  - Dispatches to `foundReportsApi.create` (POST `/api/found-reports`).
- **Success & Navigation:** Success alert navigates to Home tab; revision counter increments to trigger feed reload.

### 2. Claim & Verification (`screens/found-report-detail/index.tsx`)
- Allows owner to inspect claims (`foundReportsApi.getClaims`) and accept/reject them (`foundReportsApi.reviewClaim`).
- Non-owners submit proof of ownership (minimum 10 characters) via `foundReportsApi.createClaim`.
- Accepting a claim transitions owner to `Chat`.

---

## E. Current Chat Flow

### 1. Service Layer (`services/chat/api.ts`)
- `createChannel(itemId, finderId)`: `POST /api/stream/channels/:itemId/:finderId`.
- `getInbox()`: `GET /api/stream/channels`.
- `closeChannel(channelId)`: `PUT /api/stream/channels/:channelId/close`.
- `getChannelById(channelId)`: `GET /api/stream/channels/:channelId`.

### 2. Screen & Messaging (`screens/chat/detail/index.tsx`)
- **CRITICAL GAP:** Chat messaging is **100% mocked**!
  - `INITIAL_MESSAGES` hardcoded lines 34–75 with pre-scripted dialogues.
  - `handleSend` appends message to local React state (`messages`).
  - `setTimeout(..., 1800)` fakes incoming responses from partner.
  - No WebSocket, no Stream Chat client, no backend REST message persistence.
  - Media attachment and emoji buttons show `"Tính năng đang được phát triển"`.
- **Return Session Integration:**
  - Chat screen hosts `ReturnProgressCard` and `MeetupModal`.
  - Correctly binds `useReturnSession({ channelId })` to drive the return flow state machine.

---

## F. Current Return Flow

### 1. State Machine & Architecture
- Service: `services/returns/api.ts` driving `/v1/returns`.
- Zustand Store: `services/returns/store.ts` with `subscribeWithSelector`.
- Lifecycle States:
  `CHAT_ACTIVE` → `MEETUP_PROPOSED` → `MEETUP_ACCEPTED` → `TRACKING_ACTIVE` → `HANDOVER_PENDING` → `HANDOVER_CONFIRMED` → `REWARD_RELEASING` → `REWARD_PAID` → `RATING_PENDING` → `COMPLETED`.
  Dispute states: `HANDOVER_DISPUTED`, `CANCELLED`.
- Concurrency: Uses `If-Match` headers with `serverRevision`. Detects `REVISION_CONFLICT` and triggers resync.

### 2. Live Tracking & Location Permissions
- Screen: `screens/return-flow/live-map/index.tsx` using Google Maps Dark style.
- Hook: `useLiveTracking.ts`:
  - Request foreground permission only (`Location.requestForegroundPermissionsAsync`).
  - Active tracking via `Location.watchPositionAsync` (accuracy: High, distanceInterval: 10m, timeInterval: 5000ms).
  - Emits coordinates through dedicated WebSocket `returnSocketManager.emitLocation(sessionId, location)`.
  - **No background location tracking** (strictly adheres to policy).
- Proximity detection: Calculates geodesic distance between owner, finder, and meetup marker.

### 3. Cleanup & Disconnection
- `returnSocketManager.disconnect()` cleans up WebSocket rooms on unmount/logout.
- `returnApi.stopTracking` invalidates active Redis cache.

---

## G. Current Verification Flow (Handover & PIN)

### 1. Protocol Architecture
- Endpoint: `POST /v1/returns/:id/handover/init` generates 6-digit CSPRNG token with 5-minute TTL and max 5 attempts.
- Verification: `POST /v1/returns/:id/handover/confirm`.

### 2. Screen: `screens/return-flow/handover-confirm/index.tsx`
- **Finder Experience:**
  - Automatically initializes handover on mount (`initHandover()`).
  - Renders 6-digit code in high-contrast typography and vector QR code (`react-native-qrcode-svg`).
  - Provides `"Lấy mã mới"` refresh button.
  - Mandatory checklist confirmation: `"Tôi đã trao tận tay món đồ nguyên vẹn cho chủ sở hữu"`.
- **Owner Experience:**
  - 3-point mandatory verification checklist:
    1. *"Đúng món đồ của tôi"*
    2. *"Tình trạng còn nguyên vẹn"*
    3. *"Đã nhận trực tiếp từ người nhặt"*
  - 6-digit numeric input with keyboard type `number-pad`.
- **Backend Error Handling:**
  - `INVALID_HANDOVER_CODE`: Localized alert.
  - `HANDOVER_CODE_LOCKED`: Alerts locked state after 5 attempts.
  - `HANDOVER_CODE_EXPIRED`: Alerts TTL expiration.
- **Rating & Completion:**
  - Verification routes to `RewardStatusScreen` (showing escrow status/breakdown).
  - Owner navigates to `RateFinderScreen`, selecting 1–5 stars and tags.
  - `submitRating` marks session `COMPLETED` and transitions item to `RESOLVED`.

---

## H. Network Layer Audit

1. **Central API Client Compliance:**
   - All REST modules (`items`, `reports`, `returns`, `chat`, `auth`, `upload`, `map`, `radar`, `notifications`) route via `services/http/apiClient.ts`.
   - Zero occurrences of `axios` or unmanaged `fetch` in services.
2. **Identified Transport Defects:**
   - **Redundant Headers:** Services manually declare `'Content-Type': 'application/json'` in custom wrappers, duplicating the central client's automatic header injection.
   - **Inconsistent Error Propagation:**
     - `chat/api.ts` parses errors as `new Error(\`HTTP \${response.status}\`)`, dropping server error codes.
     - `items/api.ts` throws custom `ItemsApiError` rather than standardized `ApiError`.
     - `returns/api.ts` implements custom `handleResponse` creating untyped Error objects.
   - **Residual Dev Mocks:** `services/returns/api.ts` retains an inactive mock branch (`USE_MOCK_FALLBACK = __DEV__ && false`) and 100+ lines of in-memory mock fixtures.

---

## I. Acceptance Flows Compliance Matrix

| Flow | Name | Verdict | Gaps & Failure Points |
|---|---|---|---|
| **FLOW A** | Owner: Login → Item → Lost Mode | **PASS** | Fully functional. GPS capture, reverse geocoding, status toggle, and Radar broadcast operate end-to-end. |
| **FLOW B** | Finder: Scan → Resolver → Public Item | **FAIL** | 1. Scanner routes finder to Owner `ItemDetails`.<br>2. `isOwnItem = !isOpenChat` causes false ownership.<br>3. Unauthenticated scanning blocked by navigation guard.<br>4. Scanner doesn't send GPS coordinates. |
| **FLOW C** | Finder: Report Found | **PARTIAL** | Non-QR manual flow (`ManualFoundReport`) passes. QR-linked found reporting is completely missing. |
| **FLOW D** | Owner ↔ Finder: Chat | **FAIL** | Messaging engine is simulated with static in-memory mocks (`INITIAL_MESSAGES`). No real backend transport exists. |
| **FLOW E** | Owner + Finder: Return Session | **PASS** | State machine, meetup proposal, WebSocket live tracking, and arrival notification are correctly architected. |
| **FLOW F** | Verification: → RESOLVED | **PASS** | Handover PIN generation, 3-point checklist, code submission, payout receipt, rating, and resolution operate correctly. |

---

## J. Findings by Severity (P0 / P1 / P2)

### P0 (Blockers — Critical Functional / Security Failures)
1. **P0-1: Scanner Routes to Owner Screen**  
   `screens/scan/index.tsx:78` routes finders to `ItemDetails` instead of `PublicItemDetails`.
2. **P0-2: Inverted Ownership Inference**  
   `screens/scan/hooks/useScanProcessor.ts:66` derives `isOwnItem: !isOpenChat`, treating strangers scanning SAFE items as owners.
3. **P0-3: Total Guest Lockout in Navigation**  
   `navigation/index.tsx:224-235` redirects any unauthenticated route to `Login`, preventing anonymous finders from scanning or viewing public items.
4. **P0-4: Scanner Rejects Unauthenticated Scans**  
   `services/items/api.ts:scanQR` uses `auth: 'required'`, causing 401 when guests scan.
5. **P0-5: Chat Messages are Fake Mocks**  
   `screens/chat/detail/index.tsx:34-75` uses static strings and local `setTimeout` instead of live backend messaging.

### P1 (High Severity — Incomplete Flows & Gaps)
1. **P1-1: Missing Guest Intake UI**  
   Backend endpoint `POST /api/scan/guest-init` has no mobile counterpart (no phone entry modal or guest token storage).
2. **P1-2: Broken Item Deep Links**  
   `navigation/index.tsx:121` routes deep links to `ItemDetails` (protected owner route) rather than `PublicItemDetails`.
3. **P1-3: QR Scanner Missing Geolocation**  
   `useScanProcessor.ts` fails to query or pass GPS coordinates (`currentLat`, `currentLng`) to `itemsApi.scanQR`.
4. **P1-4: Chat API Name Hardcoding**  
   `services/chat/api.ts:95` returns `'Món đồ'` hardcoded for channel item names.
5. **P1-5: QR Item Found Report Missing**  
   If a scanned item is not LOST, finders have no UI to submit a "Found Report" linked to that `qrCodeId`.

### P2 (Medium / Low Severity — Tech Debt & Polish)
1. **P2-1: Dead Mock Code in Returns API**  
   `services/returns/api.ts` contains `inMemorySessions` and mock generators that should be excised.
2. **P2-2: Inconsistent Error Objects**  
   Services throw ad-hoc Errors instead of standard `ApiError` instances.
3. **P2-3: Redundant Content-Type Declarations**  
   Feature services duplicate header assignment handled by `apiClient`.
4. **P2-4: Disconnected Item Security PIN**  
   The static 4-digit `securityPin` on `Item` is decoupled from the dynamic 6-digit handover code.

---

## K. Security & Privacy Assessment

1. **Private Data Exposure Risk:**  
   Because the scanner routes finders to `ItemDetailsScreen`, if the backend allows non-owners to fetch `GET /api/items/:id`, the finder will see the owner's home/safe-point map and registered coordinates. If the backend denies with 403, the finder hits a crash/error screen.
2. **Zero-Trust Handover Compliance:**  
   The Return Flow correctly enforces zero-trust identity: the backend derives roles from the Bearer token and rejects unauthorized state transitions.
3. **Location Privacy:**  
   Location sharing is restricted to foreground active sessions with explicit opt-in and WebSocket room scoping (`return:join`). No background location leak exists.
4. **Secrets Sanitization:**  
   Verified zero client-side Telegram bot tokens or hardcoded backend keys in the application bundle.

---

## L. Recommended Implementation Order

```
┌────────────────────────────────────────────────────────┐
│ Phase 3.1: Navigation & Guest Access Architecture      │
│ - Add Scan, PublicItemDetails to unauthenticated stack │
│ - Update deep linking to route to PublicItemDetails    │
│ - Configure apiClient auth: 'optional' on scanQR       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 3.2: QR Resolver & Routing Remediation           │
│ - Replace isOwnItem = !isOpenChat with backend claims  │
│ - Route finders to PublicItemDetails                   │
│ - Route authenticated owners to ItemDetails            │
│ - Pass GPS coordinates during scan                     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 3.3: Guest Intake Flow                           │
│ - Implement Phone Number entry modal for guest finders │
│ - Connect to POST /api/scan/guest-init                 │
│ - Persist guest token in storage                       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 3.4: Real Chat Messaging Integration             │
│ - Replace mock INITIAL_MESSAGES with live transport    │
│ - Connect WebSocket / REST channel message history     │
│ - Integrate send message API                           │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Phase 3.5: Return Flow Cleanups & Regression Tests     │
│ - Remove dead mock branches in returns/api.ts          │
│ - Comprehensive unit tests for useScanProcessor        │
│ - End-to-end integration tests for Flows A through F   │
└────────────────────────────────────────────────────────┘
```

---

## M. Required Test Suite Additions

1. **`useScanProcessor.test.ts`:**
   - Verifies finder is routed to `PublicItemDetails`.
   - Verifies owner is routed to `ItemDetails`.
   - Verifies GPS coordinates are passed when permission granted.
   - Tests error handling for `QR_DISABLED` and `ITEM_NOT_FOUND`.
2. **`navigation.test.ts`:**
   - Unauthenticated deep link `lostfound://item/xyz` resolves to `PublicItemDetails`.
   - Unauthenticated user can launch `Scan` screen without redirection to `Login`.
3. **`chat.test.ts`:**
   - Channel creation with verified participant IDs.
   - Message transmission and receipt without mock fallbacks.
4. **`returnsHandover.test.ts`:**
   - Full 6-digit PIN submission, 5-attempt lockout, and TTL expiry.

---

## N. Deferred Work

- Radar background push notification integration (Phase 4).
- Radar UI redesign / interactive animations (Phase 4).
- Native SDK upgrades (React Native 0.82 / Expo SDK 55).
- In-app payment checkout flow (deferred to escrow release phase).

---

## Audit Verdict

```
============================================================
PHASE 3 MOBILE AUDIT: COMPLETE
Implementation Ready: NO — SPECIFICATION & ARCHITECTURAL SIGN-OFF REQUIRED
============================================================
```

**Conclusion:**  
Mobile Phase 3 implementation should **NOT** start until the navigation changes (allowing guest access to Scanner and Public Item Details) and the real Chat transport contract are reviewed and approved. Once aligned on Phase 3.1–3.5, execution can commence safely without risking regression.
