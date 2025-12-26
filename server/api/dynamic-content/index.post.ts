import { upsertDynamicContent } from '../../data/dynamicContent'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validasi: slug, title, dan minimal ada body atau html
  if (!body || !body.slug || !body.title) {
    throw createError({ statusCode: 400, statusMessage: 'slug dan title wajib diisi' })
  }
  
  if (!body.body && !body.html) {
    throw createError({ statusCode: 400, statusMessage: 'body atau html wajib diisi' })
  }

  const saved = upsertDynamicContent({
    slug: body.slug,
    title: body.title,
    description: body.description,
    body: body.body,
    html: body.html,
    date: body.date,
    image: body.image,
    authors: body.authors,
    badge: body.badge
  })

  console.log('[Dynamic Content] Saved:', { slug: saved.slug, title: saved.title, hasHtml: !!saved.html, hasBody: !!saved.body })

  return {
    success: true,
    data: saved,
    message: 'Konten dinamis berhasil disimpan'
  }
})
