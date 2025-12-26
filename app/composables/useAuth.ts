/**
 * useAuth Composable
 * State management untuk autentikasi (dummy untuk development)
 */

import type { User, AuthState, UserRole } from '../types/user'

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
const dummyUsers: Record<string, User> = {
  member: {
    id: '1',
    email: 'anggota@pdpi.or.id',
    name: 'Dr. Ahmad Respirologi',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member',
    memberId: 'PDPI-2024-001',
    branchId: 'jkt-001'
  },
  admin_cabang: {
    id: '2',
    email: 'admin.cabang@pdpi.or.id',
    name: 'Dr. Budi Admin Cabang',
    role: 'admin_cabang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin_cabang',
    memberId: 'PDPI-2020-042',
    organizationLevel: 'cabang',
    branchId: 'jkt-001'
  },
  admin_wilayah: {
    id: '3',
    email: 'admin.wilayah@pdpi.or.id',
    name: 'Dr. Citra Admin Wilayah',
    role: 'admin_wilayah',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin_wilayah',
    memberId: 'PDPI-2018-015',
    organizationLevel: 'wilayah',
    regionId: 'jabar-001'
  },
  admin_pusat: {
    id: '4',
    email: 'admin.pusat@pdpi.or.id',
    name: 'Dr. Diana Admin Pusat',
    role: 'admin_pusat',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin_pusat',
    memberId: 'PDPI-2015-003',
    organizationLevel: 'pusat'
  }
}

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

  /**
   * Login dummy - untuk development
   * @param role - Role yang ingin digunakan untuk testing
   */
  const login = async (role: UserRole = 'member') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const dummyUser = dummyUsers[role]
    if (!dummyUser) {
      throw new Error('Invalid role for dummy login')
    }

    authState.value = {
      isAuthenticated: true,
      user: dummyUser,
      token: `dummy-token-${Date.now()}`
    }

    return dummyUser
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

    authState.value = {
      isAuthenticated: true,
      user: newUser,
      token: `dummy-token-${Date.now()}`
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
    }
  }

  /**
   * Update Password
   */
  const updatePassword = async (oldPass: string, newPass: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Always success for dummy
    return true
  }

  /**
   * Logout
   */
  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))

    authState.value = {
      isAuthenticated: false,
      user: null,
      token: null
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
