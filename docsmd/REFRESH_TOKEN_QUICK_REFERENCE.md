# Refresh Token - Quick Reference

Quick reference untuk developer yang menggunakan sistem refresh token.

---

## 🚀 Quick Start

### 1. Login
```typescript
const { login } = useAuth()
await login('user@example.com', 'password123')
```

**What happens automatically:**
- ✅ Tokens disimpan di localStorage
- ✅ Auth state ter-update
- ✅ Auto-refresh di-schedule

### 2. Make API Request
```typescript
const { $apiFetch } = useNuxtApp()
const data = await $apiFetch('/api/data')
```

**What happens automatically:**
- ✅ Authorization header ditambah
- ✅ Jika 401, auto-refresh & retry
- ✅ Token included di semua requests

### 3. Logout
```typescript
const { logout } = useAuth()
await logout()
```

**What happens automatically:**
- ✅ Tokens dihapus dari localStorage
- ✅ Auth state cleared
- ✅ Auto-refresh stopped
- ✅ Redirect ke home

---

## 📋 API Reference

### useAuth() Composable

#### State Properties
```typescript
const { 
  authState,           // { isAuthenticated, user, token }
  isAuthenticated,     // computed: boolean
  user,                // computed: User | null
  userRole,            // computed: UserRole
  isAdmin              // computed: boolean
} = useAuth()

// Usage
if (isAuthenticated.value) {
  console.log(user.value.name)
}
```

#### Methods
```typescript
const {
  login,              // (email, password) => Promise<User>
  logout,             // () => Promise<void>
  register,           // (data) => Promise<User>
  updateProfile,      // (data) => Promise<User>
  changePassword,     // (data) => Promise<{ message }>
  hasRole,            // (roles) => boolean
  refreshAccessToken, // () => Promise<string | null>
  setupTokenRefresh   // () => void
} = useAuth()
```

#### Examples
```typescript
// Check if authenticated
if (!isAuthenticated.value) {
  await navigateTo('/login')
}

// Check if admin
if (isAdmin.value) {
  // show admin panel
}

// Check specific role
if (hasRole(['admin_cabang', 'admin_pusat'])) {
  // show management panel
}

// Get user data
console.log(user.value?.email)
console.log(user.value?.role)
```

---

## 🔐 Token Management

### Token Storage (localStorage)

| Key | Format | Example |
|-----|--------|---------|
| `auth_token` | JWT string | `eyJhbGc...` |
| `auth_refresh_token` | JWT string | `eyJhbGc...` |
| `auth_expires_at` | timestamp (ms) | `1234567890` |
| `auth_user` | JSON | `{"id":"123","name":"..."}` |

### Token Info Decode (Browser Console)
```javascript
// Decode JWT
function decodeJWT(token) {
  const parts = token.split('.')
  const payload = atob(parts[1])
  return JSON.parse(payload)
}

// Check token
const token = localStorage.getItem('auth_token')
console.log(decodeJWT(token))

// Check expiry
const expiresAt = parseInt(localStorage.getItem('auth_expires_at'))
const remaining = expiresAt - Date.now()
console.log(`Expires in ${Math.round(remaining / 1000)} seconds`)
```

### Check Token Status
```javascript
// In browser console
function checkAuth() {
  const token = localStorage.getItem('auth_token')
  const refreshToken = localStorage.getItem('auth_refresh_token')
  const expiresAt = localStorage.getItem('auth_expires_at')
  const user = localStorage.getItem('auth_user')
  
  return {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    remaining: expiresAt ? Math.round((parseInt(expiresAt) - Date.now()) / 1000) + 's' : null,
    user: user ? JSON.parse(user).email : null
  }
}

checkAuth()
```

---

## 🔄 Auto-Refresh Flow

### How It Works
1. **On Login:** Calculate expiry time
2. **Schedule Refresh:** Refresh 1 min before expiry
3. **On Refresh Time:** Call `/auth/refresh` endpoint
4. **Update Tokens:** Store new tokens
5. **Re-schedule:** Next refresh timer

### Console Logs
```javascript
// Login
[Auth] Token refresh dijadwalkan dalam 840 detik

// Auto-refresh triggered
[Auth] Token akan segera expired, melakukan refresh...
[Auth] Token berhasil di-refresh

// Next schedule
[Auth] Token refresh dijadwalkan dalam 840 detik
```

### Manual Refresh (If Needed)
```typescript
const { refreshAccessToken } = useAuth()
const newToken = await refreshAccessToken()
console.log('New token:', newToken)
```

---

## ❌ 401 Handling

### What Happens on 401
```
Request made with expired token
  ↓
Backend returns 401
  ↓
Plugin automatically:
  1. Detect 401 response
  2. Call /auth/refresh
  3. Get new token
  4. Retry request
  5. Return response
  ↓
Your code gets response (no error!)
```

### Why No Error?
- 401 handled & retried transparently
- User doesn't notice
- Component code unaffected

### Force 401 for Testing
```javascript
// Make token invalid
localStorage.setItem('auth_token', 'invalid-token-123')

// Next API request will:
// 1. Get 401 response
// 2. Auto-refresh
// 3. Retry with new token
// 4. Work normally
```

---

## 📱 Session Persistence

### Across Page Refresh
```
User logged in
  ↓
Refresh page (F5)
  ↓
App loads
  ↓
useAuth() initializes from localStorage
  ↓
User still logged in (no login required)
  ↓
Auto-refresh re-scheduled
```

### Across Tab Closure & Reopen
```
Tab 1: User logged in
  ↓
Close Tab 1
  ↓
Open new Tab
  ↓
localStorage still has tokens
  ↓
User still logged in
```

### Multiple Tabs Sync
```
Tab 1: Login
  ↓
localStorage updated
  ↓
Tab 2: Detects storage change
  ↓
Tab 2: Auto-initializes auth
  ↓
Both tabs synced
```

---

## 🛡️ Security Tips

### ✅ DO
- ✅ Use HTTPS (tokens in localStorage exposed to XSS)
- ✅ Keep access token short-lived (15-30 min)
- ✅ Keep refresh token long-lived (7-30 days)
- ✅ Rotate refresh token on each refresh
- ✅ Logout on security events (suspicious activity)
- ✅ Implement CSRF protection

### ❌ DON'T
- ❌ Don't store tokens in cookies without HttpOnly flag
- ❌ Don't expose token in URL/query params
- ❌ Don't log full tokens in production
- ❌ Don't hardcode secrets in frontend
- ❌ Don't send tokens to untrusted domains (check CORS)
- ❌ Don't reuse refresh token after logout

### Future: HttpOnly Cookies
```javascript
// When backend supports it, use HttpOnly cookies:
// - More secure (JS can't access)
// - Automatic with requests
// - Protect against XSS
```

---

## 🔧 Backend Integration Checklist

### Required Endpoints

**POST /auth/login**
```json
Request: { email, password }
Response: {
  success: true,
  data: {
    user: { id, name, email, role },
    access_token: "...",
    refresh_token: "...",
    expires_in: 900
  }
}
```

**POST /auth/refresh**
```json
Request: { refresh_token: "..." }
Response: {
  success: true,
  data: {
    access_token: "...",
    refresh_token: "...", // optional
    expires_in: 900
  }
}
```

**POST /auth/logout**
```json
Request: (with Authorization header)
Response: { success: true }
```

**Protected Endpoints**
```json
GET /api/any
+ Header: Authorization: Bearer {token}

Response 401: When token expired/invalid
Response 200: When token valid
```

### Optional Features

**Token Rotation**
- Issue new refresh_token on every refresh
- Revoke old refresh_token

**Token Blacklist**
- Track refresh tokens in database
- Check validity on refresh
- Revoke on logout

**Session Tracking**
- Store active sessions per user
- Allow "logout all devices"
- Track last activity

---

## 🐛 Debugging

### Enable Verbose Logging
```javascript
// In browser console:
localStorage.setItem('debug_auth', 'true')

// In useAuth.ts, add conditional logging:
if (localStorage.getItem('debug_auth')) {
  console.log('[Auth Debug] ...message...')
}
```

### Check Auth State
```javascript
// In browser console:
const auth = useAuth()
console.log('State:', auth.authState.value)
console.log('Authenticated:', auth.isAuthenticated.value)
console.log('User:', auth.user.value)
```

### Monitor Auto-Refresh
```javascript
// Keep console open during testing
// Look for these messages:

// After login:
[Auth] Token refresh dijadwalkan dalam X detik

// Before expiry:
[Auth] Token akan segera expired, melakukan refresh...
[Auth] Token berhasil di-refresh

// New schedule:
[Auth] Token refresh dijadwalkan dalam X detik
```

### Test 401 Handling
```javascript
// 1. Make token invalid
localStorage.setItem('auth_token', 'invalid')

// 2. Make API request
const result = await $fetch('/api/data')

// 3. Observe in DevTools:
// Network: POST /auth/refresh (auto)
// Network: GET /api/data (retry)
// Result: Data returned (no error)
```

### Check localStorage
```javascript
// In browser console:
Object.keys(localStorage)
  .filter(k => k.startsWith('auth_'))
  .forEach(k => console.log(k, '=', localStorage.getItem(k)))
```

---

## ⚡ Performance Optimization

### Token Refresh Timing
- **Current:** Refresh 1 min before expired
- **Customize:** Edit `setupTokenRefresh()` const

```typescript
const refreshBeforeExpiry = 60 * 1000  // Change this (in ms)
```

### Reduce Network Requests
```typescript
// Don't call refreshAccessToken manually if auto-refresh handles it
// Only manual refresh if:
// - User explicitly requested
// - Special security event
// - Testing scenario
```

### Monitor Request Count
```javascript
// In DevTools Network tab, count requests:
// Per 15 min: ~1 /auth/refresh request
// Impact: Minimal

// Vs. without refresh token system:
// Session would die after 15 min
```

---

## 🚨 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Token not saved | login() not called | Check login form submission |
| Auto-refresh not triggered | setupTokenRefresh() skipped | Check login() calls setupTokenRefresh() |
| 401 not auto-retried | Plugin interceptor disabled | Check api-fetch.client.ts onResponseError |
| Session lost on refresh | localStorage cleared | Check browser privacy settings |
| Multiple refresh calls | Lock mechanism broken | Check isRefreshing flag |
| Logout not redirected | navigateTo() failed | Check logout() calls navigateTo('/') |

---

## 📖 More Documentation

- **Full Details:** See `REFRESH_TOKEN_IMPLEMENTATION.md`
- **Architecture:** See `REFRESH_TOKEN_ARCHITECTURE.md`
- **Testing Guide:** See `REFRESH_TOKEN_TESTING_GUIDE.md`
- **Backend Example:** See `BACKEND_REFRESH_TOKEN_EXAMPLE.md`

---

## 💡 Tips & Tricks

### Tip 1: Always Use useAuth() in setup()
```typescript
// ✅ Correct
export default defineComponent({
  setup() {
    const { isAuthenticated } = useAuth()
    return { isAuthenticated }
  }
})

// ❌ Wrong (composable used outside setup)
const auth = useAuth()
export default defineComponent({...})
```

### Tip 2: Check isAuthenticated Before Protected Pages
```typescript
if (!isAuthenticated.value) {
  await navigateTo('/login')
}
```

### Tip 3: Use readonly() for State
```typescript
// Prevent accidental mutations
const authState = readonly(authState.value)
```

### Tip 4: Handle logout in Protected Routes
```typescript
// middleware/protected.ts
export default defineRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
```

### Tip 5: Test with Mock Backend
```bash
# Use provided mock-backend.js for quick testing
node mock-backend.js
# Then point frontend to http://localhost:3001
```

---

## 🎯 Development Workflow

### Day 1: Setup
- [ ] Read REFRESH_TOKEN_IMPLEMENTATION.md
- [ ] Verify frontend code changes
- [ ] Test login works

### Day 2: Integration
- [ ] Implement backend endpoints
- [ ] Test login/refresh/logout
- [ ] Test 401 handling

### Day 3: Testing
- [ ] Run all test scenarios
- [ ] Check console logs
- [ ] Monitor Network tab

### Day 4: Deploy
- [ ] Enable HTTPS
- [ ] Check environment variables
- [ ] Test in production
- [ ] Monitor error logs

---

## 📞 Support

### Check These First
1. Console errors (`F12 > Console`)
2. Network tab (`F12 > Network`)
3. localStorage data (`F12 > Application > Storage`)
4. Documentation links above

### Debug Information to Share
```javascript
// Run in console to get debug info:
{
  auth: useAuth().authState.value,
  localStorage: Object.keys(localStorage)
    .filter(k => k.startsWith('auth_'))
    .reduce((a, k) => ({...a, [k]: localStorage.getItem(k)}), {}),
  timestamp: new Date().toISOString()
}
```

---

## ✨ Summary

**What's Implemented:**
- ✅ Login with token storage
- ✅ Auto-refresh before expiry
- ✅ Handle 401 with auto-retry
- ✅ Concurrent request lock
- ✅ Session persistence
- ✅ Secure logout
- ✅ Multiple tab sync

**What to Do Next:**
1. Implement backend endpoints (login, refresh, logout)
2. Test with mock backend
3. Integrate with real backend
4. Deploy to production
5. Monitor & optimize

**Questions?**
Check the documentation or test with provided examples!
