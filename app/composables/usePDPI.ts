/**
 * usePDPI Composable
 * Handles PDPI member data integration via backend proxy
 */

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PDPIMember {
  id: string
  npa: string
  nama: string
  gelar?: string
  gelar2?: string
  email?: string
  no_hp?: string
  nik?: string
  jenis_kelamin?: string
  tempat_lahir?: string
  tgl_lahir?: string
  alamat_rumah?: string
  cabang?: string
  provinsi?: string
  kota_kabupaten?: string
  status?: string
  alumni?: string
  thn_lulus?: number
  tempat_tugas?: string
  tempat_praktek_1?: string
  tempat_praktek_2?: string
  subspesialis?: string
  no_str?: string
  str_berlaku_sampai?: string
  no_sip?: string
  sip_berlaku_sampai?: string
  user_id?: number
  synced_at?: string
  created_at: string
  updated_at: string
}

export interface MembersFilter {
  source?: 'local' | 'api'
  page?: number
  limit?: number
  cabang?: string
  provinsi?: string
  status?: string
  search?: string
}

export interface MembersResponse {
  members: PDPIMember[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  source: 'local' | 'api'
}

/**
 * Composable untuk akses PDPI data
 */
export const usePDPI = () => {
  const { $apiFetch } = useNuxtApp()

  // State untuk member data
  const myMemberData = useState<PDPIMember | null>('pdpi_my_member', () => null)
  const isLoadingMember = useState<boolean>('pdpi_loading', () => false)

  /**
   * Sync member data dengan PDPI API
   * @param email - Email member (optional, defaults to authenticated user's email)
   */
  const syncMember = async (email?: string) => {
    try {
      isLoadingMember.value = true

      const body = email ? { email } : {}
      const res = await $apiFetch<ApiResponse<PDPIMember>>('/pdpi/sync-member', {
        method: 'POST',
        body
      })

      if (res?.success && res?.data) {
        // Update local state if syncing current user
        if (!email) {
          myMemberData.value = res.data
        }
        return res.data
      } else {
        throw new Error(res?.message || 'Failed to sync member data')
      }
    } catch (error) {
      console.error('Sync member error:', error)
      throw error
    } finally {
      isLoadingMember.value = false
    }
  }

  /**
   * Get members list (local or API)
   * @param filter - Filter parameters
   */
  const getMembers = async (filter?: MembersFilter): Promise<MembersResponse> => {
    try {
      isLoadingMember.value = true

      // Build query params
      const params: Record<string, string> = {}
      if (filter?.source) params.source = filter.source
      if (filter?.page) params.page = filter.page.toString()
      if (filter?.limit) params.limit = filter.limit.toString()
      if (filter?.cabang) params.cabang = filter.cabang
      if (filter?.provinsi) params.provinsi = filter.provinsi
      if (filter?.status) params.status = filter.status
      if (filter?.search) params.search = filter.search

      const queryString = new URLSearchParams(params).toString()
      const endpoint = `/pdpi/members${queryString ? `?${queryString}` : ''}`

      const res = await $apiFetch<ApiResponse<MembersResponse>>(endpoint, {
        method: 'GET'
      })

      if (res?.success && res?.data) {
        return res.data
      } else {
        throw new Error(res?.message || 'Failed to fetch members')
      }
    } catch (error) {
      console.error('Get members error:', error)
      throw error
    } finally {
      isLoadingMember.value = false
    }
  }

  /**
   * Get member by NPA
   * @param npa - Nomor Peserta Anggota
   */
  const getMemberByNPA = async (npa: string): Promise<PDPIMember> => {
    try {
      isLoadingMember.value = true

      const res = await $apiFetch<ApiResponse<{ member: PDPIMember, source: string }>>(`/pdpi/member/${npa}`, {
        method: 'GET'
      })

      if (res?.success && res?.data?.member) {
        return res.data.member
      } else {
        throw new Error(res?.message || 'Member not found')
      }
    } catch (error) {
      console.error('Get member by NPA error:', error)
      throw error
    } finally {
      isLoadingMember.value = false
    }
  }

  /**
   * Get authenticated user's member data
   */
  const getMyMemberData = async (): Promise<PDPIMember> => {
    try {
      isLoadingMember.value = true

      const res = await $apiFetch<ApiResponse<{ member: PDPIMember, source: string }>>('/pdpi/me', {
        method: 'GET'
      })

      if (res?.success && res?.data?.member) {
        myMemberData.value = res.data.member
        return res.data.member
      } else {
        throw new Error(res?.message || 'Member data not found')
      }
    } catch (error) {
      console.error('Get my member data error:', error)
      throw error
    } finally {
      isLoadingMember.value = false
    }
  }

  /**
   * Clear member data from state
   */
  const clearMemberData = () => {
    myMemberData.value = null
  }

  return {
    // State
    myMemberData: readonly(myMemberData),
    isLoadingMember: readonly(isLoadingMember),

    // Methods
    syncMember,
    getMembers,
    getMemberByNPA,
    getMyMemberData,
    clearMemberData
  }
}
