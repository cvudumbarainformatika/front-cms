/**
 * GET /api/menus
 * Mengambil semua menu atau filter by position
 */

import { allMenus, headerMenus, sidebarMenus, footerMenus } from '../../data/menus'
import type { MenuPosition } from '../../types/menu'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const position = query.position as MenuPosition | undefined

  let data = allMenus

  if (position) {
    switch (position) {
      case 'header':
        data = headerMenus
        break
      case 'sidebar':
        data = sidebarMenus
        break
      case 'footer':
        data = footerMenus
        break
    }
  }

  return {
    success: true,
    data,
    message: 'Menus fetched successfully'
  }
})
