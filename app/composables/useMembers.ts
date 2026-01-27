/**
 * useMembers Composable
 * Manage public member directory search and filtering
 */

export interface Member {
  id: string
  npa: string
  nama: string
  gelar: string | null
  gelar2: string | null
  jenis_kelamin: string | null
  email: string | null
  cabang: string | null
  provinsi: string | null
  kota_kabupaten: string | null
  status: string | null
  tempat_praktek_1: string | null
  tempat_praktek_2: string | null
  alumni: string | null
}

export interface MemberSearchParams {
  nama?: string
  cabang?: string
  provinsi?: string
  page?: number
  limit?: number
}

export interface MemberSearchResponse {
  members: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const useMembers = () => {
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Search members with filters
   */
  const searchMembers = async (params: MemberSearchParams = {}): Promise<MemberSearchResponse> => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      
      if (params.nama) queryParams.append('nama', params.nama)
      if (params.cabang) queryParams.append('cabang', params.cabang)
      if (params.provinsi) queryParams.append('provinsi', params.provinsi)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())

      const url = `${config.public.apiBase}/members/search?${queryParams.toString()}`
      
      console.log('[useMembers] Fetching from:', url)
      
      const response = await $fetch<{
        success: boolean
        message: string
        data: MemberSearchResponse
      }>(url, {
        method: 'GET',
      })

      console.log('[useMembers] Raw response:', response)
      console.log('[useMembers] Response success:', response.success)
      console.log('[useMembers] Response data:', response.data)

      if (!response.success) {
        throw new Error(response.message || 'Failed to search members')
      }

      return response.data
    } catch (err: any) {
      console.error('[useMembers] Error caught:', err)
      console.error('[useMembers] Error message:', err?.message)
      console.error('[useMembers] Error data:', err?.data)
      error.value = err?.message || 'Failed to search members'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get unique list of branches for filter
   */
  const getBranches = async (): Promise<string[]> => {
    try {
      // For now, fetch all members and extract unique branches
      const response = await searchMembers({ limit: 1000 })
      
      if (!response?.members) return []

      const branches = [...new Set(
        response.members
          .map(m => m.cabang)
          .filter(Boolean) as string[]
      )].sort()
      return branches
    } catch (e) {
      console.error('[useMembers] Failed to get branches:', e)
      return []
    }
  }

  /**
   * Get unique list of provinces for filter
   */
  const getProvinces = async (): Promise<string[]> => {
    try {
      const response = await searchMembers({ limit: 1000 })
      
      if (!response?.members) return []

      const provinces = [...new Set(
        response.members
          .map(m => m.provinsi)
          .filter(Boolean) as string[]
      )].sort()
      return provinces
    } catch (e) {
      console.error('[useMembers] Failed to get provinces:', e)
      return []
    }
  }

  /**
   * Format member name with titles
   */
  const formatMemberName = (member: Member): string => {
    const parts = []
    if (member.gelar) parts.push(member.gelar)
    parts.push(member.nama)
    if (member.gelar2) parts.push(member.gelar2)
    return parts.join(' ')
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    searchMembers,
    getBranches,
    getProvinces,
    formatMemberName,
  }
}
