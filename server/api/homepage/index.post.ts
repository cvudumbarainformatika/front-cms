/**
 * POST /api/homepage
 * Memperbarui data beranda (Hero, Stats, Features, SEO)
 * Hanya untuk role Admin
 */

import { updateHomepageData } from '../../data/homepage'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body is required'
    })
  }

  const updatedData = updateHomepageData(body)

  return {
    success: true,
    data: updatedData,
    message: 'Konten beranda berhasil diperbarui'
  }
})
