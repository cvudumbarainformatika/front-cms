/**
 * User & Role Type Definitions
 * Platform Organisasi Profesi Kedokteran (Respiratori)
 */

import type { UserRole } from './menu'
export type { UserRole }


/**
 * Status keanggotaan
 */
export type MemberStatus = 'pending' | 'active' | 'inactive' | 'suspended'

/**
 * Tipe keanggotaan
 */
export type MembershipType = 'anggota_biasa' | 'anggota_luar_biasa' | 'anggota_kehormatan'

/**
 * Level organisasi
 */
export type OrganizationLevel = 'pusat' | 'wilayah' | 'cabang'

/**
 * User session data
 */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  memberId?: string
  organizationLevel?: OrganizationLevel
  branchId?: string
  regionId?: string
  phone?: string
  bio?: string
  address?: string
}

/**
 * Member profile data
 */
export interface MemberProfile {
  id: string
  userId: string
  npa: string // Nomor Pokok Anggota
  fullName: string
  email: string
  phone: string
  birthDate: string
  birthPlace: string
  gender: 'male' | 'female'
  address: string
  city: string
  province: string
  postalCode: string
  status: MemberStatus
  membershipType: MembershipType
  branchId: string
  regionId: string
  strNumber?: string
  strExpiry?: string
  sipNumber?: string
  sipExpiry?: string
  workplace?: string
  specialization?: string
  joinDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Auth state
 */
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}
