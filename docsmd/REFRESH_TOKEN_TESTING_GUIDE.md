# Refresh Token Testing Guide

Panduan lengkap untuk test implementasi refresh token di frontend dan backend.

## Setup Testing Environment

### 1. Siapkan Backend Mock (Quick Setup)

Jika belum punya backend asli, gunakan mock server untuk testing:

```javascript
// mock-backend.js (simple Node.js server)
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const SECRET_ACCESS = 'secret-access-key'
const SECRET_REFRESH = 'secret-refresh-key'

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email dan password harus diisi'
    })
  }

  const userId = 'user-' + Date.now()
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    SECRET_ACCESS,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    SECRET_REFRESH,
    { expiresIn: '7d' }
  )

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: userId,
        name: 'Test User',
        email: email,
        role: 'member'
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900  // 15 menit
    }
  })
})

// Refresh endpoint
app.post('/auth/refresh', (req, res) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token diperlukan'
    })
  }

  try {
    const decoded = jwt.verify(refresh_token, SECRET_REFRESH)
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      })
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      SECRET_ACCESS,
      { expiresIn: '15m' }
    )

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, type: 'refresh' },
      SECRET_REFRESH,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 900
      }
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
})

// Protected endpoint (untuk test interceptor)
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token'
    })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, SECRET_ACCESS)
    res.json({
      success: true,
      message: 'Access granted',
      user: decoded
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
})

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

app.listen(3001, () => {
  console.log('Mock backend running on http://localhost:3001')
})
```

Jalankan mock backend:
```bash
node mock-backend.js
```

### 2. Setup Frontend Testing

Pastikan `.env.local` atau `nuxt.config.ts` pointing ke backend:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

atau di `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  public: {
    apiBase: 'http://localhost:3001'
  }
})
```

## Test Scenarios

### Test 1: Basic Login & Token Storage

**Goal:** Verify token disimpan dengan benar di localStorage

**Steps:**
1. Buka aplikasi di browser
2. Navigasi ke `/login`
3. Masukkan email: `test@example.com`, password: `password123`
4. Klik "Masuk"

**Expected Results:**
```javascript
// Di browser console, jalankan:
localStorage.getItem('auth_token')           // ada access token
localStorage.getItem('auth_refresh_token')   // ada refresh token
localStorage.getItem('auth_expires_at')      // ada timestamp
localStorage.getItem('auth_user')            // ada user data

// Parse dan cek:
JSON.parse(localStorage.getItem('auth_user'))
// {
//   id: "user-xxx",
//   name: "Test User",
//   email: "test@example.com",
//   role: "member"
// }

// Cek expiry time masih valid:
new Date(parseInt(localStorage.getItem('auth_expires_at')))
// Should be ~15 menit dari sekarang
```

**Verification:**
- ✅ Toast notification "Berhasil masuk!"
- ✅ Redirect ke `/dashboard`
- ✅ localStorage berisi 4 item: token, refresh_token, expires_at, user

---

### Test 2: Auto-Refresh sebelum Expired

**Goal:** Verify token auto-refresh 1 menit sebelum expired

**Setup:**
- Gunakan mock backend dengan access token expiry: `15s` (short untuk testing)

Update mock-backend.js:
```javascript
app.post('/auth/login', (req, res) => {
  // ... existing code ...
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    SECRET_ACCESS,
    { expiresIn: '15s' }  // 15 detik untuk testing!
  )
  
  // ...
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      // ...
      expires_in: 15  // 15 detik
    }
  })
})

app.post('/auth/refresh', (req, res) => {
  // ...
  res.json({
    success: true,
    data: {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 15  // 15 detik
    }
  })
})
```

**Steps:**
1. Restart mock backend
2. Login ke aplikasi
3. Buka DevTools (F12) > Console
4. Lihat log: `[Auth] Token refresh dijadwalkan dalam X detik`
5. Tunggu sampai X - 60 detik

**Expected Results:**
```
// Console output setelah ~14 detik:
[Auth] Token akan segera expired, melakukan refresh...
[Auth] Token berhasil di-refresh

// Token baru di localStorage:
localStorage.getItem('auth_token') // token baru (berbeda dari sebelumnya)

// Expiry time ter-update:
new Date(parseInt(localStorage.getItem('auth_expires_at')))
// ~15 detik dari refresh time
```

**Verification:**
- ✅ Console menunjukkan refresh messages
- ✅ Token berubah setelah refresh
- ✅ Expiry time ter-update

---

### Test 3: Manual API Request Verification

**Goal:** Verify API request menggunakan token yang benar

**Steps:**
1. Login ke aplikasi
2. Buka DevTools > Network tab
3. Inspect request (cek Authorization header)

**Expected Results:**
```
GET /api/protected HTTP/1.1
Authorization: Bearer eyJhbGc...
```

**Verification:**
- ✅ Header Authorization dengan Bearer token ada
- ✅ Response status 200 (bukan 401)

---

### Test 4: 401 Handling & Auto-Retry

**Goal:** Verify 401 di-handle dengan auto-refresh & retry

**Setup:**
Buat test endpoint khusus di mock-backend:

```javascript
// Counter untuk simulate token expired pada request pertama
let requestCount = 0

app.get('/api/test-401', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token'
    })
  }

  // Simulate: return 401 pada request pertama, 200 di retry
  if (requestCount === 0) {
    requestCount++
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    })
  }

  requestCount = 0
  res.json({
    success: true,
    message: 'Request successful'
  })
})
```

**Steps:**
1. Login ke aplikasi
2. Buka DevTools > Network & Console
3. Buat request ke endpoint test:

```javascript
// Di console:
const result = await $fetch('/api/test-401')
console.log(result)
```

**Expected Results:**
```
Console:
[Auth] Token akan segera expired, melakukan refresh...
[Auth] Token berhasil di-refresh
// Result: { success: true, message: 'Request successful' }

Network tab:
- POST /auth/refresh (triggered otomatis)
- GET /api/test-401 (pertama, return 401)
- GET /api/test-401 (retry, return 200)
```

**Verification:**
- ✅ Tidak ada error, request berhasil
- ✅ Auto-refresh dipicu
- ✅ Retry automatic dengan token baru

---

### Test 5: Multiple Concurrent Requests dengan 401

**Goal:** Verify multiple concurrent requests hanya trigger 1x refresh

**Steps:**
1. Login ke aplikasi
2. Buka DevTools > Network & Console
3. Jalankan multiple concurrent requests:

```javascript
// Di console:
Promise.all([
  $fetch('/api/test-401'),
  $fetch('/api/test-401'),
  $fetch('/api/test-401'),
  $fetch('/api/test-401'),
  $fetch('/api/test-401')
])
  .then(results => console.log('All success!', results))
  .catch(err => console.error('Error:', err))
```

**Expected Results:**
```
Network tab:
- 5x GET /api/test-401 (semua return 401)
- 1x POST /auth/refresh (hanya sekali!)
- 5x GET /api/test-401 (retry, semua return 200)

Console:
[Auth] Token akan segera expired, melakukan refresh...
[Auth] Token berhasil di-refresh
All success! [...]
```

**Verification:**
- ✅ Hanya 1x refresh call (bukan 5x)
- ✅ Semua request di-retry dengan token baru
- ✅ Lock mechanism bekerja

---

### Test 6: Page Refresh Persistence

**Goal:** Verify session persist setelah page refresh

**Steps:**
1. Login ke aplikasi
2. Check localStorage punya semua token data
3. Refresh page (F5 atau Cmd+R)
4. Lihat apakah masih authenticated

**Expected Results:**
```javascript
// Sebelum refresh:
localStorage.getItem('auth_token')  // ada

// Setelah page refresh:
// Tidak perlu login lagi
// Langsung ke dashboard
// localStorage masih punya semua data

// Console:
[Auth] Token refresh dijadwalkan dalam X detik
```

**Verification:**
- ✅ Tidak perlu login ulang
- ✅ Dashboard langsung ter-load
- ✅ localStorage data intact
- ✅ Auto-refresh schedule terupdate

---

### Test 7: Logout

**Goal:** Verify logout menghapus tokens dan redirect

**Steps:**
1. Login ke aplikasi
2. Klik logout (atau jalankan di console)
3. Verify redirect dan cleanup

**Steps (Console):**
```javascript
const { logout } = useAuth()
await logout()
```

**Expected Results:**
```javascript
// Sebelum logout:
localStorage.getItem('auth_token')           // ada

// Setelah logout:
localStorage.getItem('auth_token')           // null
localStorage.getItem('auth_refresh_token')   // null
localStorage.getItem('auth_expires_at')      // null
localStorage.getItem('auth_user')            // null

// Redirect ke home page (/)
```

**Verification:**
- ✅ Semua token dihapus dari localStorage
- ✅ Auth state cleared
- ✅ Redirect ke home

---

### Test 8: Expired Refresh Token

**Goal:** Verify user logout jika refresh token juga expired

**Setup:**
Modify mock backend untuk return 401 saat refresh:

```javascript
let shouldRefreshFail = false

app.post('/auth/refresh', (req, res) => {
  if (shouldRefreshFail) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token expired'
    })
  }
  
  // ... existing refresh logic ...
})

// Endpoint untuk trigger refresh fail (testing only)
app.post('/test/make-refresh-fail', (req, res) => {
  shouldRefreshFail = true
  res.json({ success: true })
})
```

**Steps:**
1. Login ke aplikasi
2. Trigger fail refresh:
```javascript
await $fetch('http://localhost:3001/test/make-refresh-fail', { 
  method: 'POST' 
})
```
3. Trigger auto-refresh dengan membuat request atau wait
4. Observe logout behavior

**Expected Results:**
```
Console:
[Auth] Token berhasil di-refresh (jika refresh pertama kali masih berhasil)
atau langsung:
[Auth] Refresh token tidak tersedia, logout...

// User di-logout otomatis
// Redirect ke home
// localStorage cleared
```

**Verification:**
- ✅ User otomatis logout jika refresh gagal
- ✅ Session tidak stuck
- ✅ Redirect ke home

---

## Automated Testing (Optional)

### Setup Vitest + Happy DOM

```bash
npm install -D vitest @happy-dom/happy-dom
```

**Test file: `tests/auth.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useAuth } from '@/composables/useAuth'

describe('Auth & Token Refresh', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store tokens in localStorage after login', async () => {
    const { login } = useAuth()
    
    // Mock API response
    vi.mock('@/composables/useAuth', () => ({
      useAuth: () => ({
        login: vi.fn(async () => {
          localStorage.setItem('auth_token', 'test-token')
          localStorage.setItem('auth_refresh_token', 'test-refresh')
          localStorage.setItem('auth_expires_at', Date.now() + 900000)
        })
      })
    }))

    expect(localStorage.getItem('auth_token')).toBe('test-token')
    expect(localStorage.getItem('auth_refresh_token')).toBe('test-refresh')
  })

  it('should setup auto-refresh after login', () => {
    // Test setupTokenRefresh logic
  })

  it('should handle 401 with auto-refresh', () => {
    // Test interceptor logic
  })
})
```

Run tests:
```bash
npm run test
```

---

## Debugging Tips

### 1. Lihat All Console Logs

```javascript
// Enable verbose logging
localStorage.setItem('debug_auth', 'true')

// Di useAuth.ts tambahkan di setupTokenRefresh:
if (localStorage.getItem('debug_auth')) {
  console.log('[Auth Debug] setupTokenRefresh called', {
    refreshToken: tokenState.value.refreshToken,
    expiresAt: tokenState.value.expiresAt,
    delay: delayMs
  })
}
```

### 2. Inspect Token Payload

```javascript
// Di console, decode JWT:
function decodeJWT(token) {
  const parts = token.split('.')
  const decoded = JSON.parse(atob(parts[1]))
  return decoded
}

const token = localStorage.getItem('auth_token')
console.log(decodeJWT(token))
// { userId: "...", type: "access", iat: ..., exp: ... }
```

### 3. Monitor localStorage Changes

```javascript
// Watch localStorage changes
const originalSetItem = localStorage.setItem
localStorage.setItem = function(key, value) {
  console.log(`[LocalStorage] ${key} = ${value.substring(0, 50)}...`)
  return originalSetItem.apply(this, arguments)
}
```

### 4. Network Throttling

DevTools > Network > Throttle untuk simulate slow network:
- Bisa lihat loading state
- Test concurrent request handling
- Verify lock mechanism

### 5. Check Token Expiry

```javascript
// Calculate remaining time
function getRemainingTime() {
  const expiresAt = parseInt(localStorage.getItem('auth_expires_at'))
  const remaining = expiresAt - Date.now()
  return {
    ms: remaining,
    seconds: Math.round(remaining / 1000),
    minutes: Math.round(remaining / 60000)
  }
}

setInterval(() => {
  console.log('Token expires in:', getRemainingTime())
}, 5000)
```

---

## Checklist Verification

- [ ] Login menyimpan token & refresh_token
- [ ] localStorage punya auth_token, auth_refresh_token, auth_expires_at
- [ ] Console menunjukkan auto-refresh schedule
- [ ] Token auto-refresh 1 menit sebelum expired
- [ ] 401 response di-handle dengan refresh & retry
- [ ] Multiple concurrent requests hanya trigger 1x refresh
- [ ] Page refresh tidak logout user
- [ ] Logout membersihkan localStorage
- [ ] Refresh token expired = auto logout
- [ ] Network tab menunjukkan refresh endpoint call
- [ ] Authorization header otomatis ditambah ke requests

---

## Performance Considerations

Monitor di DevTools:

1. **Memory:** localStorage ~2-5KB, reasonable
2. **CPU:** Auto-refresh hanya jalankan 1x per token lifetime
3. **Network:** 1x refresh per 15 menit (vs. 0 before implementation)
4. **Battery:** Minimal impact, setTimeout vs. interval

Optimize:
- Jangan trigger refresh 2x untuk 2 concurrent expired tokens
- Cleanup setTimeout saat logout
- Don't retry refresh jika sudah gagal berkali-kali

---

## Production Checklist

- [ ] Backend `/auth/refresh` endpoint implemented
- [ ] Token expiry timing reasonable (15-30 min access, 7d refresh)
- [ ] HTTPS enabled (secure cookies, secure headers)
- [ ] CORS properly configured
- [ ] Error handling & logging in place
- [ ] Rate limiting untuk `/auth/refresh` endpoint
- [ ] Token rotation strategy decided (optional but recommended)
- [ ] Refresh token blacklist/revocation (if token rotation)
- [ ] Session timeout behavior defined
- [ ] User testing completed

---

## Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Token tidak auto-refresh | setupTokenRefresh() tidak dipanggil | Check login() call setupTokenRefresh() |
| Infinite 401 loop | Refresh endpoint return 401 | Check refresh endpoint credentials |
| localStorage kosong setelah login | localStorage.setItem() tidak dipanggil | Check login() save tokens |
| Multiple refresh calls | Lock mechanism tidak work | Verify isRefreshing flag |
| Session lost after refresh | initializeAuthFromStorage() tidak setup | Call useAuth() di app root |
| Token tidak di-include di request | onRequest() tidak set Authorization | Check plugin interceptor |
| 401 tidak auto-retry | onResponseError() tidak dipanggil | Verify $fetch interceptor |

