import { agendaItems } from '../../data/agenda'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  const body = await readBody<any>(event)

  const idx = agendaItems.findIndex(a => a.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Agenda not found' })

  const exists: any = agendaItems[idx]
  const now = new Date().toISOString()
  const slug = (body.slug || exists.slug).toString().toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

  // ensure unique slug among non-deleted
  if (slug !== exists.slug && (agendaItems as any).some((a: any) => a.slug === slug && a.id !== id && !a.deletedAt)) {
    throw createError({ statusCode: 409, statusMessage: 'Slug sudah digunakan' })
  }

  const updated = {
    ...exists,
    slug,
    title: body.title ?? exists.title,
    description: body.description ?? exists.description,
    image: body.image ?? exists.image,
    type: body.type ?? exists.type,
    date: body.date ?? exists.date,
    endDate: body.endDate ?? exists.endDate,
    isOnline: body.isOnline ?? exists.isOnline,
    location: body.location ?? exists.location,
    fee: body.fee ?? exists.fee,
    skp: body.skp ?? exists.skp,
    registered: body.registered ?? exists.registered,
    quota: body.quota ?? exists.quota,
    registrationUrl: body.registrationUrl ?? exists.registrationUrl,
    status: body.status ?? exists.status,
    updatedAt: now,
    deletedAt: exists.deletedAt || ''
  }
  agendaItems[idx] = updated as any
  return { success: true, data: updated }
})