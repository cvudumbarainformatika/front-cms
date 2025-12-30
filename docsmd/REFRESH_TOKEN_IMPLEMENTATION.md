# Implementasi Refresh Token

## Overview

Sistem refresh token telah diimplementasikan untuk mengelola session yang lebih aman dan otomatis. Token access akan di-refresh secara otomatis sebelum expired, dan jika token expired saat digunakan, sistem akan otomatis me-refresh dan retry request.

## Fitur Utama

### 1. **Penyimpanan Token di LocalStorage**

Saat login, semua data token disimpan di localStorage:

```typescript
// Data yang disimpan:
localStorage.setItem('auth_token', accessToken)           // Access token
localStorage.setItem('auth_refresh_token', refreshToken)  // Refresh token
localStorage.setItem('auth_expires_at', expiresAt)        // Waktu expired (timestamp ms)
localStorage.setItem('auth_user', JSON.stringify(user))   // Data user
```

### 2. **Response Format Login dari Backend**

Backend harus return response dengan format berikut:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user data */ },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900  // dalam detik (15 menit)
  }
}
```

### 3. **Auto-Refresh Token**

Sistem akan otomatis refresh token **1 menit sebelum expired** untuk menghindari expired saat sedang digunakan.

**Alur:**
- Saat login, `setupTokenRefresh()` di-trigger
- Hitung waktu hingga token expired
- Jika sudah expired, langsung refresh
- Jika belum, schedule refresh 1 menit sebelum expired
- Saat refresh tiba, panggil endpoint `/auth/refresh` dengan refresh token

### 4. **Handle 401 Unauthorized (Token Expired Saat Digunakan)**

Jika user membuat request dan mendapat 401 response:

1. Plugin `api-fetch.client.ts` mendeteksi response 401
2. Otomatis call `refreshAccessToken()`
3. Jika berhasil, retry request dengan token baru
4. Jika gagal, logout user

**Multiple Concurrent Requests:**
Jika ada multiple requests yang tiba dengan 401 bersamaan, sistem akan:
- Request pertama mulai refresh
- Request lain tunggu hasil refresh pertama
- Semua request di-retry dengan token baru

### 5. **Persistent Session**

Saat page di-refresh atau reopened:
- `initializeAuthFromStorage()` membaca data dari localStorage
- Jika token dan refresh token ada, restore auth state
- Setup auto-refresh dengan timing yang benar

## Implementasi Detail

### File: `app/composables/useAuth.ts`

**Token State:**
```typescript
const tokenState = useState<{
  refreshToken: string | null
  expiresAt: number | null
  refreshTimeout: NodeJS.Timeout | null
}>('token', ...)
```

**Fungsi Utama:**

1. **`setupTokenRefresh()`**
   - Hitung waktu hingga token expired
   - Schedule auto-refresh 1 menit sebelum expired
   - Clear timeout sebelumnya jika ada

2. **`refreshAccessToken()`**
   - Call endpoint `/auth/refresh` dengan refresh token
   - Update access token dan refresh token baru di state & localStorage
   - Update expiry time
   - Setup refresh berikutnya

3. **`login()`**
   - Extract access_token, refresh_token, expires_in dari response
   - Simpan ke localStorage
   - Setup auto-refresh

4. **`logout()`**
   - Clear auto-refresh timeout
   - Clear semua token dari state dan localStorage
   - Call logout endpoint ke backend

### File: `app/plugins/api-fetch.client.ts`

**onResponseError Interceptor:**

Menangani 401 response dengan:
- Deteksi refresh token untuk menghindari infinite loop
- Lock mechanism dengan `isRefreshing` flag
- Queue multiple requests dan tunggu refresh selesai
- Retry request dengan token baru
- Logout jika refresh gagal

## Backend API Requirements

### 1. Endpoint: `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "member"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 900
  }
}
```

### 2. Endpoint: `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..." (optional, jika rotating refresh token),
    "expires_in": 900
  }
}
```

### 3. Endpoint: `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Alur Umum

### Scenario 1: Fresh Login
```
User Login
    ↓
Call /auth/login
    ↓
Get access_token, refresh_token, expires_in
    ↓
Simpan ke localStorage
    ↓
Setup auto-refresh (30 menit - 1 menit = dalam 29 menit)
    ↓
User dapat membuat requests dengan access_token
```

### Scenario 2: Auto-Refresh Sebelum Expired
```
Token running (15 menit)
    ↓
[After 14 menit] Auto-refresh trigger
    ↓
Call /auth/refresh dengan refresh_token
    ↓
Get new access_token, new refresh_token
    ↓
Update localStorage & state
    ↓
Setup auto-refresh berikutnya (15 menit lagi)
    ↓
User masih bisa bekerja tanpa notice
```

### Scenario 3: Token Expired Saat Digunakan (401)
```
User membuat API request dengan expired access_token
    ↓
Backend return 401
    ↓
Plugin detect 401
    ↓
Call /auth/refresh (if not already refreshing)
    ↓
Get new access_token
    ↓
Retry request dengan token baru
    ↓
Request berhasil
```

### Scenario 4: Page Refresh
```
User refresh page
    ↓
initializeAuthFromStorage() dipanggil
    ↓
Baca auth_token, auth_refresh_token, auth_expires_at dari localStorage
    ↓
Restore auth state
    ↓
Setup auto-refresh dengan timing yang benar
    ↓
Session berlanjut tanpa logout
```

## Testing

### Test 1: Login & Auto-Refresh
```typescript
// 1. Login
await login('user@example.com', 'password123')

// 2. Lihat di console: "[Auth] Token refresh dijadwalkan dalam X detik"
// Token akan auto-refresh sebelum expired

// 3. Tunggu sampai refresh time, check console untuk:
// "[Auth] Token akan segera expired, melakukan refresh..."
// "[Auth] Token berhasil di-refresh"
```

### Test 2: Manual Refresh (Developer Tool)
```javascript
// Di browser console:
// Lihat localStorage
JSON.parse(localStorage.getItem('auth_expires_at'))

// Jika token sudah mau expired, buat request
// akan auto trigger refresh
```

### Test 3: Page Refresh Persistence
```
1. Login
2. Buka DevTools > Network
3. Refresh page (F5)
4. Check apakah tidak ada login request (session restored dari localStorage)
5. Lihat console "[Auth] Token refresh dijadwalkan dalam X detik"
```

### Test 4: Concurrent Requests dengan 401
```typescript
// Simulate dengan mengubah token di localStorage menjadi invalid
// Buat multiple API requests bersamaan
// Lihat apakah semua di-retry dengan token baru

// Di console harusnya hanya melihat 1x refresh call, bukan 5x untuk 5 requests
```

## Security Considerations

1. **HttpOnly Cookies (Recommended Future)**
   - Saat ini menggunakan localStorage (bisa diakses JavaScript)
   - Untuk production lebih aman gunakan HttpOnly cookies
   - Tidak terpengaruh XSS (hanya server bisa baca)

2. **Refresh Token Rotation**
   - Backend bisa issue refresh token baru setiap refresh
   - Lama refresh token bisa lebih lama (days/weeks)
   - Access token shorter-lived (15-30 minutes)

3. **CSRF Protection**
   - Jika pakai cookies, pastikan CSRF token di-handle

4. **Token Storage**
   - Jangan hardcode token di source code
   - Hapus dari localStorage saat logout (sudah implemented)

## Troubleshooting

### Token tidak auto-refresh
- Check console untuk error messages
- Lihat apakah `setupTokenRefresh()` di-call
- Lihat localStorage untuk `auth_expires_at`

### Infinite loop 401
- Check apakah refresh endpoint return 401
- Pastikan refresh endpoint tidak memerlukan access_token di header
- Check interceptor logic, pastikan skip `/auth/refresh` requests

### Multiple refresh calls
- Normal behavior untuk concurrent requests pertama kali
- Lock mechanism (`isRefreshing`) seharusnya prevent multiple refresh untuk requests berikutnya

### Session tidak restore setelah page refresh
- Check localStorage masih punya token data
- Check browser console error saat initialize
- Pastikan app.vue atau composable call `useAuth()` di mount

## Environment Variables

```env
# .env.example
NUXT_PUBLIC_API_BASE=/backend
```

Pastikan endpoint login dan refresh sesuai dengan backend URL.

## Summary

Token refresh system sudah fully implemented dengan:
✅ Penyimpanan refresh token di localStorage
✅ Auto-refresh 1 menit sebelum expired
✅ Handle 401 dengan automatic refresh & retry
✅ Multiple concurrent request handling
✅ Session persistence across page refresh
✅ Proper cleanup saat logout
✅ Error handling dan fallback

System siap untuk production dengan minimal backend API modifications.
