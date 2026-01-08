export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  // Di server, gunakan internal URL langsung untuk hindari masalah proxy/routing
  // Di client, gunakan apiBase (biasanya /backend) yang akan diproxy
  const apiBase = process.server 
    ? 'http://localhost:8080/api/v1' 
    : (config.public.apiBase || '/backend')

  let isRefreshing = false
  let refreshPromise: Promise<string | null> | null = null

  // Buat instance $fetch dengan baseURL
  const apiFetch = $fetch.create({
    baseURL: apiBase,
    onRequest({ options }) {
      try {
        // Coba ambil token dari state auth
        // Pastikan useAuth handles SSR gracefully (useState is used there)
        const { authState } = useAuth()
        const token = authState.value.token
        const headers = new Headers(options.headers as HeadersInit)
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        options.headers = headers
      } catch (e) {
        // Skip auth header on error (or if useAuth fails on server)
      }
    },
    async onResponseError({ response, request }) {
      // Refresh logic hanya relevan di client side biasanya untuk interactive session
      // Di server side, jika 401, kita return error saja
      if (process.server) return

      // Jangan handle error untuk auth endpoints (login, register, dll)
      if (request.url?.includes('/auth/')) {
        return
      }

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        try {
          const { authState } = useAuth()
          
          // Jika sudah ada refresh yang sedang berjalan, tunggu hasilnya
          if (isRefreshing && refreshPromise) {
            const newToken = await refreshPromise
            if (newToken) {
              const headers = new Headers(request.headers as HeadersInit)
              headers.set('Authorization', `Bearer ${newToken}`)
              return apiFetch(request.url || '', { 
                ...request, 
                headers 
              })
            } else {
              throw new Error('Token refresh gagal')
            }
          }

          // Mulai refresh process
          isRefreshing = true
          refreshPromise = (async () => {
            try {
              const { refreshAccessToken } = useAuth()
              const newToken = await refreshAccessToken()
              isRefreshing = false
              refreshPromise = null
              return newToken
            } catch (error) {
              isRefreshing = false
              refreshPromise = null
              console.error('Token refresh error:', error)
              return null
            }
          })()

          const newToken = await refreshPromise

          if (newToken) {
            // Retry request dengan token baru
            const headers = new Headers(request.headers as HeadersInit)
            headers.set('Authorization', `Bearer ${newToken}`)
            return apiFetch(request.url || '', { 
              ...request, 
              headers 
            })
          }
        } catch (error) {
          console.error('Error handling 401:', error)
          // Logout jika refresh gagal
          try {
            const { authState } = useAuth()
            authState.value = {
              isAuthenticated: false,
              user: null,
              token: null
            }
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('auth_token')
              localStorage.removeItem('auth_user')
              localStorage.removeItem('auth_refresh_token')
              localStorage.removeItem('auth_expires_at')
            }
            await navigateTo('/login')
          } catch {
            // ignore
          }
        }
      }
    }
  })

  return {
    provide: {
      apiFetch
    }
  }
})
