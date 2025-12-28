import { agendaItems } from '../../data/agenda'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  const body = await readBody<{ status?: 'draft'|'published', deletedAt?: string }>(event)

  const idx = agendaItems.findIndex(a => a.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Agenda not found' })

  const now = new Date().toISOString()
  const exists: any = agendaItems[idx]
  const updated: any = { ...exists, updatedAt: now }
  if (body.status) updated.status = body.status
  if (body.deletedAt !== undefined) updated.deletedAt = body.deletedAt

  agendaItems[idx] = updated
  return { success: true, data: updated }
})