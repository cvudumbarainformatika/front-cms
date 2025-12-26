/**
 * GET /api/berita/:slug
 * Mengambil detail berita berdasarkan slug
 */

import { getBeritaBySlug } from '../../data/berita'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const berita = getBeritaBySlug(slug)

  if (!berita) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Berita not found'
    })
  }

  return {
    success: true,
    data: berita,
    message: 'Berita detail fetched successfully'
  }
})
