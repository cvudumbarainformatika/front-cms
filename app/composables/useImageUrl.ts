/**
 * Composable untuk menghandle image URL dari backend
 * Support full URL, relative path, dan placeholder
 */

export const useImageUrl = () => {
  const runtimeConfig = useRuntimeConfig()

  /**
   * Get placeholder berdasarkan tipe
   * @param type - 'avatar' | 'banner' | 'news' | 'default'
   * @returns URL placeholder
   */
  const getPlaceholder = (type: 'avatar' | 'banner' | 'news' | 'default' = 'default'): string => {
    const placeholders: Record<string, string> = {
      // Avatar default
      avatar: 'https://ui-avatars.com/api/?name=User&background=eff6ff&color=0f172a&bold=true',
      // Banner landscape
      banner: 'https://placehold.co/1200x400/f8fafc/94a3b8?text=Banner',
      // Berita / Artikel (4:3 or 16:9)
      news: 'https://placehold.co/800x600/f8fafc/94a3b8?text=No+Image',
      // Default
      default: 'https://placehold.co/600x400/f8fafc/94a3b8?text=No+Image'
    }
    return placeholders[type] || placeholders.default || ''
  }

  /**
   * Convert image path menjadi accessible URL
   * @param path - Image path dari backend (full URL, relative path, atau undefined)
   * @param placeholderOrType - URL placeholder manual ATAU tipe placeholder ('news', 'avatar', etc). Default: 'default'
   * @returns Full URL yang siap digunakan di img src
   */
  const getImageUrl = (path?: string, placeholderOrType: string = 'default'): string => {
    // Deteksi apakah argument ke-2 adalah tipe placeholder
    const types = ['avatar', 'banner', 'news', 'default']
    const fallback = types.includes(placeholderOrType) 
      ? getPlaceholder(placeholderOrType as any) 
      : placeholderOrType

    // Jika path kosong atau undefined
    if (!path || path.trim() === '') {
      return fallback
    }

    // Jika sudah full URL (http:// atau https://), return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Jika path dari backend: /api/v1/files/...
    // Construct full URL ke backend Go (port 8080)
    if (path.startsWith('/api/v1/files/')) {
      return `http://localhost:8080${path}`
    }

    // Jika path sudah dimulai dengan /backend, return as-is
    if (path.startsWith('/backend/')) {
      return path
    }

    // Jika path sudah dimulai dengan /, return as-is (sudah absolute path)
    if (path.startsWith('/')) {
      return path
    }

    // Jika hanya filename/relative, construct dengan uploads folder
    return `${runtimeConfig.public.apiBase}/uploads/${path}`
  }

  /**
   * Validate jika image URL bisa di-load (simple check)
   * @param url - URL untuk dicek
   * @returns true jika URL valid format
   */
  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return url.startsWith('/') || url.startsWith('.')
    }
  }


  /**
   * Format image URL dengan optional width/height (jika backend support image optimization)
   * @param path - Original image path
   * @param options - Width, height, quality
   * @returns Optimized URL
   */
  const getOptimizedImageUrl = (
    path?: string,
    options?: { width?: number; height?: number; quality?: number }
  ): string => {
    if (!path) return getPlaceholder()

    const url = getImageUrl(path)

    // Jika ingin add query params untuk image optimization
    // Format ini tergantung backend support
    if (options) {
      const params = new URLSearchParams()
      if (options.width) params.append('w', options.width.toString())
      if (options.height) params.append('h', options.height.toString())
      if (options.quality) params.append('q', options.quality.toString())

      return `${url}?${params.toString()}`
    }

    return url
  }

  return {
    getImageUrl,
    isValidImageUrl,
    getPlaceholder,
    getOptimizedImageUrl
  }
}
