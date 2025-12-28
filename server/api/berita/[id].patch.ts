import { beritaItems } from '../../data/berita'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  const body = await readBody<{ status?: 'draft' | 'published', publishedAt?: string, deletedAt?: string }>(event)

  const idx = beritaItems.findIndex(b => b.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Berita not found' })

  const now = new Date().toISOString()
  const exists = beritaItems[idx]

  const updated = { ...exists }
  if (body.status) {
    updated.status = body.status
    if (body.status === 'published' && !updated.publishedAt) updated.publishedAt = now
    if (body.status === 'draft') updated.publishedAt = ''
  }
  if (body.publishedAt !== undefined) updated.publishedAt = body.publishedAt
  if (body.deletedAt !== undefined) updated.deletedAt = body.deletedAt
  updated.updatedAt = now

  beritaItems[idx] = updated as any
  return { success: true, data: updated }
})
