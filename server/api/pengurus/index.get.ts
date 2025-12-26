/**
 * GET /api/pengurus
 * Mengambil data pengurus organisasi
 */

import { pengurusItems, getPengurusByLevel } from '../../data/pengurus'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const level = query.level as string

  const items = level ? getPengurusByLevel(level) : pengurusItems

  return {
    success: true,
    data: items,
    message: 'Pengurus fetched successfully'
  }
})
