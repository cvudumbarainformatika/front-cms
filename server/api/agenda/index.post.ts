import { agendaItems } from '../../data/agenda'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  if (!body?.title || !body?.description) {
    throw createError({ statusCode: 400, statusMessage: 'Title & description are required' })
  }
  const now = new Date().toISOString()
  const id = (Date.now()).toString(36)
  const slug = (body.slug || body.title || id).toString().toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

  const item = {
    id,
    slug,
    title: body.title,
    description: body.description || '',
    image: body.image || '',
    type: body.type || 'webinar',
    date: body.date || now,
    endDate: body.endDate || '',
    isOnline: !!body.isOnline,
    location: body.location || '',
    fee: body.fee || '',
    skp: body.skp ?? 0,
    registered: body.registered ?? 0,
    quota: body.quota ?? 0,
    registrationUrl: body.registrationUrl || '',
    status: body.status || 'draft',
    createdAt: now,
    updatedAt: now,
    deletedAt: ''
  }
  ;(agendaItems as any).unshift(item)
  return { success: true, data: item }
})