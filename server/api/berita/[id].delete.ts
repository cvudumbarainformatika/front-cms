import { beritaItems } from '../../data/berita'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const idx = beritaItems.findIndex(b => b.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Berita not found' })

  // Soft delete: tandai deletedAt
  ;(beritaItems[idx] as any).deletedAt = new Date().toISOString()
  return { success: true, data: beritaItems[idx] }
})
