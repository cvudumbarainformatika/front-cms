import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated } = useAuth()
  
  // Tunggu sebentar untuk memastikan state authentikasi terinisialisasi
  if (process.client) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Jika tidak authenticated, redirect ke halaman login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})