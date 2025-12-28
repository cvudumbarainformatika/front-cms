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
  const status = (query.status as string) || '' // 'draft' | 'published' | 'all'

  let items = getAllBerita()

  // Normalize legacy fields on all items (status, deletedAt)
  items = items.map((it: any) => ({
    ...it,
    status: it?.status ?? 'published',
    deletedAt: it?.deletedAt ?? ''
  }))

  // Helper status: treat missing as 'published' for compatibility with legacy data
  const getStatus = (it: any) => (it?.status ?? 'published')

  // Soft delete handling: exclude deleted by default
  const isDeleted = (it: any) => !!it.deletedAt
  if (status === 'deleted') {
    items = items.filter(isDeleted)
  } else {
    items = items.filter(it => !isDeleted(it))
    // Filter by status (only on non-deleted)
    if (status && status !== 'all') {
      items = items.filter(item => getStatus(item) === status)
    } else if (!status) {
      // default untuk publik: hanya published jika status tidak dispesifikasikan
      items = items.filter(item => getStatus(item) !== 'draft')
    }
  }

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
