/**
 * GET /api/berita
 * Mengambil list berita dengan pagination dan filter
 */

import { getAllBerita, getBeritaByCategory, searchBerita } from '../../data/berita'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 9
  const category = query.category as string
  const search = query.search as string

  let items = getAllBerita()

  // Filter by category
  if (category) {
    items = getBeritaByCategory(category)
  }

  // Search
  if (search) {
    items = searchBerita(search)
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
    message: 'Berita fetched successfully'
  }
})
