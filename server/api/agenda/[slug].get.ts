import { getAgendaBySlug } from '../../data/agenda'

export default defineEventHandler((event) => {
  const { slug } = event.context.params as { slug: string }
  const item = getAgendaBySlug(slug)

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Agenda tidak ditemukan' })
  }

  return {
    success: true,
    data: item
  }
})
