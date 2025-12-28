/**
 * GET /api/berita
 * Mengambil list berita dengan pagination dan filter
 */

import { getAllBerita } from '../../data/berita'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 9
  const category = query.category as string
  const author = query.author as string
  const search = query.search as string
  const month = query.month as string // format: YYYY-MM
  const sort = (query.sort as string) || '' // 'popular' untuk urut berdasarkan views

  let items = getAllBerita()

  // Filter by category
  if (category) {
    items = items.filter(item => item.category === category)
  }

  // Filter by author
  if (author) {
    items = items.filter(item => item.author === author)
  }

  // Filter by month (YYYY-MM)
  if (month) {
    items = items.filter(item => {
      const d = new Date(item.publishedAt)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return ym === month
    })
  }

  // Search (on the filtered set) - hanya pada konten berita
  if (search) {
    const lower = search.toLowerCase()
    items = items.filter(item => item.content?.toLowerCase().includes(lower))
  }

  // Sorting
  if (sort === 'popular') {
    items = items.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
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
