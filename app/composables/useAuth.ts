/**
 * useAuth Composable
 * State management untuk autentikasi (dummy untuk development)
 */

import type { User, AuthState, UserRole } from '../types/user'

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

interface TokenData {
  access_token: string
  refresh_token: string
  expires_in: number // dalam detik
}

interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  cabang: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  bio?: string
  address?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Dummy user data untuk development
 */

/**
 * Composable untuk autentikasi
 */
export const useAuth = () => {
  // Auth state - harus dipanggil di dalam composable function
  const authState = useState<AuthState>('auth', () => ({
    isAuthenticated: false,
    user: null,
    token: null
  }))

  // Token state untuk menyimpan refresh token dan expiry
  const tokenState = useState<{
    refreshToken: string | null
    expiresAt: number | null // timestamp dalam ms
    refreshTimeout: NodeJS.Timeout | null
  }>('token', () => ({
    refreshToken: null,
    expiresAt: null,
    refreshTimeout: null
  }))

  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const user = computed(() => authState.value.user)
  const userRole = computed<UserRole>(() => authState.value.user?.role || 'public')

  /**
   * Fungsi untuk setup auto-refresh token
   * Akan refresh token 1 menit sebelum expired
   */
  const setupTokenRefresh = () => {
    // Clear timeout sebelumnya jika ada
    if (tokenState.value.refreshTimeout) {
      clearTimeout(tokenState.value.refreshTimeout)
    }

    if (!tokenState.value.expiresAt) return

    const now = Date.now()
    const timeUntilExpiry = tokenState.value.expiresAt - now
    const refreshBeforeExpiry = 60 * 1000 // Refresh 1 menit sebelum expired

    // Jika sudah expired, langsung refresh
    if (timeUntilExpiry <= 0) {
      refreshAccessToken()
      return
    }

    // Schedule refresh 1 menit sebelum expired
    const delayMs = Math.max(0, timeUntilExpiry - refreshBeforeExpiry)

    tokenState.value.refreshTimeout = setTimeout(() => {
      // console.log('[Auth] Token akan segera expired, melakukan refresh...')
      refreshAccessToken()
    }, delayMs)

    // console.log(`[Auth] Token refresh dijadwalkan dalam ${Math.round(delayMs / 1000)} detik`)
  }

  /**
   * Fungsi untuk refresh access token menggunakan refresh token
   */
  const refreshAccessToken = async () => {
    try {
      if (!tokenState.value.refreshToken) {
        console.warn('[Auth] Refresh token tidak tersedia, logout...')
        await logout()
        return
      }

      const { $apiFetch } = useNuxtApp()
      
      const res = await $apiFetch<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
        method: 'POST',
        body: {
          refresh_token: tokenState.value.refreshToken
        }
      })

      if (!res?.data?.access_token) {
        throw new Error('Refresh token gagal: token tidak ditemukan dalam respons')
      }

      const newAccessToken = res.data.access_token
      const newRefreshToken = res.data.refresh_token || tokenState.value.refreshToken
      const expiresIn = res.data.expires_in

      // Update access token di state dan localStorage
      authState.value.token = newAccessToken
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', newAccessToken)
      }

      // Update refresh token jika ada token baru
      if (res.data.refresh_token) {
        tokenState.value.refreshToken = newRefreshToken
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('auth_refresh_token', newRefreshToken)
        }
      }

      // Update expiry time
      const newExpiresAt = Date.now() + (expiresIn * 1000)
      tokenState.value.expiresAt = newExpiresAt
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_expires_at', newExpiresAt.toString())
      }

      // Setup refresh berikutnya
      setupTokenRefresh()

      console.log('[Auth] Token berhasil di-refresh')
      return newAccessToken
    } catch (error) {
      console.error('[Auth] Refresh token error:', error)
      // Jika refresh gagal, logout user
      await logout()
      throw error
    }
  }

  // Fungsi untuk memuat data dari localStorage dan menginisialisasi state
  const initializeAuthFromStorage = () => {
    if (typeof window !== 'undefined') {
      const tokenFromStorage = localStorage.getItem('auth_token')
      const userFromStorage = localStorage.getItem('auth_user')
      const refreshTokenFromStorage = localStorage.getItem('auth_refresh_token')
      const expiresAtFromStorage = localStorage.getItem('auth_expires_at')

      if (tokenFromStorage && userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage)
          const parsedUser: User = {
            id: userData.id || 'unknown',
            email: userData.email || 'unknown@example.com',
            name: userData.name || 'Unknown',
            role: userData.role || 'member',
            avatar: userData.avatar,
            phone: userData.phone,
            address: userData.address,
            bio: userData.bio
          }

          // Perbarui state hanya jika berbeda
          if (authState.value.token !== tokenFromStorage || authState.value.user?.id !== parsedUser.id) {
            authState.value = {
              isAuthenticated: true,
              user: parsedUser,
              token: tokenFromStorage
            }
          }

          // Update token state dengan refresh token dan expiry
          if (refreshTokenFromStorage && expiresAtFromStorage) {
            tokenState.value.refreshToken = refreshTokenFromStorage
            tokenState.value.expiresAt = parseInt(expiresAtFromStorage, 10)
            // Setup auto-refresh jika masih valid
            setupTokenRefresh()
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e)
          // Hapus data yang rusak
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_refresh_token')
          localStorage.removeItem('auth_expires_at')
          authState.value = {
            isAuthenticated: false,
            user: null,
            token: null
          }
        }
      } else if (authState.value.isAuthenticated) {
        // Jika state mengatakan user sudah login tapi tidak ada data di localStorage
        authState.value = {
          isAuthenticated: false,
          user: null,
          token: null
        }
      }
    }
  }

  // Panggil inisialisasi saat composable digunakan
  initializeAuthFromStorage()

  // Gunakan onNuxtReady atau onMounted untuk memastikan inisialisasi setelah client hydrate
  if (import.meta.client) {
    // Event listener untuk perubahan localStorage dari tab/window lain
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'auth_token' || e.key === 'auth_user') {
          initializeAuthFromStorage()
        }
      })
    }
  }

  /**
   * Login backend-only: selalu panggil `${apiBase}/auth`
   */
  const login = async (email: string, password: string) => {
    const { $apiFetch } = useNuxtApp()
    const res = await $apiFetch<ApiResponse<{ 
      access_token: string
      refresh_token: string
      expires_in: number
      user: Partial<User> & { role?: UserRole } 
    }>>('/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    // Jika response tidak success, throw error
    if (!res?.success) {
      const error = new Error(res?.message || 'Login gagal')
      ;(error as any).data = res
      throw error
    }

    if (!res?.data?.access_token) {
      throw new Error('Login gagal: token tidak ditemukan dalam respons')
    }

    const token: string = res.data.access_token
    const refreshToken: string = res.data.refresh_token
    const expiresIn: number = res.data.expires_in || 900 // default 15 menit
    const apiUser: (Partial<User> & { role?: UserRole }) | null = res.data.user ?? null

    const finalUser: User = {
      id: apiUser?.id ?? 'unknown',
      email,
      name: apiUser?.name ?? 'Unknown',
      role: (apiUser?.role as UserRole) ?? 'member',
      avatar: apiUser?.avatar,
      phone: apiUser?.phone,
      address: apiUser?.address,
      bio: apiUser?.bio
    }

    authState.value = {
      isAuthenticated: true,
      user: finalUser,
      token: token
    }

    // Hitung expiry time
    const expiresAt = Date.now() + (expiresIn * 1000)

    // Update token state
    tokenState.value = {
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      refreshTimeout: null
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(finalUser))
      localStorage.setItem('auth_refresh_token', refreshToken)
      localStorage.setItem('auth_expires_at', expiresAt.toString())
    }

    // Setup auto-refresh
    setupTokenRefresh()

    return finalUser
  }

  /**
   * Register - Call backend API
   * TIDAK set token, hanya return user data
   * Token akan didapat setelah admin verifikasi & user login
   */
  const register = async (data: RegisterData) => {
    const { $apiFetch } = useNuxtApp()
    
    const res = await $apiFetch<ApiResponse<User>>('/auth/register', {
      method: 'POST',
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        cabang: data.cabang
      }
    })

    if (!res?.data) {
      throw new Error('Register gagal: data user tidak ditemukan dalam respons')
    }

    // TIDAK set token, TIDAK set isAuthenticated
    // User hanya bisa login setelah verified oleh admin
    return res.data
  }

  /**
   * Update Profile - Call backend API
   * Support both JSON dan FormData (untuk file upload)
   */
  const updateProfile = async (data: UpdateProfileData | FormData) => {
    const { $apiFetch } = useNuxtApp()
    try {
      // Deteksi apakah data adalah FormData atau JSON
      const isFormData = data instanceof FormData
      
      const options: any = {
        method: 'PUT'
      }

      if (isFormData) {
        // Jika FormData, jangan set Content-Type (browser akan set otomatis)
        options.body = data
      } else {
        // Jika JSON
        options.body = data
      }

      const res = await $apiFetch<ApiResponse<User>>('/auth/profile', {
        ...options
        // tanpa headers token karena sudah di set di plugins/api-fetch.client.ts
      })

      if (res?.data) {
        // Update state dengan data dari backend
        authState.value.user = {
          ...authState.value.user,
          ...res.data
        }

        // Update localStorage juga
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(authState.value.user))
        }

        return res.data
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  /**
   * Change Password - Call backend API
   * Endpoint: POST /api/v1/auth/profile/change-password
   */
  const changePassword = async (data: ChangePasswordData) => {
    const { $apiFetch } = useNuxtApp()

    try {
      // Validate input
      if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
        throw new Error('Semua field wajib diisi')
      }

      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Password baru tidak cocok dengan konfirmasi')
      }

      if (data.newPassword.length < 6) {
        throw new Error('Password baru minimal 6 karakter')
      }

      // Call backend API
      const res = await $apiFetch<ApiResponse<{ message: string }>>('/auth/profile/change-password', {
        method: 'POST',
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }
      })

      if (res?.data) {
        console.log('Password changed successfully:', res.data.message)
        return res.data
      }
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    // Clear auto-refresh timeout
    if (tokenState.value.refreshTimeout) {
      clearTimeout(tokenState.value.refreshTimeout)
    }

    // Jika ada token, kirim permintaan logout ke backend
    if (authState.value.token) {
      try {
        const { $apiFetch } = useNuxtApp()
        await $apiFetch('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.value.token}`
          }
        })
      } catch (error) {
        console.error('Logout API error:', error)
        // Tetap lanjutkan proses logout meskipun API gagal
      }
    }

    authState.value = {
      isAuthenticated: false,
      user: null,
      token: null
    }

    tokenState.value = {
      refreshToken: null,
      expiresAt: null,
      refreshTimeout: null
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_expires_at')
    }

    // Redirect ke login
    await navigateTo('/login')
  }

  /**
   * Check apakah user memiliki role tertentu
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!authState.value.user) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(authState.value.user.role)
  }

  /**
   * Check apakah user adalah admin (cabang/wilayah/pusat)
   */
  const isAdmin = computed(() => {
    return hasRole(['admin_cabang', 'admin_wilayah', 'admin_pusat'])
  })

  return {
    authState: readonly(authState),
    isAuthenticated,
    user,
    userRole,
    isAdmin,
    login,
    logout,
    hasRole,
    register,
    updateProfile,
    changePassword,
    refreshAccessToken,
    setupTokenRefresh
  }
}
