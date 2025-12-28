import { beritaItems } from '../../data/berita'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const body = await readBody<any>(event)
  const idx = beritaItems.findIndex(b => b.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Berita not found' })

  const now = new Date().toISOString()
  const exists = beritaItems[idx]

  const slug = (body.slug || exists.slug)
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  // Slug unik jika berubah
  if (slug !== exists.slug && (beritaItems as any).some((b: any) => b.slug === slug && b.id !== id && !b.deletedAt)) {
    throw createError({ statusCode: 409, statusMessage: 'Slug sudah digunakan' })
  }

  const updated = {
    ...exists,
    slug,
    title: body.title ?? exists.title,
    excerpt: body.excerpt ?? exists.excerpt,
    content: body.content ?? exists.content,
    image: body.image ?? exists.image,
    category: body.category ?? exists.category,
    tags: Array.isArray(body.tags) ? body.tags : exists.tags,
    author: body.author ?? exists.author,
    status: body.status ?? exists.status,
    publishedAt: body.status === 'published' && !exists.publishedAt ? now : (body.publishedAt ?? exists.publishedAt),
    updatedAt: now,
    deletedAt: exists.deletedAt || ''
  }

  beritaItems[idx] = updated as any

  return { success: true, data: updated }
})
