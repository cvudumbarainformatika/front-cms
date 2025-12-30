/**
 * Composable untuk menghandle image URL dari backend
 * Support full URL, relative path, dan placeholder
 */

export const useImageUrl = () => {
  const runtimeConfig = useRuntimeConfig()

  /**
   * Convert image path menjadi accessible URL
   * @param path - Image path dari backend (full URL, relative path, atau undefined)
   * @param placeholder - Default placeholder jika path kosong
   * @returns Full URL yang siap digunakan di img src
   */
  const getImageUrl = (path?: string, placeholder: string = '/placeholder-avatar.png'): string => {
    // Jika path kosong atau undefined
    if (!path || path.trim() === '') {
      return placeholder
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
   * Get placeholder berdasarkan tipe
   * @param type - 'avatar' | 'banner' | 'default'
   * @returns URL placeholder
   */
  const getPlaceholder = (type: 'avatar' | 'banner' | 'default' = 'default'): string => {
    const placeholders: Record<string, string> = {
      avatar: '/placeholder-avatar.png',
      banner: '/placeholder-banner.png',
      default: '/placeholder.png'
    }
    return placeholders[type] || placeholders.default
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
