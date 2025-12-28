import { beritaItems } from '../../data/berita'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)

  // Basic validation
  if (!body?.title || !(body?.content || body?.excerpt)) {
    throw createError({ statusCode: 400, statusMessage: 'Title and content/excerpt are required' })
  }

  const now = new Date().toISOString()
  const id = (Date.now()).toString(36)

  const slug = (body.slug || body.title || id)
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  // Slug unik
  if ((beritaItems as any).some((b: any) => b.slug === slug && !b.deletedAt)) {
    throw createError({ statusCode: 409, statusMessage: 'Slug sudah digunakan' })
  }

  const item = {
    id,
    slug,
    title: body.title,
    excerpt: body.excerpt || '',
    content: body.content || '',
    image: body.image || '',
    category: body.category || '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    author: body.author || 'Admin',
    status: body.status || 'draft',
    publishedAt: body.publishedAt || (body.status === 'published' ? now : ''),
    createdAt: now,
    updatedAt: now,
    deletedAt: '',
    views: 0
  }

  // push to memory (mock)
  ;(beritaItems as any).unshift(item)

  return { success: true, data: item }
})
