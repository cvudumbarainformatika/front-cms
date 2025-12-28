import { agendaItems } from '../../data/agenda'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const idx = (agendaItems as any).findIndex((a: any) => a.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Agenda not found' })

  ;(agendaItems as any)[idx].deletedAt = new Date().toISOString()
  return { success: true, data: (agendaItems as any)[idx] }
})