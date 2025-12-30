# Backend Implementation Checklist

Checklist untuk backend developer yang akan implement refresh token endpoints.

---

## 🎯 Requirements

### Endpoint 1: POST /auth/login

**Status:** ⬜ Not Started / 🟨 In Progress / ✅ Done

**Requirements:**
- [ ] Endpoint accepts POST request
- [ ] Accept email & password in request body
- [ ] Validate email format
- [ ] Validate password minimum length (6 chars recommended)
- [ ] Query user from database by email
- [ ] Verify password (hash comparison)
- [ ] Handle user not found (401 response)
- [ ] Handle wrong password (401 response)
- [ ] Generate JWT access token
  - [ ] Include userId in payload
  - [ ] Include user role in payload
  - [ ] Add token type claim: `type: 'access'`
  - [ ] Set expiry: 900 seconds (15 minutes)
- [ ] Generate JWT refresh token
  - [ ] Include userId in payload
  - [ ] Add token type claim: `type: 'refresh'`
  - [ ] Set expiry: 604800 seconds (7 days)
- [ ] Return response with structure:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "..."
    },
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 900
  }
}
```
- [ ] Test with valid credentials
- [ ] Test with invalid email
- [ ] Test with wrong password
- [ ] Test with missing fields

**Notes:**
```
- expires_in must be in SECONDS (not milliseconds)
- access_token expiry = 900 (15 min) or configurable
- refresh_token expiry = 604800 (7 days) or configurable
- User object must include at minimum: id, name, email, role
```

---

### Endpoint 2: POST /auth/refresh

**Status:** ⬜ Not Started / 🟨 In Progress / ✅ Done

**Requirements:**
- [ ] Endpoint accepts POST request
- [ ] Accept refresh_token in request body
- [ ] Validate refresh_token exists
- [ ] Verify JWT signature
- [ ] Verify token type is 'refresh'
- [ ] Verify token not expired
- [ ] Optional: Check refresh token in database (if implemented)
- [ ] Optional: Check refresh token not revoked (if implemented)
- [ ] Generate new access token with same userId/role
- [ ] Optional: Generate new refresh token (token rotation)
- [ ] Return response with structure:
```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "..." (optional, if rotating),
    "expires_in": 900
  }
}
```
- [ ] Handle invalid refresh token (401 response)
- [ ] Handle expired refresh token (401 response)
- [ ] Test with valid refresh token
- [ ] Test with invalid refresh token
- [ ] Test with expired refresh token
- [ ] Test concurrent refresh requests

**Notes:**
```
- Don't require Authorization header for refresh endpoint
- Return new refresh_token only if implementing token rotation
- expires_in must be SECONDS
- Both access_token & refresh_token must have valid JWT signature
```

---

### Endpoint 3: POST /auth/logout

**Status:** ⬜ Not Started / 🟨 In Progress / ✅ Done

**Requirements:**
- [ ] Endpoint accepts POST request
- [ ] Require Authorization header with Bearer token
- [ ] Extract token from header
- [ ] Validate token exists
- [ ] Optional: Add refresh token to blacklist
- [ ] Optional: Mark refresh token as revoked in database
- [ ] Return response:
```json
{
  "success": true,
  "message": "Logout successful"
}
```
- [ ] Test with valid token
- [ ] Test with invalid token
- [ ] Test without Authorization header
- [ ] Verify blacklist working (if implemented)

**Notes:**
```
- Logout endpoint can be simple (just validate token & return success)
- Actual cleanup is done on frontend (localStorage clear)
- Optional: Track logout in database for audit
```

---

### Endpoint 4: Protected Endpoint Example

**Status:** ⬜ Not Started / 🟨 In Progress / ✅ Done

Any protected endpoint (e.g., GET /api/profile, GET /api/data, etc)

**Requirements:**
- [ ] Require Authorization header with Bearer token
- [ ] Extract token from header
- [ ] Verify JWT signature
- [ ] Verify token not expired
- [ ] Verify token type is 'access' (not 'refresh')
- [ ] Extract userId from token payload
- [ ] Process request with user context
- [ ] Return 401 for invalid token
- [ ] Return 401 for expired token
- [ ] Return 200 + data for valid token
- [ ] Test with valid token
- [ ] Test with invalid token
- [ ] Test with expired token
- [ ] Test with refresh token (should fail)

**Notes:**
```
- All protected endpoints should follow same pattern
- Use middleware/decorator for token verification
- Return consistent 401 response for all token errors
- Include user info in request context for later use
```

---

## 🔐 Security Checklist

- [ ] Passwords hashed (bcrypt recommended)
- [ ] Passwords never logged or returned
- [ ] Tokens signed dengan secret key
- [ ] Secret keys stored in environment variables
- [ ] No hardcoded secrets
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] Token expiry enforced
- [ ] Optional: Token rotation implemented
- [ ] Optional: Token blacklist implemented
- [ ] Optional: Session tracking implemented
- [ ] Error messages don't leak info (no "user not found")

---

## 🗄️ Database Schema (Example)

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Optional: RefreshTokens Table
```sql
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token TEXT NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_token (token(255))
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Login successful flow
- [ ] Login invalid email
- [ ] Login wrong password
- [ ] Refresh valid token
- [ ] Refresh invalid token
- [ ] Refresh expired token
- [ ] Logout clears token
- [ ] Protected endpoint allows valid token
- [ ] Protected endpoint rejects invalid token
- [ ] Protected endpoint rejects expired token

### Integration Tests
- [ ] Full login → request → logout flow
- [ ] Multiple concurrent refresh requests
- [ ] Token rotation (if implemented)
- [ ] Token blacklist (if implemented)
- [ ] User can't use other user's refresh token
- [ ] Session tracking (if implemented)

### Manual Testing (Postman/cURL)

**Login Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 200 + tokens
```

**Refresh Test:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGc..."
  }'

# Expected: 200 + new access_token
```

**Protected Endpoint Test:**
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer eyJhbGc..."

# Expected: 200 + data
```

**Expired Token Test:**
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer eyJhbGc..." (expired)

# Expected: 401 Unauthorized
```

---

## 📋 Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-secret-access-key-here
JWT_REFRESH_SECRET=your-secret-refresh-key-here

# Token Expiry (in seconds)
ACCESS_TOKEN_EXPIRY=900        # 15 minutes
REFRESH_TOKEN_EXPIRY=604800    # 7 days

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password

# API
API_PORT=3000
API_BASE_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15          # minutes
RATE_LIMIT_MAX_REQUESTS=100   # per window
```

---

## 🚀 Implementation Timeline

### Phase 1: Setup (Day 1)
- [ ] Create JWT token service
- [ ] Create auth middleware
- [ ] Setup password hashing
- [ ] Create users table
- [ ] Setup environment variables

**Estimated:** 2-3 hours

### Phase 2: Endpoints (Day 1-2)
- [ ] Implement POST /auth/login
- [ ] Implement POST /auth/refresh
- [ ] Implement POST /auth/logout
- [ ] Create example protected endpoint
- [ ] Setup error handling

**Estimated:** 3-4 hours

### Phase 3: Testing (Day 2)
- [ ] Unit tests for each function
- [ ] Integration tests for flows
- [ ] Manual testing with Postman
- [ ] Test with frontend

**Estimated:** 2-3 hours

### Phase 4: Security & Polish (Day 3)
- [ ] Add rate limiting
- [ ] Add CORS configuration
- [ ] Add error logging
- [ ] Security review
- [ ] Performance optimization

**Estimated:** 2-3 hours

**Total Estimated Time:** 9-13 hours (1-2 days)

---

## 📝 Code Examples

### Token Service (Node.js/Express)
```javascript
const jwt = require('jsonwebtoken')

class TokenService {
  static generateAccessToken(userId, userRole) {
    return jwt.sign(
      { userId, userRole, type: 'access' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '900s' }
    )
  }

  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    )
  }

  static verifyAccessToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    if (decoded.type !== 'access') throw new Error('Invalid token type')
    return decoded
  }

  static verifyRefreshToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    if (decoded.type !== 'refresh') throw new Error('Invalid token type')
    return decoded
  }
}

module.exports = TokenService
```

### Auth Middleware (Node.js/Express)
```javascript
const TokenService = require('./TokenService')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = TokenService.verifyAccessToken(token)
    
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}

module.exports = authMiddleware
```

### Login Endpoint (Node.js/Express)
```javascript
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('./models/User')
const TokenService = require('./TokenService')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password diperlukan'
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      })
    }

    const accessToken = TokenService.generateAccessToken(user.id, user.role)
    const refreshToken = TokenService.generateRefreshToken(user.id)

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(process.env.ACCESS_TOKEN_EXPIRY) || 900
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
```

See `BACKEND_REFRESH_TOKEN_EXAMPLE.md` untuk implementasi lengkap.

---

## 🔗 Frontend Integration Points

Frontend sudah siap untuk:
- ✅ POST /auth/login - dengan response format yang sudah ditentukan
- ✅ POST /auth/refresh - auto-call untuk refresh token
- ✅ POST /auth/logout - untuk logout
- ✅ Protected endpoints - otomatis include token di header
- ✅ 401 handling - auto-refresh & retry

**Frontend akan bekerja dengan backend tanpa perubahan kode (selama response format sesuai).**

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: expires_in dalam milliseconds
```javascript
// WRONG
expires_in: 900000  // milliseconds

// RIGHT
expires_in: 900     // seconds
```

### ❌ Mistake 2: Menggunakan wrong secret untuk verify
```javascript
// WRONG
jwt.verify(token, process.env.JWT_REFRESH_SECRET)  // untuk access token!

// RIGHT
jwt.verify(token, process.env.JWT_ACCESS_SECRET)   // untuk access token
jwt.verify(token, process.env.JWT_REFRESH_SECRET)  // untuk refresh token
```

### ❌ Mistake 3: Tidak check token type
```javascript
// WRONG
const decoded = jwt.verify(token, secret)
// Could be refresh token pretending to be access token!

// RIGHT
const decoded = jwt.verify(token, secret)
if (decoded.type !== 'access') throw new Error('Invalid token type')
```

### ❌ Mistake 4: Require Authorization di refresh endpoint
```javascript
// WRONG
app.post('/auth/refresh', authMiddleware, (req, res) => {
  // Refresh token in body, tapi require Authorization header
})

// RIGHT
app.post('/auth/refresh', (req, res) => {
  // Refresh token in body only, no Authorization required
})
```

### ❌ Mistake 5: Return password di user object
```javascript
// WRONG
data: {
  user: {
    ...user,
    password_hash: user.password_hash  // Exposed!
  }
}

// RIGHT
data: {
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
    // password_hash tidak included
  }
}
```

---

## ✅ Verification Steps

Setelah implement backend:

1. **Test Login**
   - [ ] POST /auth/login dengan valid credentials
   - [ ] Response 200 dengan access_token & refresh_token
   - [ ] expires_in dalam detik (bukan ms)
   - [ ] Token dapat di-decode (valid JWT)

2. **Test Refresh**
   - [ ] POST /auth/refresh dengan refresh_token
   - [ ] Response 200 dengan new access_token
   - [ ] Old access_token tidak bisa digunakan (if token rotation)

3. **Test Protected Endpoint**
   - [ ] GET /api/profile dengan Authorization header
   - [ ] Response 200 jika token valid
   - [ ] Response 401 jika token expired
   - [ ] Response 401 jika no Authorization header

4. **Test Frontend Integration**
   - [ ] Frontend login berhasil
   - [ ] Auto-refresh works
   - [ ] 401 auto-handled
   - [ ] Logout works

5. **Test Edge Cases**
   - [ ] Concurrent refresh requests
   - [ ] Expired refresh token
   - [ ] Invalid token signature
   - [ ] Missing token
   - [ ] Malformed Authorization header

---

## 📞 Support

If stuck on any endpoint:
1. Check `BACKEND_REFRESH_TOKEN_EXAMPLE.md` untuk reference implementation
2. Check error message di console
3. Test endpoint dengan Postman/cURL
4. Verify environment variables set
5. Check JWT token content di jwt.io

---

## 🎯 Success Criteria

When done:
- ✅ All 3 endpoints implemented
- ✅ All endpoints tested & working
- ✅ Frontend login → auto-refresh → request cycle works
- ✅ 401 handling works
- ✅ Logout cleanup works
- ✅ Page refresh persistence works
- ✅ Error handling & logging in place
- ✅ Security best practices followed

**Estimated Completion:** 1-2 days

---

**Created:** 2024
**Last Updated:** Today
**Status:** Ready for Implementation
