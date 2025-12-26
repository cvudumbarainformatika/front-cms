/**
 * GET /api/menus/:position
 * Mengambil menu berdasarkan position (header, sidebar, footer)
 */

import { headerMenus, sidebarMenus, footerMenus } from '../../data/menus'
import type { MenuPosition } from '../../types/menu'

export default defineEventHandler((event) => {
  const position = getRouterParam(event, 'position') as MenuPosition

  const validPositions: MenuPosition[] = ['header', 'sidebar', 'footer']

  if (!validPositions.includes(position)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid position. Must be one of: ${validPositions.join(', ')}`
    })
  }

  let data

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

  return {
    success: true,
    data,
    message: `${position} menus fetched successfully`
  }
})
