export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || '/backend'

  // Buat instance $fetch dengan baseURL dan header Authorization otomatis
  const apiFetch = $fetch.create({
    baseURL: apiBase,
    onRequest({ options }) {
      try {
        const { authState } = useAuth()
        const token = authState.value.token
        const headers = new Headers(options.headers as HeadersInit)
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        options.headers = headers
      } catch {
        // abaikan jika composable belum siap
      }
    }
  })

  return {
    provide: {
      apiFetch
    }
  }
})
