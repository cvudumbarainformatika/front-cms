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

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  category: string
  branchId: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  bio?: string
  address?: string
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

  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const user = computed(() => authState.value.user)
  const userRole = computed<UserRole>(() => authState.value.user?.role || 'public')

  // Fungsi untuk memuat data dari localStorage dan menginisialisasi state
  const initializeAuthFromStorage = () => {
    if (typeof window !== 'undefined') {
      const tokenFromStorage = localStorage.getItem('auth_token')
      const userFromStorage = localStorage.getItem('auth_user')

      if (tokenFromStorage && userFromStorage) {
        try {
          const userData = JSON.parse(userFromStorage)
          const parsedUser: User = {
            id: userData.id || 'unknown',
            email: userData.email || 'unknown@example.com',
            name: userData.name || 'Unknown',
            role: userData.role || 'member'
          }

          // Perbarui state hanya jika berbeda
          if (authState.value.token !== tokenFromStorage || authState.value.user?.id !== parsedUser.id) {
            authState.value = {
              isAuthenticated: true,
              user: parsedUser,
              token: tokenFromStorage
            }
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e)
          // Hapus data yang rusak
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
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
    const res = await $apiFetch<ApiResponse<{ access_token: string, user: Partial<User> & { role?: UserRole } }>>('/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    if (!res?.data?.access_token) {
      throw new Error('Login gagal: token tidak ditemukan dalam respons')
    }

    const token: string = res.data.access_token
    const apiUser: (Partial<User> & { role?: UserRole }) | null = res.data.user ?? null

    const finalUser: User = {
      id: apiUser?.id ?? 'unknown',
      email,
      name: apiUser?.name ?? 'Unknown',
      role: (apiUser?.role as UserRole) ?? 'member'
    }

    authState.value = {
      isAuthenticated: true,
      user: finalUser,
      token: token
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(finalUser))
    }

    return finalUser
  }

  /**
   * Register dummy
   */
  const register = async (data: RegisterData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // Create new dummy user
    const newUser: User = {
      id: `new-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'member',
      memberId: 'PENDING-VERIFICATION',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`,
      branchId: data.branchId
    }

    const dummyToken = `dummy-token-${Date.now()}`

    authState.value = {
      isAuthenticated: true,
      user: newUser,
      token: dummyToken
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', dummyToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    }

    return newUser
  }

  /**
   * Update Profile
   */
  const updateProfile = async (data: UpdateProfileData) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    if (authState.value.user) {
      authState.value.user = {
        ...authState.value.user,
        ...data
      }

      // Update localStorage juga
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(authState.value.user))
      }
    }
  }

  /**
   * Update Password
   */
  const updatePassword = async (_oldPass: string, _newPass: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Jika password diupdate, mungkin perlu refresh token
    // Dalam implementasi nyata, Anda mungkin perlu login ulang atau mendapatkan token baru
    return true
  }

  /**
   * Logout
   */
  const logout = async () => {
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

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }

    // Redirect ke home
    await navigateTo('/')
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
    updatePassword
  }
}
