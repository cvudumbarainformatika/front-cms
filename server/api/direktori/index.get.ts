/**
 * GET /api/direktori
 * Mengambil data direktori rumah sakit/klinik
 */

import { getAllDirektori, getDirektoriByProvince, getDirektoriByType, searchDirektori } from '../../data/direktori'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  const province = query.province as string
  const type = query.type as string
  const search = query.search as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  let items = getAllDirektori()

  // Filter by province
  if (province) {
    items = getDirektoriByProvince(province)
  }

  // Filter by type
  if (type) {
    items = getDirektoriByType(type)
  }

  // Search
  if (search) {
    items = searchDirektori(search)
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
    message: 'Direktori fetched successfully'
  }
})
