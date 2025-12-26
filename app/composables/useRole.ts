/**
 * useRole Composable
 * Role-based access control helpers
 */

import type { UserRole } from '../types/user'

/**
 * Definisi permission untuk setiap role
 */
const rolePermissions: Record<UserRole, string[]> = {
  public: [
    'view:public_content'
  ],
  member: [
    'view:public_content',
    'view:member_profile',
    'edit:member_profile',
    'view:documents',
    'upload:documents',
    'view:skp'
  ],
  admin_cabang: [
    'view:public_content',
    'view:member_profile',
    'edit:member_profile',
    'view:documents',
    'upload:documents',
    'view:skp',
    'manage:branch_members',
    'validate:registrations',
    'manage:content',
    'view:branch_reports'
  ],
  admin_wilayah: [
    'view:public_content',
    'view:member_profile',
    'edit:member_profile',
    'view:documents',
    'upload:documents',
    'view:skp',
    'manage:branch_members',
    'manage:region_members',
    'validate:registrations',
    'manage:content',
    'view:branch_reports',
    'view:region_reports'
  ],
  admin_pusat: [
    'view:public_content',
    'view:member_profile',
    'edit:member_profile',
    'view:documents',
    'upload:documents',
    'view:skp',
    'manage:branch_members',
    'manage:region_members',
    'manage:all_members',
    'validate:registrations',
    'manage:content',
    'manage:menus',
    'manage:settings',
    'view:branch_reports',
    'view:region_reports',
    'view:all_reports',
    'export:data'
  ]
}

/**
 * Role hierarchy - role yang lebih tinggi inherit permission dari yang lebih rendah
 */
const roleHierarchy: Record<UserRole, number> = {
  public: 0,
  member: 1,
  admin_cabang: 2,
  admin_wilayah: 3,
  admin_pusat: 4
}

/**
 * Composable untuk role-based access control
 */
export const useRole = () => {
  const { userRole, hasRole } = useAuth()

  /**
   * Check apakah user memiliki permission tertentu
   */
  const hasPermission = (permission: string): boolean => {
    const permissions = rolePermissions[userRole.value] || []
    return permissions.includes(permission)
  }

  /**
   * Check apakah user memiliki salah satu dari permission yang diberikan
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p))
  }

  /**
   * Check apakah user memiliki semua permission yang diberikan
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p))
  }

  /**
   * Check apakah role user >= role yang diberikan (berdasarkan hierarchy)
   */
  const hasMinimumRole = (role: UserRole): boolean => {
    return roleHierarchy[userRole.value] >= roleHierarchy[role]
  }

  /**
   * Get semua permissions untuk role saat ini
   */
  const currentPermissions = computed(() => {
    return rolePermissions[userRole.value] || []
  })

  /**
   * Get role level berdasarkan hierarchy
   */
  const roleLevel = computed(() => {
    return roleHierarchy[userRole.value]
  })

  return {
    userRole,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasMinimumRole,
    currentPermissions,
    roleLevel
  }
}
