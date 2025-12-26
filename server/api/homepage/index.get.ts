/**
 * GET /api/homepage
 * Mengambil data beranda (Hero, Stats, Features, SEO)
 */

import { homepageData } from '../../data/homepage'

export default defineEventHandler(() => {
  return {
    success: true,
    data: homepageData,
    message: 'Homepage data fetched successfully'
  }
})
