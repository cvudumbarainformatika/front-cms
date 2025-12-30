# Backend Refresh Token Implementation Example

Dokumen ini menunjukkan bagaimana implement refresh token di backend (Node.js/Express example).

## 1. Setup JWT dan Dependencies

```bash
npm install jsonwebtoken dotenv
```

## 2. Environment Variables

```env
# .env
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
ACCESS_TOKEN_EXPIRY=900        # 15 menit dalam detik
REFRESH_TOKEN_EXPIRY=604800    # 7 hari dalam detik
```

## 3. Token Service (token.service.js)

```javascript
const jwt = require('jsonwebtoken')

class TokenService {
  /**
   * Generate access dan refresh token
   */
  static generateTokens(userId, userRole) {
    const accessToken = jwt.sign(
      { 
        userId, 
        userRole,
        type: 'access'
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = jwt.sign(
      { 
        userId,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY)
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type')
      }
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired access token')
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  /**
   * Refresh access token
   */
  static refreshAccessToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken)
    
    // Optional: bisa cek di database apakah refresh token masih valid
    // (jika implement token blacklist/rotation)
    
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
      this.generateTokens(decoded.userId, decoded.userRole)

    return {
      accessToken,
      refreshToken: newRefreshToken, // Return baru untuk token rotation
      expiresIn
    }
  }
}

module.exports = TokenService
```

## 4. Authentication Middleware

```javascript
// middleware/auth.js
const TokenService = require('../services/token.service')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
      message: error.message || 'Invalid token'
    })
  }
}

module.exports = authMiddleware
```

## 5. Auth Routes (routes/auth.js)

```javascript
const express = require('express')
const router = express.Router()
const TokenService = require('../services/token.service')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User') // Sesuaikan dengan model Anda

/**
 * POST /api/auth/login
 * Login dengan email & password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      })
    }

    // Cari user di database
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      })
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = 
      TokenService.generateTokens(user._id, user.role)

    // Optional: Simpan refresh token di database untuk tracking
    // await RefreshToken.create({ userId: user._id, token: refreshToken })

    // Return response
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn
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

/**
 * POST /api/auth/refresh
 * Refresh access token menggunakan refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token diperlukan'
      })
    }

    // Verify refresh token
    const decoded = TokenService.verifyRefreshToken(refresh_token)

    // Optional: Cek di database apakah token masih valid
    // const storedToken = await RefreshToken.findOne({
    //   userId: decoded.userId,
    //   token: refresh_token
    // })
    // if (!storedToken) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Refresh token tidak valid atau sudah expired'
    //   })
    // }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
      TokenService.refreshAccessToken(refresh_token)

    // Optional: Update token di database
    // await RefreshToken.updateOne(
    //   { userId: decoded.userId, token: refresh_token },
    //   { token: newRefreshToken }
    // )

    return res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token'
    })
  }
})

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Optional: Blacklist refresh token di database
    // const { refresh_token } = req.body
    // if (refresh_token) {
    //   await RefreshToken.deleteOne({
    //     userId: req.user.userId,
    //     token: refresh_token
    //   })
    // }

    return res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * GET /api/auth/profile
 * Get profile user (contoh protected endpoint)
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      })
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
```

## 6. Complete Express App Setup

```javascript
// app.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const authMiddleware = require('./middleware/auth')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Protected routes example
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Ini endpoint protected',
    user: req.user
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    success: false,
    message: 'Server error'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## 7. Optional: Token Blacklist/Rotation Strategy

### Strategy 1: Simple Redis Blacklist

```javascript
// services/tokenBlacklist.js
const redis = require('redis')
const client = redis.createClient()

class TokenBlacklist {
  static async addToBlacklist(token, expiresIn) {
    await client.setex(token, expiresIn, 'blacklisted')
  }

  static async isBlacklisted(token) {
    const result = await client.get(token)
    return result === 'blacklisted'
  }

  static async removeFromBlacklist(token) {
    await client.del(token)
  }
}

module.exports = TokenBlacklist
```

### Strategy 2: Database Token Tracking

```javascript
// models/RefreshToken.js
const mongoose = require('mongoose')

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Cleanup expired tokens secara berkala
RefreshTokenSchema.statics.cleanup = async function() {
  await this.deleteMany({
    expiresAt: { $lt: new Date() }
  })
}

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema)
```

Update refresh endpoint untuk check database:

```javascript
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token diperlukan'
      })
    }

    // Verify refresh token
    const decoded = TokenService.verifyRefreshToken(refresh_token)

    // Check di database
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token: refresh_token,
      isRevoked: false
    })

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak valid atau sudah revoked'
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
      TokenService.refreshAccessToken(refresh_token)

    // Update token baru di database
    await RefreshToken.updateOne(
      { _id: storedToken._id },
      { token: newRefreshToken }
    )

    return res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token'
    })
  }
})
```

## 8. Testing dengan cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "user": { ... },
#     "access_token": "eyJhbGc...",
#     "refresh_token": "eyJhbGc...",
#     "expires_in": 900
#   }
# }
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGc..."
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "access_token": "eyJhbGc...",
#     "refresh_token": "eyJhbGc...",
#     "expires_in": 900
#   }
# }
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer eyJhbGc..."

# Response:
# {
#   "success": true,
#   "message": "Ini endpoint protected",
#   "user": {
#     "userId": "...",
#     "userRole": "admin",
#     "type": "access"
#   }
# }
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGc..."
  }'

# Response:
# {
#   "success": true,
#   "message": "Logout successful"
# }
```

## 9. Best Practices

1. **Access Token**
   - Short-lived (15-30 menit)
   - Stored di memory/state (frontend)
   - Tidak disimpan di localStorage jika possible

2. **Refresh Token**
   - Long-lived (7 days - 30 days)
   - Disimpan aman (HttpOnly cookies, encrypted localStorage, atau database)
   - Bisa di-rotate setiap refresh

3. **Token Rotation**
   - Issue refresh token baru setiap kali refresh
   - Revoke refresh token lama
   - Detect dan block jika refresh token lama digunakan (potential attack)

4. **Expiry Timing**
   - Access: 15 menit
   - Refresh: 7 hari
   - Logout: 1 jam

5. **Security Headers**
   - CORS configuration yang ketat
   - HTTPS only
   - Secure & HttpOnly cookies untuk refresh token

## 10. Integration dengan Frontend

Frontend sudah siap untuk consume API ini! 

Hanya pastikan:
1. ✅ Login endpoint return `access_token`, `refresh_token`, `expires_in`
2. ✅ Refresh endpoint di `/auth/refresh` accept `refresh_token` dan return new tokens
3. ✅ Protected endpoints return 401 jika token invalid/expired
4. ✅ Logout endpoint di `/auth/logout`

Frontend akan:
- ✅ Auto-refresh 1 menit sebelum expired
- ✅ Handle 401 dengan automatic refresh & retry
- ✅ Persist session across page refresh
- ✅ Cleanup tokens saat logout
