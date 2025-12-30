# Refresh Token Architecture Overview

Dokumentasi arsitektur sistem refresh token yang sudah diimplementasikan.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Nuxt 3)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────┐  ┌──────────────────┐                   │
│  │   Login Page      │  │  useAuth()       │                   │
│  │   (app/pages/    │  │  Composable       │                   │
│  │    login.vue)    │  │                  │                   │
│  └────────┬──────────┘  └────────┬─────────┘                   │
│           │                      │                             │
│           │ email/password       │ manage auth state           │
│           │                      │                             │
│           └──────────┬───────────┘                             │
│                      │                                         │
│           ┌──────────▼────────────┐                            │
│           │   API Plugin          │                            │
│           │ (api-fetch.client.ts) │                            │
│           │                       │                            │
│           │ - onRequest hook      │                            │
│           │ - onResponseError     │                            │
│           │   hook                │                            │
│           └──────────┬────────────┘                            │
│                      │                                         │
│           ┌──────────▼────────────┐                            │
│           │  localStorage         │                            │
│           │  - auth_token         │                            │
│           │  - auth_refresh_token │                            │
│           │  - auth_expires_at    │                            │
│           │  - auth_user          │                            │
│           └──────────┬────────────┘                            │
│                      │                                         │
│                      │                                         │
└──────────────────────┼─────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend API                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌───────────────────┐                   │
│  │  POST /auth/     │  │ POST /auth/       │                   │
│  │  login           │  │ refresh           │                   │
│  │  - email         │  │ - refresh_token   │                   │
│  │  - password      │  │                   │                   │
│  │                  │  │ Response:         │                   │
│  │ Response:        │  │ - access_token    │                   │
│  │ - access_token   │  │ - refresh_token   │                   │
│  │ - refresh_token  │  │ - expires_in      │                   │
│  │ - expires_in     │  └───────────────────┘                   │
│  │ - user           │                                          │
│  └──────────────────┘  ┌───────────────────┐                   │
│                        │ POST /auth/logout │                   │
│  ┌──────────────────┐  │ - (with token)    │                   │
│  │ Protected        │  │                   │                   │
│  │ Endpoints        │  │ Response: success │                   │
│  │ (any /api/...)   │  └───────────────────┘                   │
│  │                  │                                          │
│  │ Return 401 jika  │                                          │
│  │ token invalid    │                                          │
│  └──────────────────┘                                          │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ Database         │                                          │
│  │ (optional)       │                                          │
│  │ - RefreshTokens  │                                          │
│  │ - Users          │                                          │
│  └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

### 1. Auth State (In Memory)

```typescript
authState = {
  isAuthenticated: boolean
  user: User | null
  token: string | null  // access token
}
```

**Persistence:** Synced dengan localStorage

### 2. Token State (In Memory)

```typescript
tokenState = {
  refreshToken: string | null
  expiresAt: number | null        // timestamp dalam ms
  refreshTimeout: NodeJS.Timeout | null
}
```

**Persistence:** Refresh token & expiry di localStorage, timeout hanya di memory

### 3. localStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `auth_token` | access_token (JWT) | Bearer token untuk API requests |
| `auth_refresh_token` | refresh_token (JWT) | Untuk refresh access token |
| `auth_expires_at` | timestamp (ms) | Kapan access token expired |
| `auth_user` | JSON string | User profile data |

---

## Token Lifecycle

### Phase 1: Login

```
User submit login form
  ↓
POST /auth/login { email, password }
  ↓
Backend verify credentials & generate tokens
  ↓
Response { access_token, refresh_token, expires_in, user }
  ↓
Frontend saveTokens():
  - authState.token = access_token
  - tokenState.refreshToken = refresh_token
  - tokenState.expiresAt = now + (expires_in * 1000)
  - localStorage set 4 items
  ↓
setupTokenRefresh() schedule auto-refresh
  ↓
✅ User authenticated
```

**Timeline:**
- T=0: Login
- T=0: setupTokenRefresh() schedule refresh di T=14min (900-60)
- T=0: User dapat membuat requests

### Phase 2: Auto-Refresh (Before Expiry)

```
T=14min: Auto-refresh timeout trigger
  ↓
console.log('[Auth] Token akan segera expired...')
  ↓
refreshAccessToken():
  POST /auth/refresh { refresh_token }
  ↓
Backend verify refresh token & issue new access token
  ↓
Response { access_token, refresh_token (maybe), expires_in }
  ↓
Frontend updateTokens():
  - authState.token = new access_token
  - tokenState.refreshToken = new refresh_token (if provided)
  - tokenState.expiresAt = now + (expires_in * 1000)
  - localStorage update
  ↓
console.log('[Auth] Token berhasil di-refresh')
  ↓
setupTokenRefresh() schedule next refresh
  ↓
T=14min-1ms to T=29min: User dengan token baru
```

**Timeline:**
- T=0: Login, expires_in=900s
- T=14min: setupTokenRefresh() trigger (900-60)
- T=14min: POST /auth/refresh
- T=14min+: New token active
- T=29min: Next refresh trigger
- ...cycle continues

### Phase 3: On-Demand Refresh (401 Response)

```
User membuat API request dengan access_token
  ↓
  [Skenario A: Token masih valid]
  GET /api/data + Bearer {valid_token}
    ↓
  ✅ Response 200, data returned
  
  [Skenario B: Token sudah expired]
  GET /api/data + Bearer {expired_token}
    ↓
  ❌ Response 401 Unauthorized
    ↓
  Plugin onResponseError() detect 401
    ↓
  Check: isRefreshing?
    - Jika ya: queue request, wait for refresh
    - Jika tidak: start refresh
    ↓
  refreshAccessToken():
    POST /auth/refresh { refresh_token }
      ↓
    Backend verify & issue new token
      ↓
    Response 200 { access_token, ... }
      ↓
    Update authState.token = new_token
    ↓
  Retry original request:
    GET /api/data + Bearer {new_token}
      ↓
    ✅ Response 200, data returned
```

### Phase 4: Logout

```
User click logout atau refresh token expired
  ↓
logout():
  - Clear refreshTimeout
  - POST /auth/logout (with current token)
  ↓
Clear auth state:
  - authState = { isAuthenticated: false, user: null, token: null }
  - tokenState = { refreshToken: null, expiresAt: null, refreshTimeout: null }
  ↓
Clear localStorage:
  - Remove auth_token
  - Remove auth_refresh_token
  - Remove auth_expires_at
  - Remove auth_user
  ↓
navigateTo('/')
  ↓
✅ User logged out
```

---

## Request Flow with Token Handling

### Normal Request (Token Valid)

```
┌─────────────────────────────────────────────────────┐
│ 1. Component/Page calls: await $fetch('/api/data')  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 2. API Plugin onRequest() hook                      │
│    - Get token from authState                       │
│    - Add header: Authorization: Bearer {token}      │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 3. HTTP GET /api/data                              │
│    + Authorization: Bearer eyJhbGc...              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 4. Backend authenticate token                       │
│    ✅ Valid → Process request                       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 5. HTTP Response 200 { data: ... }                  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 6. Return response to component                     │
│    ✅ Success                                        │
└─────────────────────────────────────────────────────┘
```

### Expired Token (Auto-Refresh & Retry)

```
┌─────────────────────────────────────────────────────┐
│ 1. Component calls: await $fetch('/api/data')       │
│    with expired token                              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 2. API Plugin onRequest()                           │
│    - Add header: Authorization: Bearer {expired}   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 3. HTTP GET /api/data                              │
│    + Authorization: Bearer eyJhbGc...              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 4. Backend check token                              │
│    ❌ Expired → Response 401                        │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 5. HTTP Response 401 Unauthorized                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 6. API Plugin onResponseError() hook                │
│    - Detect: response.status === 401                │
│    - Check: !request.url?.includes('/auth/...')    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 7. Auto-Refresh Logic                               │
│    - Check: isRefreshing?                           │
│      → No: Start refresh                            │
│      → Yes: Wait for refresh                        │
│    - Call: refreshAccessToken()                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 8. HTTP POST /auth/refresh                          │
│    + { refresh_token: "..." }                       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 9. Backend verify refresh token                     │
│    ✅ Valid → Issue new access_token                │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 10. HTTP Response 200                               │
│     { access_token: "...", expires_in: 900 }       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 11. Update auth state & localStorage               │
│     - authState.token = new_token                  │
│     - localStorage.auth_token = new_token          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 12. Retry original request                          │
│     HTTP GET /api/data                              │
│     + Authorization: Bearer {new_token}            │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 13. Backend authenticate with new token             │
│     ✅ Valid → Process request                      │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 14. HTTP Response 200 { data: ... }                 │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 15. Return response to component                    │
│     ✅ Success (transparent to component)           │
└─────────────────────────────────────────────────────┘
```

---

## Concurrent Request Handling

### Scenario: 5 Requests Concurrent, All Get 401

```
T=0ms:
  Request 1 → /api/data1 (expired token)
  Request 2 → /api/data2 (expired token)
  Request 3 → /api/data3 (expired token)
  Request 4 → /api/data4 (expired token)
  Request 5 → /api/data5 (expired token)

T=100ms: All return 401
  Request 1 → onResponseError (401)
    - Check: isRefreshing = false ✅ Start refresh
    - Set isRefreshing = true
    - Call refreshAccessToken()
  
  Request 2 → onResponseError (401)
    - Check: isRefreshing = true → WAIT
    - Add to queue (implicit in refreshPromise)
  
  Request 3 → onResponseError (401)
    - Check: isRefreshing = true → WAIT
  
  Request 4 → onResponseError (401)
    - Check: isRefreshing = true → WAIT
  
  Request 5 → onResponseError (401)
    - Check: isRefreshing = true → WAIT

T=200ms: Refresh complete, new token received
  - Set isRefreshing = false
  - Update authState.token
  - Resolve refreshPromise
  
  Request 1 → Retry with new token → 200 ✅
  Request 2 → Retry with new token → 200 ✅
  Request 3 → Retry with new token → 200 ✅
  Request 4 → Retry with new token → 200 ✅
  Request 5 → Retry with new token → 200 ✅

Result:
  ✅ Only 1x refresh called (not 5x)
  ✅ All requests successful
  ✅ Efficient & secure
```

---

## Key Components & Files

### Frontend Files

| File | Purpose | Responsibilities |
|------|---------|------------------|
| `app/composables/useAuth.ts` | Auth logic | Login, logout, token refresh, state management |
| `app/plugins/api-fetch.client.ts` | API interceptor | Auto token, 401 handling, concurrent request lock |
| `app/pages/login.vue` | Login UI | Form submission, error handling |
| localStorage | Token persistence | Store tokens across page reloads |

### Backend Files

| File | Purpose | Responsibilities |
|------|---------|------------------|
| `token.service.js` | Token generation/verification | JWT sign/verify, token rotation |
| `middleware/auth.js` | Auth middleware | Verify token, extract user info |
| `routes/auth.js` | Auth endpoints | Login, refresh, logout |
| Database (optional) | Token tracking | Token blacklist, rotation tracking |

---

## Security Features

### 1. Token Type Verification

```typescript
// JWT payload
{
  userId: "123",
  type: "access",  // ← Type claim
  iat: 1234567890,
  exp: 1234568790
}

// Verify type saat decode
if (decoded.type !== 'access') {
  throw new Error('Invalid token type')
}
```

### 2. Concurrent Request Lock

Mencegah multiple refresh calls:

```typescript
let isRefreshing = false
let refreshPromise: Promise<...> | null = null

if (isRefreshing && refreshPromise) {
  // Wait untuk refresh selesai
  const newToken = await refreshPromise
} else {
  // Start refresh
  isRefreshing = true
  refreshPromise = refreshAccessToken()
}
```

### 3. Expired Token Handling

```typescript
// Auto-refresh 1 menit sebelum expired
const timeUntilExpiry = tokenState.value.expiresAt - now
const delayMs = Math.max(0, timeUntilExpiry - 60000)  // 60s buffer

// Atau handle 401 saat request
if (response.status === 401) {
  // Auto refresh & retry
}
```

### 4. Logout Cleanup

```typescript
// Clear timeout
clearTimeout(tokenState.value.refreshTimeout)

// Clear state
authState.value = { ... reset ... }
tokenState.value = { ... reset ... }

// Clear localStorage
localStorage.removeItem('auth_token')
localStorage.removeItem('auth_refresh_token')
localStorage.removeItem('auth_expires_at')
localStorage.removeItem('auth_user')
```

---

## Performance Optimization

### Memory Usage

- **authState:** ~500 bytes (user object, 2 strings)
- **tokenState:** ~100 bytes (2 strings, 1 timeout reference)
- **localStorage:** ~2-5 KB (all data combined)

**Impact:** Negligible

### Network

- **Login:** 1x request
- **Per token lifetime:** 1x refresh request (vs. 0 before)
- **On 401:** 1x refresh + 1x retry (transparent)

**Impact:** ~1 extra request per 15 minutes = minimal

### CPU

- **Auto-refresh:** Triggered via setTimeout (efficient)
- **Concurrent lock:** In-memory flag (cheap)
- **Token verification:** Standard JWT (fast)

**Impact:** Negligible

---

## Scalability Considerations

### Single Tab

✅ Full functionality
- Auto-refresh works
- 401 handling works
- Session persists

### Multiple Tabs (Same Origin)

✅ Works via localStorage sync
- All tabs use same localStorage
- All tabs read/write same tokens
- One tab refresh = all tabs get new token via `storage` event

**Note:** May need to prevent multiple concurrent refresh from different tabs:

```typescript
// Listen to storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'auth_token') {
    initializeAuthFromStorage()
  }
})
```

### Cross-Origin (Different Domain)

⚠️ localStorage isolated per domain
- Each domain has own auth
- Need SSO if share session across domains

---

## Error Recovery

### Case 1: Refresh Token Expired

```
User → Request with expired access_token
  → 401 response
  → Try refresh with expired refresh_token
  → Refresh endpoint return 401
  → Logout automatically
```

### Case 2: Network Timeout on Refresh

```
User → Request with expired access_token
  → 401 response
  → Try refresh → TIMEOUT
  → Retry logic (optional)
  → Eventually logout
```

### Case 3: Malformed Token

```
User → localStorage corrupted
  → On app load, try parse → ERROR
  → Clear corrupted tokens
  → Logout user
  → Redirect to login
```

### Case 4: Concurrent Refresh Failure

```
Multiple requests → 401
  → First: Start refresh → FAILS
  → Rest: Wait for refresh → Timeout
  → All: Logout
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test token generation
// Test token verification
// Test token refresh logic
// Test concurrent request lock
```

### Integration Tests

```typescript
// Test login flow
// Test auto-refresh trigger
// Test 401 handling
// Test logout cleanup
```

### E2E Tests

```typescript
// Test full login → auto-refresh → request → logout flow
// Test page refresh persistence
// Test multiple tab sync
// Test edge cases (network timeout, invalid token, etc)
```

See `REFRESH_TOKEN_TESTING_GUIDE.md` for detailed testing scenarios.

---

## Future Enhancements

### 1. HttpOnly Cookies (Recommended)

```javascript
// Backend set refresh token via HttpOnly cookie
res.cookie('refresh_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
})

// Frontend automatic send cookie dengan requests
// API plugin tidak perlu extract dari localStorage
```

### 2. Token Rotation

```javascript
// Every refresh issue new refresh token
// Revoke old refresh token
// Detect & block if old refresh token used (potential attack)
```

### 3. Session Management

```javascript
// Track active sessions per user
// Allow logout from all devices
// Track last activity time
```

### 4. Biometric Auth

```typescript
// After successful login, ask user to setup biometric
// Use biometric untuk quick re-auth
// Fallback ke password
```

### 5. Two-Factor Auth

```javascript
// Setup 2FA in user settings
// On login, require 2FA code
// Support backup codes
```

---

## Deployment Checklist

- [ ] Backend `/auth/refresh` endpoint implemented
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Environment variables set (secrets, expiry times)
- [ ] Rate limiting on auth endpoints
- [ ] Logging/monitoring for auth failures
- [ ] Token rotation policy defined
- [ ] Session timeout behavior configured
- [ ] Error messages user-friendly (no token details)
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Team trained

