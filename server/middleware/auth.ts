import { defineEventHandler, getRequestURL, getRequestHeader, createError } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  
  // Skip auth for upload endpoint
  if (url.pathname === '/api/upload') {
    return
  }

  // Hanya proteksi rute API yang membutuhkan admin
  // Misalnya: POST /api/homepage, POST /api/berita, dll.
  if (url.pathname.startsWith('/api/') && event.method === 'POST') {
    const authHeader = getRequestHeader(event, 'authorization') || getRequestHeader(event, 'Authorization')
    const userRole = getRequestHeader(event, 'x-user-role')

    // Simulasi pengecekan RBAC
    // Di aplikasi nyata, Anda akan memverifikasi token di sini
    if (!authHeader || !authHeader.startsWith('Bearer dummy-token')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: Session tidak valid'
      })
    }

    if (!userRole || !['admin_cabang', 'admin_wilayah', 'admin_pusat'].includes(userRole)) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: Anda tidak memiliki akses administrator'
      })
    }
  }
})
