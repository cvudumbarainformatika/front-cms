import { defineEventHandler, getRequestURL, proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  
  // Hanya intercept jika path dimulai dengan /backend
  if (!url.pathname.startsWith('/backend')) {
    return // Lanjutkan ke handler berikutnya
  }

  const config = useRuntimeConfig()
  const target = config.apiSecretTarget || 'http://localhost:8080'
  
  // Rewrite path: /backend/foo -> /api/v1/foo
  const path = url.pathname.replace(/^\/backend/, '/api/v1')
  const targetUrl = `${target}${path}${url.search}` // Include query string
  
  console.log(`[Backend Proxy Middleware] ${url.pathname} -> ${targetUrl}`)

  return proxyRequest(event, targetUrl)
})
