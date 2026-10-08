# Phase 2 Mobile Architecture

## Central API Client

All backend REST traffic now enters through `services/http/apiClient.ts`. Feature services still own endpoint paths, payload validation, and domain DTO mapping; the client owns cross-cutting transport behavior:

- API base URL resolution.
- Required, optional, or public authentication policy.
- Authorization and JSON headers.
- 15-second default timeout with per-request override.
- Safe JSON parsing.
- Standard `ApiError` normalization.
- Single-flight refresh and one retry of the original request.
- One-shot session-expired cleanup/event signaling.

`apiClient.fetch` preserves the existing `Response`-based service contracts. `apiClient.request<T>` is available for new services that want parsed data and standardized thrown errors. Socket.io, Firebase, and native/Google Maps SDK calls do not use this HTTP client.

### Before inventory

| Module                          | Previous responsibility                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `services/auth/api.ts`          | Built URLs, headers, fetched, parsed errors, stored tokens    |
| `services/items/api.ts`         | Read both tokens, refreshed on 401, retried, cleared session  |
| `services/radar/api.ts`         | Duplicated required and optional-auth refresh implementations |
| `services/notifications/api.ts` | Read tokens, refreshed on 401, retried, cleared session       |
| `services/returns/api.ts`       | Read tokens and implemented its own refresh/retry             |
| `services/reports/found.ts`     | Read tokens and manually attached headers                     |
| `services/reports/api.ts`       | Read token and attached Guardian request headers              |
| `services/chat/api.ts`          | Read token, attached headers, emitted session expiry          |
| `services/moderation/api.ts`    | Read token and attached headers                               |
| `services/map/api.ts`           | Optionally read and attached token for backend map endpoints  |
| `services/upload/index.ts`      | Read token and attached multipart/delete headers              |

The duplicated refresh implementations were removed. Feature-local helper names may remain to minimize churn, but they delegate directly to `apiClient.fetch` and no longer own token/refresh behavior.

## Auth Flow

Public auth endpoints use `auth: 'none'`, so stale stored credentials cannot be attached and their 401 responses never trigger refresh. Authenticated profile/account endpoints use the central client.

`AuthContext` continues to own application auth state and navigation consequences. Its proactive startup/foreground refresh calls `authApi.refreshToken`, which now joins the same `apiClient.refreshSession()` promise as reactive 401 refreshes. The low-level networking layer never imports React or Navigation.

When refresh cannot recover the session, the client clears auth storage and emits `sessionEvents.emitSessionExpired()` exactly once. `AuthContext` receives the event and drives the existing login/session-expired UI.

## Refresh Queue

The module-level `refreshPromise` is the single refresh queue:

1. The first eligible 401 starts `POST /api/auth/refresh` with the stored refresh token.
2. Other eligible 401 requests await that same promise.
3. Success atomically stores the returned access/refresh pair.
4. Every waiter retries its original request with the new access token.
5. Each original request can retry only once. A second 401 expires the session once and is returned/thrown without another refresh.
6. Refresh endpoint/public requests, requests with no session, and `auth: 'none'` requests never refresh.
7. Failure clears storage and emits session expiry once; every waiter rejects.

Backend refresh is stateless and accepts reuse/parallel calls, but the mobile queue deliberately avoids redundant calls and token races.

## ApiError

`services/http/apiError.ts` defines:

```ts
ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  kind: 'validation' | 'unauthorized' | 'forbidden' | 'not_found' |
        'conflict' | 'rate_limit' | 'network' | 'timeout' | 'server' | 'unknown';
  cause?: unknown;
}
```

It reads the backend Phase 2 envelope where the human message remains top-level and the machine code is `error.code`. Validation fields/details are retained without exposing raw server stacks. Network and timeout failures become `NETWORK_ERROR` and `TIMEOUT`.

## Identifier Types

`types/identifiers.ts` supplies lightweight aliases without runtime/branded-type friction:

- `ItemInternalId`: internal `Item.id`; accepted by legacy owner paths, not for display or QR payload.
- `ItemId`: stable public item identity (`itemId`, also returned as `publicItemId`).
- `QRCodeId`: QR lookup identity (`qrCodeId`).
- `FoundReportId`: finder-created found report identity.
- `ReportId`: Guardian `Post` report identity; not interchangeable with `FoundReportId`.
- `ChannelId`: Stream/return interaction handle.
- `ReturnSessionId`: return-session primary identity.
- `DiscoveryItemKey`: feed/navigation key; may contain `found:<FoundReportId>` and is not an Item identifier.

The existing scanner route/payload is unchanged. `Item` and `ReturnSession` types now document the distinct identifiers, and found-report DTOs use the relevant aliases.

## Environment Strategy

- `development`: use `.env.dev`, loopback, Android emulator `10.0.2.2`, or a private LAN address for a physical device.
- `preview`: EAS environment must supply a staging API URL.
- `production`: EAS environment must supply the production API URL; loopback/private LAN targets are rejected.

Development builds reject public remote API hosts unless `ALLOW_REMOTE_DEV_API=true` is deliberately set for a verified remote development backend. There is no hardcoded localhost fallback in the bundle. `.env*` runtime files remain ignored; `.env.example` contains placeholders only.

## Expo Config Strategy

`app.config.js` is the only Expo config source because config depends on the build environment. The obsolete `app.json` was removed, eliminating duplicate or conflicting fields and satisfying Expo's dynamic-config check.

The dynamic config owns name (`FindBack`), slug, scheme, version, package/bundle IDs, plugins, permissions, new architecture, edge-to-edge behavior, and custom-scheme intent filter. Android package and iOS bundle ID remain `com.lostfound.app` to preserve Firebase/signing compatibility. No Universal Links, associated domains, runtime version, or updates policy was introduced in Phase 2.

The npm package metadata was renamed from the unrelated `expertenglish` value to `findback-mobile`. This does not change native application identifiers.

The legacy client-side Telegram bot logger was removed. A bot token is a server secret and must never be embedded through `EXPO_PUBLIC_*` or Expo `extra`; existing Sentry reporting remains the client crash/error channel. Any previously used Telegram bot token must be rotated because earlier builds may already contain it.

## Dependency Decisions

Repository-wide import, config-plugin, native-module, and script searches were performed.

Kept intentionally:

- `react-native-vision-camera`: active camera scanner.
- `rn-qr-generator`: active image-library QR decoding.
- `@react-native-ml-kit/barcode-scanning`: native scanner-related dependency retained until a dedicated native rebuild/removal check; Phase 2 must not replace the scanner engine.
- `lucide-react-native`, `zustand`, Firebase packages, Maps, Stream/Socket dependencies: actively imported.

Confirmed source-unused candidates include `expo-router`, `framer-motion`, `@shopify/flash-list`, `react-native-vector-icons`, `reactotron-react-native`, `reactotron-redux`, and web-only `lucide-react`. They were not removed without a clean native rebuild/runtime verification; keeping them is lower risk than changing the installed native graph during this architecture refactor. They remain explicit cleanup candidates, not hidden assumptions.

## Deferred Phase 3 Issues

QR Resolver and ownership inference are **DEFERRED TO PHASE 3**. `screens/scan/hooks/useScanProcessor.ts` still computes `isOwnItem = !isOpenChat`; this inference is known to be semantically unsafe but changing it requires the future resolver/scanner contract.

Also deferred: QR payload changes, guest finder redesign, scanner routing rewrite, real chat architecture, Return Session state-machine redesign, payment redesign, and Radar background/socket lifecycle changes.
