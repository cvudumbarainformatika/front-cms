/**
 * GET /api/agenda
 * Mengambil list agenda dengan filter
 */

import { getAllAgenda, getUpcomingAgenda, getAgendaByType } from '../../data/agenda'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  const upcoming = query.upcoming === 'true'
  const type = query.type as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 12

  let items = upcoming ? getUpcomingAgenda() : getAllAgenda()

  // Filter by type
  if (type) {
    items = getAgendaByType(type)
  }

  // Pagination
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedItems = items.slice(start, end)

  return {
    success: true,
    data: {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    },
    message: 'Agenda fetched successfully'
  }
})
